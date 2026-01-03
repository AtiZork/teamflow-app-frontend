import React, { useState } from "react";
export default function WorkLogSection({
    workLogs = [],
    onAddWorkLog,
    user,
    isLoading = false,
    disabled = false
}) {
    const [hours, setHours] = useState("");
    const [date, setDate] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        if (!hours || !date || parseFloat(hours) <= 0 || disabled) return;

        try {
            await onAddWorkLog({
                hours: parseFloat(hours),
                date: new Date(date).toISOString(),
                description: description.trim() || null
            });
            setHours("");
            setDate("");
            setDescription("");
        } catch (error) {
            console.error("Failed to add work log:", error);
        }
    };

    const getUserInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatTime = (hours) => {
        const hrs = Math.floor(hours);
        const mins = Math.round((hours - hrs) * 60);
        if (mins === 0) return `${hrs}h`;
        return `${hrs}h ${mins}m`;
    };

    return (
        <div className="worklog-section" role="region" aria-labelledby="worklogs-title">
            <h3 id="worklogs-title" className="section-title">Work Logs</h3>

            {/* ✅ Always show input form (like CommentSection) */}
            {!disabled && (
                <div id="worklog-form" className="worklog-form" role="form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="worklog-hours" className="form-label">Hours *</label>
                            <input
                                id="worklog-hours"
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={hours}
                                onChange={(e) => setHours(e.target.value)}
                                className="form-input"
                                required
                                placeholder="1.5"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="worklog-date" className="form-label">Date *</label>
                            <input
                                id="worklog-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="worklog-description" className="form-label">Description</label>
                        <textarea
                            id="worklog-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-textarea"
                            rows="2"
                            placeholder="What did you work on?"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!hours || !date || parseFloat(hours) <= 0 || isLoading}
                            className="btn btn-primary"
                        >
                            {isLoading ? "Logging..." : "Add Work Log"}
                        </button>
                    </div>
                </div>
            )}

            {/* Existing work logs list */}
            <div className="worklogs-list">
                {workLogs.length === 0 ? (
                    <p className="no-worklogs">No work logs yet.</p>
                ) : (
                    <table className="worklogs-table" role="table">
                        <thead>
                            <tr role="row">
                                <th scope="col">User</th>
                                <th scope="col">Hours</th>
                                <th scope="col">Date</th>
                                <th scope="col">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workLogs.map((log) => (
                                <tr key={log.id} role="row">
                                    <td role="cell">
                                        <div className="worklog-user">
                                            <div
                                                className="avatar initials small"
                                                aria-label={`Logged by: ${log.user_name}`}
                                                role="img"
                                                tabIndex="0"
                                            >
                                                {getUserInitials(log.user_name)}
                                            </div>
                                            <span>{log.user_name}</span>
                                        </div>
                                    </td>
                                    <td role="cell">{formatTime(log.hours)}</td>
                                    <td role="cell">{formatDate(log.date)}</td>
                                    <td role="cell">{log.description || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
