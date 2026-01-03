// src/components/teams/TeamOverview.jsx
import { useState, useEffect } from "react";
import {
  FiUser,
  FiUsers,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiMoreVertical,
  FiSearch,
  FiFilter,
  FiUserPlus,
  FiShield
} from "react-icons/fi";
import styles from "../../styles/TeamManagement.module.css";
import { getUsers } from "../../api/users";

const TeamOverview = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();

        const formattedMembers = data.map(user => ({
          id: user.id,
          name: user.full_name || user.username || "Unknown",
          email: user.email,
          role: user.role,
          position: user.role.charAt(0).toUpperCase() + user.role.slice(1), // Use role as position since we don't have job title
          joinDate: user.created_at,
          status: user.is_active ? "active" : "inactive",
          avatar: user.full_name ?
            user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) :
            user.email.substring(0, 2).toUpperCase(),
          phone: user.phone_number || "N/A",
          department: "Software Engineer" // Hardcoded as requested
        }));

        setMembers(formattedMembers);
        setFilteredMembers(formattedMembers);
      } catch (error) {
        console.error("Failed to fetch members:", error);
        // Fallback to empty list or handle error UI
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members
  useEffect(() => {
    let filtered = members;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(member => member.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchQuery, roleFilter, statusFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleToggleStatus = (memberId) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId
        ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
        : member
    ));
  };

  const handleUpdateMember = (updatedData) => {
    setMembers(prev => prev.map(member =>
      member.id === selectedMember.id
        ? { ...member, ...updatedData }
        : member
    ));
    setShowEditModal(false);
    setSelectedMember(null);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading team members...</p>
      </div>
    );
  }

  return (
    <div className={styles.teamOverview}>
      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {members.filter(m => m.role === 'member' || m.role === 'admin' || m.role === 'super_admin').length}
            </div>
            <div className={styles.statLabel}>Total Members</div>
          </div>
          <div className={styles.statIcon}>
            <FiUsers />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {members.filter(m => m.status === 'active').length}
            </div>
            <div className={styles.statLabel}>Active Members</div>
          </div>
          <div className={styles.statIcon}>
            <FiCheckCircle />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {members.filter(m => m.role === 'admin').length}
            </div>
            <div className={styles.statLabel}>Admins</div>
          </div>
          <div className={styles.statIcon}>
            <FiShield />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>5</div>
            <div className={styles.statLabel}>Departments</div>
          </div>
          <div className={styles.statIcon}>
            <FiBriefcase />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search members by name, email, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterButtons}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell} style={{ flex: 2 }}>Member</div>
          <div className={styles.tableCell}>Role</div>
          <div className={styles.tableCell}>Department</div>
          <div className={styles.tableCell}>Join Date</div>
          <div className={styles.tableCell}>Status</div>
          <div className={styles.tableCell}>Actions</div>
        </div>
        <div className={styles.tableBody}>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div key={member.id} className={styles.tableRow}>
                <div className={styles.tableCell} style={{ flex: 2 }}>
                  <div className={styles.memberCell}>
                    <div className={styles.avatar}>
                      {member.avatar}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberEmail}>{member.email}</div>
                      <div className={styles.memberPosition}>{member.position}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                    {member.role}
                  </span>
                </div>
                <div className={styles.tableCell}>
                  {member.department}
                </div>
                <div className={styles.tableCell}>
                  {formatDate(member.joinDate)}
                </div>
                <div className={styles.tableCell}>
                  <span className={`${styles.statusBadge} ${styles[member.status]}`}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEditMember(member)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className={styles.toggleBtn}
                      onClick={() => handleToggleStatus(member.id)}
                    >
                      {member.status === 'active' ? <FiXCircle /> : <FiCheckCircle />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FiUsers className={styles.emptyIcon} />
              <p>No members found</p>
              <p className={styles.emptySubtext}>
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "Start by inviting your first team member"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamOverview;