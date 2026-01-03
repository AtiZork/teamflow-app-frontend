// src/components/MembersList.jsx
import React, { useState, useEffect } from 'react';
import { getOrganizationMembers, removeMemberFromOrganization } from '../../api/users';
import { getCurrentUser } from '../../api/auth';
import ConfirmationModal from '../modals/ConfirmationModal';
import toast from 'react-hot-toast';
import styles from "../../styles/MemberList.module.css";

const MembersList = () => {
    const [members, setMembers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedMembers, setSelectedMembers] = useState(new Set());
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => { },
        isBulk: false,
    });

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const [membersData, userData] = await Promise.all([
                getOrganizationMembers(),
                getCurrentUser(),
            ]);
            setMembers(membersData);
            setCurrentUser(userData);
        } catch (err) {
            setError(err.message);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (memberId, memberName) => {
        try {
            await removeMemberFromOrganization(memberId);
            setMembers((prev) => prev.filter((member) => member.id !== memberId));
            setSelectedMembers((prev) => {
                const newSelection = new Set(prev);
                newSelection.delete(memberId);
                return newSelection;
            });
            toast.success(`Successfully removed ${memberName} from organization`);
        } catch (error) {
            console.error("Delete member error:", error);
            if (error.message.includes("cannot delete your own account")) {
                toast.error("You cannot remove yourself from the organization");
            } else if (error.message.includes("organization owner")) {
                toast.error("Cannot remove organization owner. Please transfer ownership first.");
            } else if (error.message.includes("owns projects")) {
                toast.error(
                    `Cannot remove ${memberName} because they own projects. Please transfer ownership first.`
                );
            } else {
                toast.error(error.message || "Failed to remove member");
            }
        }
    };

    const handleSelectMember = (memberId) => {
        setSelectedMembers((prev) => {
            const newSelection = new Set(prev);
            newSelection.has(memberId)
                ? newSelection.delete(memberId)
                : newSelection.add(memberId);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        if (selectedMembers.size === members.length) {
            setSelectedMembers(new Set());
        } else {
            setSelectedMembers(new Set(members.map((m) => m.id)));
        }
    };

    const showRemoveConfirmation = (memberId = null, isBulk = false) => {
        if (isBulk) {
            setConfirmationConfig({
                title: "Remove Selected Members",
                message: `Are you sure you want to remove ${selectedMembers.size} member(s) from the organization?`,
                onConfirm: handleBulkRemove,
                isBulk: true,
            });
        } else {
            const member = members.find((m) => m.id === memberId);
            setConfirmationConfig({
                title: "Remove Member",
                message: `Are you sure you want to remove ${member?.email} from the organization?`,
                onConfirm: () => handleDeleteMember(memberId, member?.email),
                isBulk: false,
            });
        }
        setShowConfirmation(true);
    };

    const handleBulkRemove = async () => {
        try {
            const results = await Promise.all(
                Array.from(selectedMembers).map(async (userId) => {
                    const member = members.find((m) => m.id === userId);
                    try {
                        await removeMemberFromOrganization(userId);
                        return { success: true, userId, memberName: member?.email };
                    } catch (error) {
                        return { success: false, userId, error, memberName: member?.email };
                    }
                })
            );

            const successful = results.filter((r) => r.success);
            const failed = results.filter((r) => !r.success);
            const successfulIds = successful.map((r) => r.userId);

            setMembers((prev) => prev.filter((m) => !successfulIds.includes(m.id)));
            setSelectedMembers(new Set());

            if (successful.length > 0) toast.success(`Removed ${successful.length} member(s)`);
            if (failed.length > 0) toast.error(failed[0].error.message || "Some removals failed");
        } catch (err) {
            toast.error(err.message || "Failed to remove selected members");
        }
    };

    const isSuperAdmin = currentUser?.role === "super_admin";
    const hasSelectedMembers = selectedMembers.size > 0;

    if (loading)
        return (
            <div className={styles.state}>
                <div className={styles.spinner}></div>
                <p>Loading members...</p>
            </div>
        );

    if (error)
        return (
            <div className={styles.state}>
                <p>Error: {error}</p>
                <button onClick={loadMembers} className={`${styles.btn} ${styles.primary}`}>
                    Try Again
                </button>
            </div>
        );

    return (
        <div className={styles.membersList}>
            <div className={styles.header}>
                <h2>Organization Members</h2>

                {isSuperAdmin && hasSelectedMembers && (
                    <div className={styles.controls}>
                        <span className={styles.selectionCounter}>
                            {selectedMembers.size} selected
                        </span>
                        <button
                            className={`${styles.btn} ${styles.danger}`}
                            onClick={() => showRemoveConfirmation(null, true)}
                        >
                            Remove Selected
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={confirmationConfig.onConfirm}
                title={confirmationConfig.title}
                message={confirmationConfig.message}
                confirmText="Yes, Remove"
                cancelText="Cancel"
                variant="danger"
            />

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {isSuperAdmin && (
                                <th className={styles.selectColumn}>
                                    <input
                                        type="checkbox"
                                        checked={selectedMembers.size === members.length && members.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            {isSuperAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member) => (
                            <tr key={member.id}>
                                {isSuperAdmin && (
                                    <td className={styles.selectColumn}>
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.has(member.id)}
                                            onChange={() => handleSelectMember(member.id)}
                                            disabled={member.id === currentUser?.id}
                                        />
                                    </td>
                                )}
                                <td>
                                    <div className={styles.memberInfo}>
                                        <span className={styles.memberName}>{member.full_name}</span>
                                        {member.id === currentUser?.id && <span className={styles.you}>You</span>}
                                    </div>
                                </td>
                                <td>{member.email}</td>
                                <td>
                                    <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                                        {member.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`${styles.statusBadge} ${member.is_active ? styles.active : styles.inactive
                                            }`}
                                    >
                                        {member.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                {isSuperAdmin && (
                                    <td>
                                        {member.id !== currentUser?.id && (
                                            <button
                                                className={`${styles.btn} ${styles.danger} ${styles.sm}`}
                                                onClick={() => showRemoveConfirmation(member.id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {members.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>👥</div>
                        <h3>No Members Found</h3>
                        <p>Invite team members to your organization to get started.</p>
                        <button className={`${styles.btn} ${styles.primary}`}>
                            Invite Members
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembersList;
