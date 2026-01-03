
// src/components/modals/InviteMemberModal.jsx
import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { sendInvitation } from "../../api/invitation.js"; // ✅ Import directly from invitation.js
import toast from 'react-hot-toast';

export default function InviteMemberModal({
  isOpen,
  onClose,
  onSave, // Optional callback after successful invitation
  title = "Send New Invite",
  submitText = "Send Invite",
}) {
  const [formData, setFormData] = useState({
    email: "",
    role: "member",
    message: "" // Optional message field
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        email: "",
        role: "member",
        message: ""
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email.trim()) {
      toast.error("Please enter email address");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // ✅ Use sendInvitation directly (the named export from invitation.js)
      const result = await sendInvitation({
        email: formData.email.trim(),
        role: formData.role
        // Note: Backend doesn't currently use 'message' field, but we can keep it for future use
      });

      toast.success(result.message || "Invitation sent successfully!");
      
      // Call optional onSave callback if provided
      if (onSave) {
        onSave(result);
      }
      
      // Close modal
      onClose();

    } catch (error) {
      console.error("Failed to send invitation:", error);

      // Extract backend detail if available
      const detail =
        error?.response?.data?.detail ||
        error?.detail ||
        error?.message ||
        "Failed to send invitation";

      // Detect member limit message from backend
      if (detail.toLowerCase().includes("member limit")) {
        toast.error(detail);
      } else {
        toast.error(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const footer = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={onClose}
        disabled={loading}
      >
        Cancel
      </button>
      <button 
        type="submit" 
        form="invite-form" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Sending..." : submitText}
      </button>
    </>
  );

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <form id="invite-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role *</label>
          <div className="radio-group">
            {[
              { 
                value: "admin", 
                label: "Admin", 
                description: "Full access to all features, projects, and user management" 
              },
              { 
                value: "member", 
                label: "Member", 
                description: "Can work on assigned tasks and projects" 
              }
            ].map((option) => (
              <label key={option.value} className="radio-option" style={{ display: 'block', marginBottom: '8px' }}>
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={() => handleInputChange('role', option.value)}
                  disabled={loading}
                  style={{ marginRight: '8px' }}
                />
                <div className="radio-content">
                  <div className="radio-header">
                    <span className="radio-label" style={{ fontWeight: '500' }}>{option.label}</span>
                  </div>
                  <p className="radio-description" style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#6b7280' }}>{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Personal Message (Optional)</label>
          <textarea
            placeholder="Add a personal message to include in the invitation email..."
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="form-textarea"
            rows="3"
            disabled={loading}
          />
          <small className="form-help" style={{ color: '#6b7280', fontSize: '8px', marginTop: '4px', display: 'block' }}>
            Note: This message will be included in the invitation email
          </small>
        </div>

        <div className="form-info" style={{ 
          background: '#f8f9fa', 
          padding: '12px', 
          borderRadius: '6px', 
          marginTop: '16px', 
          fontSize: '14px' 
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}><strong>How it works:</strong></p>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '4px' }}>User will receive an email with invitation link</li>
            <li style={{ marginBottom: '4px' }}>Link expires in 7 days</li>
            <li style={{ marginBottom: '4px' }}>User can set their password when accepting</li>
          </ul>
        </div>
      </form>
    </BaseModal>
  );
}