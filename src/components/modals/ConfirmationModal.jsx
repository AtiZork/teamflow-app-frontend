// src/components/modals/ConfirmationModal.jsx
import React from 'react';
import BaseModal from './BaseModal';

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation error:", error);
      // Don't close modal on error, let parent handle it
    }
  };

  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        {cancelText}
      </button>
      <button type="button" className="btn btn-primary" onClick={handleConfirm}>
        {confirmText}
      </button>
    </>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <p className="form-label">{message}</p>
    </BaseModal>
  );
}