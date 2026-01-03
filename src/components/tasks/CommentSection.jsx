import React, { useState } from "react";

export default function CommentSection({
    comments = [],
    onAddComment,
    user,
    isLoading = false,
    disabled = false
}) {
    const [newComment, setNewComment] = useState("");

    const handleSubmit = async () => {
        // ✅ No e.preventDefault() needed — not a form submit
        if (!newComment.trim() || disabled) return;

        try {
            await onAddComment(newComment.trim());
            setNewComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
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
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="comment-section" role="region" aria-labelledby="comments-title">
            <h3 id="comments-title" className="section-title">Comments</h3>

            {/* Comment input — NOT a <form> */}
            <div className="comment-form">
                <div className="comment-input-container">
                    <div
                        className="avatar initials"
                        aria-label={`User: ${user?.full_name || user?.email || 'Unknown'}`}
                        role="img"
                        tabIndex="0"
                    >
                        {getUserInitials(user?.full_name || user?.email)}
                    </div>
                    <div className="comment-input-wrapper">
                        <textarea
                            id="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={disabled ? "Comments disabled" : "Write a comment..."}
                            className="comment-textarea"
                            disabled={disabled || isLoading}
                            aria-label="Write a comment"
                            rows={3}
                            aria-describedby="comment-submit-btn"
                        />
                        <div className="comment-actions">
                            <button
                                id="comment-submit-btn"
                                type="button" // ✅ Critical: not "submit"
                                onClick={handleSubmit}
                                disabled={!newComment.trim() || disabled || isLoading}
                                className="comment-submit-btn"
                                aria-label="Post comment"
                            >
                                {isLoading ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments list */}
            <div className="comments-list" role="list">
                {comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item" role="listitem">
                            <div className="comment-header">
                                <div
                                    className="avatar initials small"
                                    aria-label={`Comment by: ${comment.user_name}`}
                                    role="img"
                                    tabIndex="0"
                                >
                                    {getUserInitials(comment.user_name)}
                                </div>
                                <div className="comment-author-info">
                                    <span className="comment-author">{comment.user_name}</span>
                                    <span className="comment-date" title={comment.created_at}>
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="comment-content">
                                <p className="comment-text">{comment.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
