// src/components/team-management/LeaveManagement.jsx
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FiCalendar,
  FiCheck,
  FiX,
  FiClock,
  FiUsers,
  FiFilter,
  FiSearch,
  FiDownload,
  FiBarChart2,
  FiEye,
  FiUser,
  FiAlertCircle,
  FiChevronRight,
  FiEdit,
  FiPlus,
  FiRefreshCw,
  FiInfo,
  FiCreditCard,
  FiSettings
} from "react-icons/fi";
import styles from "../../styles/LeaveManagement.module.css";
import { leaveAPI } from "../../api/leaveApi";

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    this_month: 0,
    average_duration: 0
  });

  // Balance viewing state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeBalances, setEmployeeBalances] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Tab state for modal
  const [activeTab, setActiveTab] = useState("view"); // "view" or "manage"

  // Balance management state
  const [manageBalanceForm, setManageBalanceForm] = useState({
    leave_type_id: null,
    action: "add",
    days: 0,
    notes: ""
  });
  const [managingBalance, setManagingBalance] = useState(false);

  const getInitials = (name) => {
    return name
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
      : "??";
  };

  const fetchData = async () => {
    setLoading(true);
    console.log("🔄 [LeaveManagement] Fetching leave data...");
    try {
      const [requestsData, statsData, typesData] = await Promise.all([
        leaveAPI.getAllLeaveRequests({ limit: 100 }),
        leaveAPI.getLeaveStats(),
        leaveAPI.getLeaveTypes()
      ]);

      console.log("✅ [LeaveManagement] Requests data:", requestsData);
      console.log("✅ [LeaveManagement] Stats data:", statsData);
      console.log("✅ [LeaveManagement] Types data:", typesData);

      // Map requests to frontend format
      const formattedRequests = Array.isArray(requestsData) ? requestsData.map(req => ({
        id: req.id,
        user_id: req.user_id,
        organization_id: req.organization_id,
        employee: {
          id: req.user_id,
          name: req.employee_name || "Unknown",
          role: req.employee_role || "Unknown",
          avatar: getInitials(req.employee_name || "Unknown")
        },
        leave_type_id: req.leave_type_id,
        leave_type_name: req.leave_type_name || "Unknown",
        start_date: req.start_date,
        end_date: req.end_date,
        duration_days: req.duration_days,
        status: req.status,
        submitted_at: req.submitted_at,
        reason: req.reason,
        admin_comments: req.admin_comments || "",
        emergency_contact: req.emergency_contact || "N/A",
        approved_by: req.approved_by,
        approved_by_name: req.approved_by_name,
        approved_at: req.approved_at,
        handover_person_name: req.handover_person_name
      })) : [];

      console.log("📊 [LeaveManagement] Formatted requests:", formattedRequests);

      setLeaveRequests(formattedRequests);
      setFilteredRequests(formattedRequests);

      if (statsData) {
        setStats({
          total_requests: statsData.total_requests || 0,
          pending: statsData.pending || 0,
          approved: statsData.approved || 0,
          rejected: statsData.rejected || 0,
          this_month: statsData.this_month || 0,
          average_duration: statsData.average_duration || 0
        });
      }

      if (typesData) {
        setLeaveTypes(Array.isArray(typesData) ? typesData : []);
      }

    } catch (error) {
      console.error("❌ [LeaveManagement] Failed to fetch leave data:", error);
      toast.error(error.response?.data?.detail || "Failed to load leave data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter requests
  useEffect(() => {
    let filtered = leaveRequests;

    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(request =>
        request.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.leave_type_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [leaveRequests, statusFilter, searchQuery]);

  // Handle approval/rejection
  const handleApprove = async (requestId) => {
    try {
      await leaveAPI.approveLeaveRequest(requestId, adminComment || "Approved by admin");
      setShowApproveModal(false);
      setAdminComment("");
      setSelectedRequest(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to approve request", error);
      toast.error(error.response?.data?.detail || "Failed to approve request");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await leaveAPI.rejectLeaveRequest(requestId, adminComment || "Rejected by admin");
      setShowApproveModal(false);
      setAdminComment("");
      setSelectedRequest(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to reject request", error);
      toast.error(error.response?.data?.detail || "Failed to reject request");
    }
  };

  const fetchEmployeeBalance = async (employeeId, employeeName) => {
    setBalanceLoading(true);
    setSelectedEmployee({ id: employeeId, name: employeeName });
    setActiveTab("view"); // Default to view tab

    try {
      const balanceData = await leaveAPI.getEmployeeLeaveBalance(employeeId);
      setEmployeeBalances(Array.isArray(balanceData) ? balanceData : []);
      setShowBalanceModal(true);
    } catch (error) {
      console.error("Failed to fetch employee balance", error);
      toast.error(error.response?.data?.detail || "Failed to load leave balance");
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleOpenManageTab = (balance = null) => {
    if (balance) {
      setManageBalanceForm({
        leave_type_id: balance.leave_type_id,
        action: "add",
        days: 1,
        notes: ""
      });
    } else {
      setManageBalanceForm({
        leave_type_id: null,
        action: "add",
        days: 0,
        notes: ""
      });
    }
    setActiveTab("manage");
  };

  const handleManageBalance = async () => {
    if (!selectedEmployee || !manageBalanceForm.leave_type_id || manageBalanceForm.days <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    setManagingBalance(true);
    try {
      await leaveAPI.manageEmployeeLeaveBalance(selectedEmployee.id, {
        leave_type_id: manageBalanceForm.leave_type_id,
        action: manageBalanceForm.action,
        days: manageBalanceForm.days,
        notes: manageBalanceForm.notes
      });

      toast.success("Leave balance updated successfully");

      // Refresh balance data
      const balanceData = await leaveAPI.getEmployeeLeaveBalance(selectedEmployee.id);
      setEmployeeBalances(Array.isArray(balanceData) ? balanceData : []);

      // Switch back to view tab
      setActiveTab("view");
      setManageBalanceForm({
        leave_type_id: null,
        action: "add",
        days: 0,
        notes: ""
      });

    } catch (error) {
      console.error("Failed to manage balance", error);
      toast.error(error.response?.data?.detail || "Failed to update leave balance");
    } finally {
      setManagingBalance(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'pending': return styles.pending;
      case 'rejected': return styles.rejected;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };

  const getLeaveTypeColor = (leaveTypeName) => {
    const type = leaveTypes.find(t => t.name === leaveTypeName);
    return type ? type.color : '#6b7280';
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner}></div>
        <p>Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.leaveManagement}>
      {/* Stats Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.total_requests}</div>
            <div className={styles.statLabel}>Total Requests</div>
          </div>
          <div className={styles.statIcon}>
            <FiCalendar />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.pending}</div>
            <div className={styles.statLabel}>Pending Approval</div>
          </div>
          <div className={styles.statIcon}>
            <FiClock style={{ color: '#f59e0b' }} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.approved}</div>
            <div className={styles.statLabel}>Approved</div>
          </div>
          <div className={styles.statIcon}>
            <FiCheck style={{ color: '#10b981' }} />
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.this_month}</div>
            <div className={styles.statLabel}>This Month</div>
          </div>
          <div className={styles.statIcon}>
            <FiBarChart2 style={{ color: '#8b5cf6' }} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by employee name, leave type, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${statusFilter === "all" ? styles.activeFilter : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({stats.total_requests})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === "pending" ? styles.activeFilter : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === "approved" ? styles.activeFilter : ""}`}
            onClick={() => setStatusFilter("approved")}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === "rejected" ? styles.activeFilter : ""}`}
            onClick={() => setStatusFilter("rejected")}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
        <div className={styles.filterActions}>
          <button
            className={styles.refreshBtn}
            onClick={fetchData}
            title="Refresh Data"
          >
            <FiRefreshCw />
          </button>
          <button className={styles.exportBtn}>
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell} style={{ flex: 2 }}>Employee & Leave Type</div>
          <div className={styles.tableCell}>Duration</div>
          <div className={styles.tableCell}>Dates</div>
          <div className={styles.tableCell}>Balance</div>
          <div className={styles.tableCell}>Status</div>
          <div className={styles.tableCell}>Actions</div>
        </div>
        <div className={styles.tableBody}>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <div key={request.id} className={styles.tableRow}>
                <div className={styles.tableCell} style={{ flex: 2 }}>
                  <div className={styles.leaveEmployeeCell}>
                    <div className={styles.avatar}>
                      {request.employee.avatar}
                    </div>
                    <div className={styles.leaveInfo}>
                      <div className={styles.employeeName}>
                        {request.employee.name}
                        <span className={styles.employeeRole}>
                          {request.employee.role}
                        </span>
                      </div>
                      <div
                        className={styles.leaveTypeBadge}
                        style={{
                          backgroundColor: `${getLeaveTypeColor(request.leave_type_name)}15`,
                          color: getLeaveTypeColor(request.leave_type_name),
                          borderColor: `${getLeaveTypeColor(request.leave_type_name)}30`
                        }}
                      >
                        {request.leave_type_name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.durationCell}>
                    <strong>{request.duration_days}</strong> days
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.datesCell}>
                    {formatDate(request.start_date)}<br />
                    to {formatDate(request.end_date)}
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <button
                    className={styles.balanceBtn}
                    onClick={() => fetchEmployeeBalance(request.employee.id, request.employee.name)}
                    title="View Leave Balance"
                  >
                    <FiUser /> Manage
                  </button>
                </div>
                <div className={styles.tableCell}>
                  <div className={`${styles.statusBadge} ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </div>
                </div>
                <div className={styles.tableCell}>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.viewBtn}
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowApproveModal(true);
                      }}
                      title="Review Request"
                    >
                      <FiEye /> Review
                    </button>
                    {request.status === "pending" && (
                      <>
                        <button
                          className={`${styles.approveBtn} ${styles.iconBtn}`}
                          onClick={() => handleApprove(request.id)}
                          title="Approve"
                        >
                          <FiCheck />
                        </button>
                        <button
                          className={`${styles.rejectBtn} ${styles.iconBtn}`}
                          onClick={() => handleReject(request.id)}
                          title="Reject"
                        >
                          <FiX />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <FiCalendar className={styles.emptyIcon} />
              <p>No leave requests found</p>
              <p className={styles.emptySubtext}>
                {searchQuery || statusFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "No leave requests have been submitted"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showApproveModal && selectedRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Review Leave Request
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowApproveModal(false);
                  setAdminComment("");
                  setSelectedRequest(null);
                }}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.requestHeader}>
                <div className={styles.requestEmployee}>
                  <div className={styles.avatar}>
                    {selectedRequest.employee.avatar}
                  </div>
                  <div>
                    <div className={styles.employeeName}>{selectedRequest.employee.name}</div>
                    <div className={styles.employeeRole}>{selectedRequest.employee.role}</div>
                  </div>
                </div>
                <div
                  className={styles.leaveTypeBadge}
                  style={{
                    backgroundColor: `${getLeaveTypeColor(selectedRequest.leave_type_name)}15`,
                    color: getLeaveTypeColor(selectedRequest.leave_type_name),
                    borderColor: `${getLeaveTypeColor(selectedRequest.leave_type_name)}30`
                  }}
                >
                  {selectedRequest.leave_type_name}
                </div>
              </div>

              <div className={styles.requestDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Dates:</span>
                  <span className={styles.detailValue}>
                    {formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Duration:</span>
                  <span className={styles.detailValue}>{selectedRequest.duration_days} days</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Submitted:</span>
                  <span className={styles.detailValue}>
                    {formatDate(selectedRequest.submitted_at)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Emergency Contact:</span>
                  <span className={styles.detailValue}>
                    {selectedRequest.emergency_contact}
                  </span>
                </div>
                {selectedRequest.handover_person_name && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Handover To:</span>
                    <span className={styles.detailValue}>
                      {selectedRequest.handover_person_name}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.reasonSection}>
                <h4>Reason for Leave</h4>
                <p className={styles.reasonText}>{selectedRequest.reason}</p>
              </div>

              <div className={styles.commentSection}>
                <label>Admin Comments</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Add comments for the employee..."
                  rows={3}
                />
              </div>

              {/* Special note for unpaid leave */}
              {selectedRequest.leave_type_name?.toLowerCase().includes('unpaid') && (
                <div className={styles.unpaidAlert}>
                  <FiAlertCircle />
                  <div>
                    <strong>Unpaid Leave Request</strong>
                    <p>Ensure unpaid leave balance has been allocated before approving.</p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => {
                  setShowApproveModal(false);
                  setAdminComment("");
                  setSelectedRequest(null);
                }}
              >
                Cancel
              </button>
              {selectedRequest.status === "pending" && (
                <>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    Reject
                  </button>
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal with Tabs */}
      {showBalanceModal && selectedEmployee && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '900px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Leave Balance: {selectedEmployee.name}
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedEmployee(null);
                  setEmployeeBalances([]);
                  setActiveTab("view");
                  setManageBalanceForm({
                    leave_type_id: null,
                    action: "add",
                    days: 0,
                    notes: ""
                  });
                }}
              >
                <FiX />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className={styles.modalTabs}>
              <button
                className={`${styles.tabButton} ${activeTab === 'view' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('view')}
              >
                <FiCreditCard />
                View Balance
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'manage' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('manage')}
              >
                <FiSettings />
                Manage Balance
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles.tabContent}>
              {activeTab === 'view' && (
                <div className={styles.viewTab}>
                  {balanceLoading ? (
                    <div className={styles.loadingState}>
                      <div className={styles.spinner}></div>
                      <p>Loading balance information...</p>
                    </div>
                  ) : employeeBalances.length > 0 ? (
                    <>
                      <div className={styles.balanceTable}>
                        <div className={styles.balanceHeader}>
                          <div className={styles.balanceCell} style={{ width: '30%' }}>Leave Type</div>
                          <div className={styles.balanceCell} style={{ width: '12%' }}>Total Days</div>
                          <div className={styles.balanceCell} style={{ width: '12%' }}>Used Days</div>
                          <div className={styles.balanceCell} style={{ width: '12%' }}>Remaining</div>
                          <div className={styles.balanceCell} style={{ width: '12%' }}>Status</div>
                          <div className={styles.balanceCell} style={{ width: '22%' }}>Actions</div>
                        </div>

                        <div className={styles.balanceBody}>
                          {employeeBalances.map((balance, index) => {
                            const leaveType = balance.leave_type || {};
                            const isUnpaid = !leaveType.is_paid;
                            const isLowBalance = balance.remaining_days <= 3;
                            const isMediumBalance = balance.remaining_days <= 5 && balance.remaining_days > 3;

                            return (
                              <div key={index} className={styles.balanceRow}>
                                <div className={styles.balanceCell} style={{ width: '30%' }}>
                                  <div className={styles.leaveTypeInfo}>
                                    <div
                                      className={styles.leaveTypeColor}
                                      style={{ backgroundColor: leaveType.color || '#3b82f6' }}
                                    ></div>
                                    <div className={styles.leaveTypeDetails}>
                                      <div className={styles.leaveTypeName}>
                                        {leaveType.name || 'Unknown'}
                                        {isUnpaid && (
                                          <span className={styles.unpaidBadge}>Unpaid</span>
                                        )}
                                      </div>
                                      {leaveType.description && (
                                        <div className={styles.leaveTypeDesc}>
                                          {leaveType.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className={styles.balanceCell} style={{ width: '12%' }}>
                                  <div className={styles.balanceValue}>
                                    <strong>{balance.total_days}</strong>
                                    {isUnpaid && balance.total_days === 0 && (
                                      <div className={styles.zeroAllocation}>Not allocated</div>
                                    )}
                                  </div>
                                </div>
                                <div className={styles.balanceCell} style={{ width: '12%' }}>
                                  <div className={styles.balanceValue}>
                                    <span className={styles.usedDays}>{balance.used_days}</span>
                                  </div>
                                </div>
                                <div className={styles.balanceCell} style={{ width: '12%' }}>
                                  <div className={styles.balanceValue}>
                                    <span
                                      className={`${styles.remainingDays} ${isLowBalance ? styles.lowBalance : ''}`}
                                    >
                                      <strong>{balance.remaining_days}</strong>
                                    </span>
                                  </div>
                                </div>
                                <div className={styles.balanceCell} style={{ width: '12%' }}>
                                  <div
                                    className={styles.balanceStatus}
                                    style={{
                                      backgroundColor: isLowBalance
                                        ? '#fee2e2'
                                        : isMediumBalance
                                          ? '#fef3c7'
                                          : '#d1fae5',
                                      color: isLowBalance
                                        ? '#dc2626'
                                        : isMediumBalance
                                          ? '#d97706'
                                          : '#059669'
                                    }}
                                  >
                                    {isLowBalance
                                      ? 'Low'
                                      : isMediumBalance
                                        ? 'Medium'
                                        : 'Good'}
                                  </div>
                                </div>
                                <div className={styles.balanceCell} style={{ width: '22%' }}>
                                  <button
                                    className={styles.manageBalanceBtn}
                                    onClick={() => handleOpenManageTab(balance)}
                                    title="Manage Balance"
                                  >
                                    <FiEdit /> Manage Balance
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary Section */}
                      <div className={styles.balanceSummary}>
                        <div className={styles.summaryRow}>
                          <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>Total Leave Days</div>
                            <div className={styles.summaryValue}>
                              {employeeBalances.reduce((sum, b) => sum + b.total_days, 0)}
                            </div>
                          </div>
                          <div className={styles.summaryDivider}></div>
                          <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>Total Used</div>
                            <div className={styles.summaryValue}>
                              {employeeBalances.reduce((sum, b) => sum + b.used_days, 0)}
                            </div>
                          </div>
                          <div className={styles.summaryDivider}></div>
                          <div className={styles.summaryItem}>
                            <div className={styles.summaryLabel}>Total Remaining</div>
                            <div className={styles.summaryValue} style={{ color: '#059669', fontWeight: '600' }}>
                              {employeeBalances.reduce((sum, b) => sum + b.remaining_days, 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      <FiAlertCircle className={styles.emptyIcon} />
                      <p>No leave balance information available</p>
                      <p className={styles.emptySubtext}>
                        This employee might not have any leave types assigned yet.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'manage' && (
                <div className={styles.manageBalanceContainer}>
                  <div className={styles.manageBalanceCard}>
                    <div className={styles.manageBalanceCardHeader}>
                      <div className={styles.manageBalanceCardTitle}>Employee Details</div>
                    </div>
                    <div className={styles.manageBalanceEmployeeInfo}>
                      <div className={styles.manageBalanceAvatar}>
                        {getInitials(selectedEmployee.name)}
                      </div>
                      <div className={styles.manageBalanceEmployeeDetails}>
                        <div className={styles.manageBalanceEmployeeName}>{selectedEmployee.name}</div>
                        <div className={styles.manageBalanceEmployeeId}>ID: {selectedEmployee.id}</div>
                      </div>
                    </div>

                    <div className={styles.manageBalanceCardHeader} style={{ marginTop: '8px' }}>
                      <div className={styles.manageBalanceCardTitle}>Update Balance</div>
                    </div>

                    <div className={styles.manageBalanceFormGrid}>
                      <div className={styles.manageBalanceFormGroup}>
                        <label className={styles.manageBalanceLabel}>Leave Type</label>
                        <select
                          value={manageBalanceForm.leave_type_id || ''}
                          onChange={(e) => setManageBalanceForm(prev => ({
                            ...prev,
                            leave_type_id: parseInt(e.target.value)
                          }))}
                          className={styles.manageBalanceSelect}
                        >
                          <option value="">Select leave type</option>
                          {leaveTypes.map(type => (
                            <option key={type.id} value={type.id}>
                              {type.name} ({type.is_paid ? 'Paid' : 'Unpaid'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className={styles.manageBalanceActionRow}>
                        <div className={styles.manageBalanceFormGroup}>
                          <label className={styles.manageBalanceLabel}>Action</label>
                          <select
                            value={manageBalanceForm.action}
                            onChange={(e) => setManageBalanceForm(prev => ({
                              ...prev,
                              action: e.target.value
                            }))}
                            className={styles.manageBalanceSelect}
                          >
                            <option value="add">Add Days</option>
                            <option value="subtract">Subtract Days</option>
                            <option value="set">Set Total Days</option>
                          </select>
                        </div>
                        <div className={styles.manageBalanceFormGroup}>
                          <label className={styles.manageBalanceLabel}>Days</label>
                          <input
                            type="number"
                            min="0"
                            value={manageBalanceForm.days}
                            onChange={(e) => setManageBalanceForm(prev => ({
                              ...prev,
                              days: parseInt(e.target.value) || 0
                            }))}
                            className={styles.manageBalanceInput}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className={styles.manageBalanceFormGroup}>
                        <label className={styles.manageBalanceLabel}>Notes (Optional)</label>
                        <textarea
                          value={manageBalanceForm.notes}
                          onChange={(e) => setManageBalanceForm(prev => ({
                            ...prev,
                            notes: e.target.value
                          }))}
                          className={styles.manageBalanceTextarea}
                          placeholder="Add notes about this balance change..."
                          rows={3}
                        />
                      </div>

                      <div className={styles.manageBalanceNoteBox}>
                        <FiInfo className={styles.manageBalanceNoteIcon} />
                        <div>
                          <strong>Note:</strong> For unpaid leave, use this to allocate days to employees when they request unpaid leave.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              {activeTab === 'view' && (
                <>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowBalanceModal(false);
                      setSelectedEmployee(null);
                      setEmployeeBalances([]);
                      setActiveTab("view");
                    }}
                  >
                    Close
                  </button>
                  {employeeBalances.length > 0 && (
                    <button className={styles.exportBtn}>
                      <FiDownload /> Export Balance
                    </button>
                  )}
                </>
              )}

              {activeTab === 'manage' && (
                <>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setActiveTab('view')}
                    disabled={managingBalance}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmBtn}
                    onClick={handleManageBalance}
                    disabled={managingBalance || !manageBalanceForm.leave_type_id || manageBalanceForm.days <= 0}
                  >
                    {managingBalance ? (
                      <>
                        <div className={styles.submitSpinner}></div>
                        Updating...
                      </>
                    ) : (
                      "Update Balance"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;