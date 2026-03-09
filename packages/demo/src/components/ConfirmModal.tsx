import { useModal } from '@prismui/react';

export function ConfirmModal() {
  const { close } = useModal();

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Action</h3>
        <p>
          Are you sure you want to proceed? This modal was opened via the Modal module controller.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={() => close('confirm')}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={() => close('confirm')}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
