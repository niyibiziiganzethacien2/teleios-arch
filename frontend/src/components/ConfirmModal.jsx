export default function ConfirmModal({ message, onConfirm, onCancel }) {
  if (!message) return null;
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <p className="confirm-modal__msg">{message}</p>
        <div className="confirm-modal__actions">
          <button className="admin__btn admin__btn--danger" onClick={onConfirm}>Delete</button>
          <button className="admin__btn admin__btn--ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
