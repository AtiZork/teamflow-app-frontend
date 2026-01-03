// In your InviteMembers.jsx
const sendInvitation = async (invitationData) => {
    const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(invitationData)
    });
    return await response.json();
};
