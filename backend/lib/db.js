const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function dataFile(name) {
  return path.join(dataDir, `${name}.json`);
}

async function readJson(file) {
  try {
    const txt = await fs.readFile(file, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

async function writeJson(file, obj) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(obj, null, 2), 'utf8');
}

module.exports = { readJson, writeJson, dataFile, dataDir };
