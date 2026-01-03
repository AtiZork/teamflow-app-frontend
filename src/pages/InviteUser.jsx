// src/pages/InviteMembers.jsx
import toast from "react-hot-toast";
import { useState, useContext, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header.jsx";
import InviteMemberModal from "../components/modals/InviteMemberModal"; // Use your existing modal
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { invitationAPI } from "../api/invitationAPI";
import { getOrganizationMembers } from "../api/users";
import { AuthContext } from "../context/AuthContext";

export default function InviteMembers() {
  useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { }
  });
  const [invitations, setInvitations] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [resendingInvitation, setResendingInvitation] = useState(null);
  const [revokingInvitation, setRevokingInvitation] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoadingInvitations(true);
      const [invitationsData, membersData] = await Promise.all([
        invitationAPI.getMyInvitations(),
        getOrganizationMembers()
      ]);

      setInvitations(invitationsData);
      setCurrentMembers(membersData);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoadingInvitations(false);
    }
  };

  const getFilteredInvitations = () => {
    const currentMemberEmails = new Set(currentMembers.map(member => member.email));

    return invitations.filter(invitation => {
      if (invitation.status === 'accepted' && !currentMemberEmails.has(invitation.email)) {
        return false;
      }
      return true;
    });
  };

  const handleInvitationSent = (result) => {
    loadAllData();
    setShowModal(false);
    toast.success("Invitation sent successfully!");
  };

  const handleResendInvitation = async (invitation) => {
    const isDeletedMember = invitation.status === 'accepted' &&
      !currentMembers.some(member => member.email === invitation.email);

    if (isDeletedMember) {
      setConfirmationConfig({
        title: "Send New Invitation",
        message: `Send a new invitation to ${invitation.email}? This will create a fresh invitation.`,
        onConfirm: async () => {
          try {
            setResendingInvitation(invitation.email);
            await invitationAPI.sendInvitation({
              email: invitation.email,
              role: invitation.role
            });
            toast.success("New invitation sent successfully!");
            loadAllData();
          } catch (error) {
            console.error("Failed to send new invitation:", error);
            toast.error(error.message || "Failed to send invitation");
          } finally {
            setResendingInvitation(null);
          }
        }
      });
    } else {
      setConfirmationConfig({
        title: "Resend Invitation",
        message: `Are you sure you want to resend the invitation to ${invitation.email}?`,
        onConfirm: async () => {
          try {
            setResendingInvitation(invitation.email);
            await invitationAPI.resendInvitation(invitation.email);
            toast.success("Invitation resent successfully!");
            loadAllData();
          } catch (error) {
            console.error("Failed to resend invitation:", error);

            if (error.message.includes('No pending invitation found')) {
              toast.error(`No active invitation found for ${invitation.email}. Creating new invitation...`);
              try {
                await invitationAPI.sendInvitation({
                  email: invitation.email,
                  role: invitation.role
                });
                toast.success("New invitation created successfully!");
                loadAllData();
              } catch (newInviteError) {
                toast.error(newInviteError.message || "Failed to create new invitation");
              }
            } else {
              toast.error(error.message || "Failed to resend invitation");
            }
          } finally {
            setResendingInvitation(null);
          }
        }
      });
    }
    setShowConfirmation(true);
  };

  const handleRevokeInvitation = async (invitationId, email) => {
    setConfirmationConfig({
      title: "Revoke Invitation",
      message: `Are you sure you want to revoke the invitation for ${email}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setRevokingInvitation(invitationId);
          await invitationAPI.revokeInvitation(invitationId);
          toast.success("Invitation revoked successfully!");
          loadAllData();
        } catch (error) {
          console.error("Failed to revoke invitation:", error);
          toast.error(error.message || "Failed to revoke invitation");
        } finally {
          setRevokingInvitation(null);
        }
      }
    });
    setShowConfirmation(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'accepted': return 'status-badge accepted';
      case 'pending': return 'status-badge pending';
      default: return 'status-badge';
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'member': return 'role-badge member';
      default: return 'role-badge';
    }
  };

  const filteredInvitations = getFilteredInvitations();

  return (
    <Layout>
      <Header
        title="Invite Members"
        subtitle="Send invitations to team members to join your workspace"
        actionButtonText="+ Send Invite"
        onActionClick={() => setShowModal(true)}
      />

      <div className="invite-members-page">
        {/* Use your existing InviteMemberModal component */}
        <InviteMemberModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleInvitationSent}
          title="Send New Invite"
          submitText="Send Invite"
        />

        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={confirmationConfig.onConfirm}
          title={confirmationConfig.title}
          message={confirmationConfig.message}
          confirmText="Yes, Proceed"
          cancelText="Cancel"
        />

        <section className="card">
          <div className="card-header">
            <h2>Team Invitations</h2>
            <div className="invitation-stats">
              <span className="stat-item">
                Total: {filteredInvitations.length}
              </span>
              <span className="stat-item">
                Pending: {filteredInvitations.filter(i => i.status === 'pending').length}
              </span>
              <span className="stat-item">
                Accepted: {filteredInvitations.filter(i => i.status === 'accepted').length}
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            {loadingInvitations ? (
              <p className="loading">Loading invitations...</p>
            ) : filteredInvitations.length === 0 ? (
              <p className="empty">No active invitations. Use the button above to send your first invitation.</p>
            ) : (
              <table className="project-table">
                <thead>
                  <tr>
                    <th>Id</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Expires At</th>
                    <th>Sent At</th>
                    <th>Accepted At</th>
                    <th className="action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((invitation, idx) => (
                    <tr key={invitation.id}>
                      <td>{idx + 1}</td>
                      <td>{invitation.email}</td>
                      <td>
                        <span className={getRoleClass(invitation.role)}>
                          {invitation.role}
                        </span>
                      </td>
                      <td>
                        <span className={getStatusClass(invitation.status)}>
                          {invitation.status}
                        </span>
                      </td>
                      <td>{formatDate(invitation.expires_at)}</td>
                      <td>{formatDate(invitation.created_at)}</td>
                      <td>{formatDate(invitation.accepted_at) || "N/A"}</td>
                      <td className="action-col">
                        <div className="invitation-actions">
                          {invitation.status === 'pending' ? (
                            <>
                              <button
                                className="invitation-action-btn invitation-resend-btn"
                                onClick={() => handleResendInvitation(invitation)}
                                disabled={resendingInvitation === invitation.email}
                              >
                                {resendingInvitation === invitation.email ? 'Resending...' : 'Resend'}
                              </button>
                              <button
                                className="invitation-action-btn invitation-revoke-btn"
                                onClick={() => handleRevokeInvitation(invitation.id, invitation.email)}
                                disabled={revokingInvitation === invitation.id}
                              >
                                {revokingInvitation === invitation.id ? 'Revoking...' : 'Revoke'}
                              </button>
                            </>
                          ) : (
                            <button
                              className="invitation-action-btn invitation-resend-btn"
                              onClick={() => handleResendInvitation(invitation)}
                              disabled={resendingInvitation === invitation.email}
                            >
                              {resendingInvitation === invitation.email ? 'Sending...' : 'Send Again'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .invitation-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .stat-item {
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 4px;
        }
        
        .invitation-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .invitation-resend-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        
        .invitation-revoke-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .invitation-resend-btn:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .invitation-revoke-btn:hover:not(:disabled) {
          background: #dc2626;
        }
      `}</style>
    </Layout>
  );
}