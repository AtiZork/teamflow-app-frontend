import React from "react";

export default function PermissionToggle({ enabled, onToggle, disabled = false }) {
    const handleToggle = (e) => {
        if (!disabled) {
            // Pass the *new* value to the parent component's handler
            onToggle(e.target.checked);
        }
    };

    return (
        <div className="permission-toggle">
            <label className="permission-label">
                <div className="permission-switch">
                    {/* Use 'checked' to control the input's state, 'onChange' to handle changes */}
                    <input
                        type="checkbox"
                        checked={enabled} // Use 'enabled' prop to control the state
                        onChange={handleToggle} // Use 'handleToggle' to manage the state change
                        className="permission-checkbox"
                        disabled={disabled}
                        aria-label="Allow members to edit this task"
                    />
                    <span className={`permission-slider ${disabled ? 'disabled' : ''}`}></span>
                </div>
            </label>
        </div>
    );
}
