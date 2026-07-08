const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const cache = {};
const seq = {};

function loadTable(name) {
  const fp = path.join(dataDir, `${name}.json`);
  if (fs.existsSync(fp)) {
    cache[name] = JSON.parse(fs.readFileSync(fp, 'utf8'));
  } else {
    cache[name] = [];
  }
  seq[name] = cache[name].reduce((m, r) => Math.max(m, r.id || 0), 0);
}

function saveTable(name) {
  fs.writeFileSync(path.join(dataDir, `${name}.json`), JSON.stringify(cache[name], null, 2), 'utf8');
}

function getTable(name) {
  if (!cache[name]) loadTable(name);
  return cache[name];
}

// ---- SQL helpers ----

const RE_SEL  = /^SELECT\s+(.*?)\s+FROM\s+(\w+)/i;
const RE_INS  = /^INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i;
const RE_UPD  = /^UPDATE\s+(\w+)\s+SET\s+(.+?)\s+WHERE\s+(.+?)$/i;
const RE_DEL  = /^DELETE\s+FROM\s+(\w+)\s+WHERE\s+(.+?)$/i;
const RE_ORD  = /ORDER\s+BY\s+(\w+)\s*(DESC)?/i;
const RE_COL  = /"?(\w+)"?\s*=\s*\?/g;
const RE_SET  = /"?(\w+)"?\s*=\s*(?:COALESCE\(\?,\s*"?(\w+)"?\)|\?)/g;
const RE_LIM  = /LIMIT\s+(\d+)/i;

function colNamesFromWhere(sql) {
  RE_COL.lastIndex = 0;
  const cols = [];
  let m;
  while ((m = RE_COL.exec(sql)) !== null) cols.push(m[1]);
  return cols;
}

function parseSelectCols(colStr) {
  if (colStr.trim() === '*') return null;
  const reAlias = /(\w+)\s+AS\s+"?(\w+)"?/gi;
  return colStr.split(',').map(s => s.trim()).map(c => {
    reAlias.lastIndex = 0;
    const a = reAlias.exec(c);
    if (a) return { alias: a[2], col: a[1] };
    const clean = c.replace(/"/g, '');
    return { alias: clean, col: clean };
  });
}

function parseSetClauses(setStr) {
  RE_SET.lastIndex = 0;
  const clauses = [];
  let m;
  while ((m = RE_SET.exec(setStr)) !== null) {
    clauses.push({ col: m[1], fallback: m[2] || null });
  }
  return clauses;
}

function matchRow(row, whereCols, params) {
  for (let i = 0; i < whereCols.length; i++) {
    if (row[whereCols[i]] !== params[i]) return false;
  }
  return true;
}

function applyOrder(rows, orderCol, desc) {
  return [...rows].sort((a, b) => {
    const va = a[orderCol], vb = b[orderCol];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'number' && typeof vb === 'number')
      return desc ? vb - va : va - vb;
    return desc
      ? String(vb).localeCompare(String(va))
      : String(va).localeCompare(String(vb));
  });
}

// ---- query engine ----

async function query(sql, params) {
  params = params || [];

  // INSERT
  let m;
  if ((m = sql.match(RE_INS))) {
    const table = m[1];
    const cols = m[2].split(',').map(c => c.trim().replace(/"/g, ''));
    const data = getTable(table);
    const row = { id: ++seq[table] };
    cols.forEach((c, i) => { row[c] = params[i]; });
    data.push(row);
    saveTable(table);
    return [[], { insertId: row.id, affectedRows: 1 }];
  }

  // SELECT
  if ((m = sql.match(RE_SEL))) {
    const table = m[2], colStr = m[1];
    const data = getTable(table);
    const whereCols = colNamesFromWhere(sql);
    let rows = whereCols.length ? data.filter(r => matchRow(r, whereCols, params)) : data;
    const ord = RE_ORD.exec(sql);
    if (ord) rows = applyOrder(rows, ord[1].replace(/"/g, ''), !!ord[2]);
    const lim = RE_LIM.exec(sql);
    if (lim) rows = rows.slice(0, parseInt(lim[1], 10));
    if (colStr.trim() === '*') return [rows, {}];
    const colMap = parseSelectCols(colStr);
    rows = rows.map(r => {
      const obj = {};
      for (const { alias, col } of colMap) obj[alias] = r[col] !== undefined ? r[col] : null;
      return obj;
    });
    return [rows, {}];
  }

  // UPDATE
  if ((m = sql.match(RE_UPD))) {
    const table = m[1], setStr = m[2], whereStr = m[3];
    const data = getTable(table);
    const setClauses = parseSetClauses(setStr);
    const whereCols = colNamesFromWhere(whereStr);
    const setCount = setClauses.length;
    const whereParams = params.slice(setCount);
    const setParams = params.slice(0, setCount);
    const matched = data.filter(r => matchRow(r, whereCols, whereParams));
    for (const row of matched) {
      setClauses.forEach((sc, i) => {
        if (sc.fallback) {
          row[sc.col] = (setParams[i] != null && setParams[i] !== '') ? setParams[i] : row[sc.col];
        } else {
          row[sc.col] = setParams[i];
        }
      });
    }
    saveTable(table);
    return [[], { affectedRows: matched.length }];
  }

  // DELETE
  if ((m = sql.match(RE_DEL))) {
    const table = m[1], whereStr = m[2];
    const data = getTable(table);
    const whereCols = colNamesFromWhere(whereStr);
    const before = data.length;
    cache[table] = data.filter(r => !matchRow(r, whereCols, params));
    saveTable(table);
    return [[], { affectedRows: before - cache[table].length }];
  }

  throw new Error(`Unsupported SQL: ${sql.substring(0, 80)}`);
}

async function init() {}
const readyPromise = Promise.resolve();

module.exports = { query, init, readyPromise };
