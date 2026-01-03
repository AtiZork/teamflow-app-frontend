import React from "react";

const ViewIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export default function TaskCard({
    title,
    tasks,
    onAdd,
    onEdit,
    onView,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    onDragLeave,
    showAddButton = true,
    users
}) {
    const taskCount = tasks.length;

    return (
        <div
            className="task-column"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="column-header">
                <h3>{title} ({taskCount})</h3>
                {showAddButton && (
                    <button className="add-task-btn" onClick={onAdd} title="Add a new task">
                        +
                    </button>
                )}
            </div>

            <div className="column-content">
                {tasks.length === 0 ? (
                    <div className="empty-state">
                        <p>No tasks yet</p>
                    </div>
                ) : (
                    tasks.map((task) => {
                        const taskId = `TASK-${task.id || Math.floor(Math.random() * 1000)}`;
                        const safeUsers = users || [];

                        const memberAvatars = [];

                        if (task.member_ids && Array.isArray(task.member_ids)) {
                            memberAvatars.push(...task.member_ids.map((memberId) => {
                                const member = safeUsers.find((u) => u.id === memberId);
                                return member ? {
                                    id: member.id,
                                    name: member.name || member.full_name || 'Unknown',
                                    avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.full_name || 'User')}&background=random`,
                                } : null;
                            }).filter(Boolean));
                        } else if (task.member_id) {
                            const member = safeUsers.find((u) => u.id === task.member_id);
                            if (member) {
                                memberAvatars.push({
                                    id: member.id,
                                    name: member.name || member.full_name || 'Unknown',
                                    avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.full_name || 'User')}&background=random`,
                                });
                            }
                        }

                        return (
                            <div
                                key={task.id}
                                className="task-card"
                                draggable
                                onDragStart={() => onDragStart(task)}
                                data-task-id={task.id}
                            >
                                <div className="task-header">
                                    <div className="task-id">{taskId}</div>
                                    <div className="task-actions">
                                        {/* ✅ View Button */}
                                        <button
                                            className="task-action-btn task-view-btn"
                                            onClick={() => onView(task)}
                                            title="View task details"
                                            aria-label="View task"
                                        >
                                            <ViewIcon />
                                        </button>

                                        {/* ✅ Edit Button */}
                                        <button
                                            className="task-action-btn task-edit-btn"
                                            onClick={() => onEdit(task)}
                                            title="Edit task"
                                            aria-label="Edit task"
                                        >
                                            <EditIcon />
                                        </button>

                                        {/* ✅ Delete Button */}
                                        <button
                                            className="task-action-btn task-delete-btn"
                                            onClick={() => onDelete(task.id)}
                                            title="Delete task"
                                            aria-label="Delete task"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>

                                <div className="task-title">
                                    {task.title}
                                </div>

                                {task.description && (
                                    <div className="task-description">
                                        {task.description}
                                    </div>
                                )}

                                <div className="task-footer">
                                    <div className="task-meta">
                                        <span className="project-tag">{task.project_name || 'No Project'}</span>

                                        {task.priority && (
                                            <span className={`priority-tag priority-${task.priority}`}>
                                                {task.priority.toUpperCase()}
                                            </span>
                                        )}

                                        {task.due_date && (
                                            <span className="due-date">
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="member-avatars">
                                        {memberAvatars.slice(0, 3).map((member, index) => (
                                            <div key={member.id} className="avatar">
                                                {member.avatar ? (
                                                    <img src={member.avatar} alt={member.name} />
                                                ) : (
                                                    <span>{member.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        ))}

                                        {memberAvatars.length > 3 && (
                                            <div className="avatar-more">+{memberAvatars.length - 3}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
