// src/pages/Leave.jsx
import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiFileText,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiTrendingUp,
  FiSun,
  FiBriefcase,
  FiX,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import Layout from "../components/layout/Layout.jsx";
import Header from "../components/layout/Header.jsx";
import styles from "../styles/Leave.module.css";
import leaveAPI from "../api/leaveApi";

const ApplyLeave = () => {
  const [leaveForm, setLeaveForm] = useState({
    leave_type_id: null,
    start_date: "",
    end_date: "",
    reason: "",
    emergency_contact: "",
    handover_person_id: null,
    handover_notes: ""
  });

  const [availableBalance, setAvailableBalance] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [duration, setDuration] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("apply");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Fetching leave data...");

        const [typesData, balanceData, historyData] = await Promise.all([
          leaveAPI.getLeaveTypes(),
          leaveAPI.getMyLeaveBalance(),
          leaveAPI.getMyLeaveRequests()
        ]);

        console.log("✅ Types data:", typesData);
        console.log("✅ Balance data:", balanceData);
        console.log("✅ History data:", historyData);

        setLeaveTypes(Array.isArray(typesData) ? typesData : []);
        setAvailableBalance(Array.isArray(balanceData) ? balanceData : []);
        setLeaveHistory(Array.isArray(historyData) ? historyData : []);

        // Set default leave type if available
        if (Array.isArray(typesData) && typesData.length > 0) {
          setLeaveForm(prev => ({
            ...prev,
            leave_type_id: typesData[0].id
          }));
        }
      } catch (err) {
        console.error("❌ Failed to load leave data:", err);
        setError(err.response?.data?.detail || "Failed to load leave information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate duration when dates change
  useEffect(() => {
    if (leaveForm.start_date && leaveForm.end_date) {
      const calculatedDuration = leaveAPI.calculateWorkingDays(leaveForm.start_date, leaveForm.end_date);
      setDuration(calculatedDuration);
    } else {
      setDuration(0);
    }
  }, [leaveForm.start_date, leaveForm.end_date]);

  // Validate form before submission
  const validateForm = () => {
    const errors = [];

    if (!leaveForm.leave_type_id) {
      errors.push("Please select a leave type");
    }

    if (!leaveForm.start_date) {
      errors.push("Start date is required");
    }

    if (!leaveForm.end_date) {
      errors.push("End date is required");
    }

    if (leaveForm.start_date && leaveForm.end_date) {
      const start = new Date(leaveForm.start_date);
      const end = new Date(leaveForm.end_date);

      if (start > end) {
        errors.push("End date must be after start date");
      }
    }

    if (!leaveForm.reason.trim()) {
      errors.push("Reason for leave is required");
    }

    if (duration <= 0) {
      errors.push("Duration must be at least 1 working day");
    }

    // Check for overlapping leaves
    const hasOverlap = leaveAPI.checkLeaveOverlap(leaveHistory, leaveForm.start_date, leaveForm.end_date);
    if (hasOverlap) {
      errors.push("You have overlapping leave requests");
    }

    // Check balance for paid leaves
    const selectedType = leaveTypes.find(t => t.id === leaveForm.leave_type_id);
    if (selectedType && selectedType.is_paid) {
      const balance = availableBalance.find(b => b.leave_type_id === leaveForm.leave_type_id);
      if (balance && balance.remaining_days < duration) {
        errors.push(`Insufficient balance. You have ${balance.remaining_days} days remaining, need ${duration} days`);
      }
    }

    // For unpaid leave, check eligibility
    if (selectedType && !selectedType.is_paid) {
      const paidBalances = availableBalance.filter(b => b.leave_type && b.leave_type.is_paid);
      const totalPaidRemaining = paidBalances.reduce((sum, b) => sum + (b.remaining_days || 0), 0);

      if (totalPaidRemaining > 0) {
        errors.push(`Cannot apply for unpaid leave. You have ${totalPaidRemaining} paid leave days remaining.`);
      } else {
        const unpaidBalance = availableBalance.find(b => b.leave_type_id === leaveForm.leave_type_id);
        if (unpaidBalance && unpaidBalance.remaining_days < duration) {
          errors.push(`Insufficient unpaid leave balance. You have ${unpaidBalance.remaining_days} days remaining, need ${duration} days`);
        }
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const getCurrentBalance = (typeId) => {
    const balance = availableBalance.find(b => b.leave_type_id === typeId);
    if (!balance) return 0;
    return balance.remaining_days;
  };

  const getLeaveTypeIcon = (type) => {
    if (!type) return <FiCalendar />;
    const name = type.name?.toLowerCase() || '';
    if (name.includes('annual')) return <FiSun />;
    if (name.includes('sick')) return <FiUser />;
    if (name.includes('personal')) return <FiBriefcase />;
    if (name.includes('unpaid')) return <FiClock />;
    return <FiCalendar />;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(error => !error.toLowerCase().includes(name)));
  };

  const handleTypeSelect = (type) => {
    setLeaveForm(prev => ({
      ...prev,
      leave_type_id: type.id
    }));
    setValidationErrors(prev => prev.filter(error => !error.toLowerCase().includes('type')));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = {
        leave_type_id: leaveForm.leave_type_id,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        reason: leaveForm.reason,
        emergency_contact: leaveForm.emergency_contact || null,
        handover_person_id: leaveForm.handover_person_id || null,
        handover_notes: leaveForm.handover_notes || null
      };

      console.log("📤 Submitting leave application:", payload);

      const response = await leaveAPI.applyForLeave(payload);
      console.log("✅ Leave application submitted:", response);

      // Refresh data
      const [balanceData, historyData] = await Promise.all([
        leaveAPI.getMyLeaveBalance(),
        leaveAPI.getMyLeaveRequests()
      ]);

      setAvailableBalance(balanceData);
      setLeaveHistory(historyData);

      setSubmitted(true);
      setShowPreview(false);

      // Reset form
      if (leaveTypes.length > 0) {
        setLeaveForm({
          leave_type_id: leaveTypes[0].id,
          start_date: "",
          end_date: "",
          reason: "",
          emergency_contact: "",
          handover_person_id: null,
          handover_notes: ""
        });
        setDuration(0);
      }

      setValidationErrors([]);

    } catch (err) {
      console.error("❌ Error applying for leave:", err);

      const errorMessage = err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        err.message ||
        "Failed to submit leave request.";

      setValidationErrors([errorMessage]);
      setShowPreview(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return leaveAPI.formatLeaveDate(dateString);
  };

  const getLeaveTypeColor = (typeName) => {
    const colors = leaveAPI.getLeaveTypeColor(typeName);
    return colors.text;
  };

  const getStatusColorClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return styles.approved;
      case 'pending': return styles.pending;
      case 'rejected': return styles.rejected;
      case 'cancelled': return styles.cancelled;
      default: return styles.pending;
    }
  };

  const getSelectedLeaveType = () => {
    return leaveTypes.find(t => t.id === leaveForm.leave_type_id);
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading leave information...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title="Leave Management"
        subtitle="Apply for leave and track your requests"
        showActionButton={false}
      />

      <div className={styles.leaveContainer}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "apply" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("apply")}
          >
            <FiCalendar /> Apply for Leave
          </button>
          <button
            className={`${styles.tab} ${activeTab === "history" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <FiClock /> My Leave History
          </button>
          <button
            className={`${styles.tab} ${activeTab === "balance" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("balance")}
          >
            <FiTrendingUp /> My Balance
          </button>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {submitted && (
          <div className={styles.successAlert}>
            <FiCheck />
            <div>
              <strong>Leave Request Submitted!</strong>
              <p>Your leave request has been submitted for approval. You'll be notified once it's reviewed.</p>
            </div>
            <button onClick={() => setSubmitted(false)} className={styles.closeBtn}>
              <FiX />
            </button>
          </div>
        )}

        {/* Apply Leave Tab */}
        {activeTab === "apply" && (
          <div className={styles.applyContent}>
            {/* Left Column - Leave Form */}
            <div className={styles.leaveFormCard}>
              <h2 className={styles.formTitle}>
                <FiCalendar className={styles.titleIcon} />
                New Leave Request
              </h2>

              {validationErrors.length > 0 && (
                <div className={styles.validationErrors}>
                  <FiAlertCircle />
                  <div>
                    <strong>Please fix the following errors:</strong>
                    <ul>
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className={styles.leaveForm}>
                {/* Leave Type Selection */}
                <div className={styles.formSection}>
                  <label className={styles.sectionLabel}>
                    <FiBriefcase className={styles.labelIcon} />
                    Leave Type *
                  </label>
                  <div className={styles.leaveTypeGrid}>
                    {leaveTypes.map((type) => {
                      const color = getLeaveTypeColor(type.name);
                      const balance = getCurrentBalance(type.id);
                      const isSelected = leaveForm.leave_type_id === type.id;

                      return (
                        <button
                          key={type.id}
                          type="button"
                          className={`${styles.leaveTypeCard} ${isSelected ? styles.selectedType : ''}`}
                          onClick={() => handleTypeSelect(type)}
                          style={{
                            borderColor: isSelected ? color : '#e5e7eb',
                            backgroundColor: isSelected ? `${color}10` : 'white'
                          }}
                        >
                          <div className={styles.typeHeader}>
                            <div
                              className={styles.typeIcon}
                              style={{ backgroundColor: `${color}20`, color: color }}
                            >
                              {getLeaveTypeIcon(type)}
                            </div>
                            <div className={styles.typeInfo}>
                              <div className={styles.typeName}>{type.name}</div>
                              <div className={styles.typeDescription}>{type.description || 'No description'}</div>
                            </div>
                          </div>
                          <div className={styles.typeBalance}>
                            <div className={styles.balanceLabel}>Available</div>
                            <div
                              className={styles.balanceValue}
                              style={{ color: color }}
                            >
                              {!type.is_paid && balance === 0 ? 'Not allocated' : `${balance} days`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Selection */}
                <div className={styles.formSection}>
                  <label className={styles.sectionLabel}>
                    <FiCalendar className={styles.labelIcon} />
                    Dates & Duration *
                  </label>
                  <div className={styles.dateGrid}>
                    <div className={styles.dateInputGroup}>
                      <label>Start Date *</label>
                      <input
                        type="date"
                        name="start_date"
                        value={leaveForm.start_date}
                        onChange={handleInputChange}
                        className={styles.dateInput}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className={styles.dateInputGroup}>
                      <label>End Date *</label>
                      <input
                        type="date"
                        name="end_date"
                        value={leaveForm.end_date}
                        onChange={handleInputChange}
                        className={styles.dateInput}
                        min={leaveForm.start_date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {duration > 0 && (
                    <div className={styles.durationDisplay}>
                      <div className={styles.durationInfo}>
                        <span className={styles.durationLabel}>Total Duration:</span>
                        <span className={styles.durationValue}>{duration} working days</span>
                      </div>

                      {/* Balance Check */}
                      {leaveForm.leave_type_id && (
                        <div className={styles.balanceCheck}>
                          {(() => {
                            const selectedType = getSelectedLeaveType();
                            const balance = getCurrentBalance(leaveForm.leave_type_id);

                            if (!selectedType) return null;

                            if (!selectedType.is_paid) {
                              // Unpaid leave
                              if (balance === 0) {
                                return (
                                  <div className={styles.infoAlert}>
                                    <FiInfo />
                                    <span>No unpaid leave allocated. Admin will allocate days upon request.</span>
                                  </div>
                                );
                              } else if (balance < duration) {
                                return (
                                  <div className={styles.warningAlert}>
                                    <FiAlertCircle />
                                    <span>Insufficient unpaid balance. You have {balance} days allocated.</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className={styles.successAlertSmall}>
                                    <FiCheck />
                                    <span>Within allocated unpaid leave balance</span>
                                  </div>
                                );
                              }
                            } else {
                              // Paid leave
                              if (balance < duration) {
                                return (
                                  <div className={styles.warningAlert}>
                                    <FiAlertCircle />
                                    <span>Insufficient balance. You have {balance} days remaining.</span>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className={styles.successAlertSmall}>
                                    <FiCheck />
                                    <span>Within available balance</span>
                                  </div>
                                );
                              }
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reason & Details */}
                <div className={styles.formSection}>
                  <label className={styles.sectionLabel}>
                    <FiFileText className={styles.labelIcon} />
                    Reason & Details *
                  </label>
                  <div className={styles.reasonInputGroup}>
                    <label>Reason for Leave *</label>
                    <textarea
                      name="reason"
                      value={leaveForm.reason}
                      onChange={handleInputChange}
                      className={styles.reasonTextarea}
                      placeholder="Please provide details about your leave request..."
                      rows={4}
                      required
                    />

                  </div>
                </div>

                {/* Additional Information */}
                <div className={styles.formSection} style={{ borderBottom: 'none' }}>
                  <label className={styles.sectionLabel}>
                    <FiInfo className={styles.labelIcon} />
                    Additional Information
                  </label>
                  <div className={styles.additionalGrid}>
                    <div className={styles.inputGroup}>
                      <label>Emergency Contact Number</label>
                      <input
                        type="tel"
                        name="emergency_contact"
                        value={leaveForm.emergency_contact}
                        onChange={handleInputChange}
                        className={styles.textInput}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Handover Notes</label>
                      <input
                        type="text"
                        name="handover_notes"
                        value={leaveForm.handover_notes}
                        onChange={handleInputChange}
                        className={styles.textInput}
                        placeholder="Tasks to cover, important deadlines, etc..."
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      setLeaveForm({
                        leave_type_id: leaveTypes[0]?.id || null,
                        start_date: "",
                        end_date: "",
                        reason: "",
                        emergency_contact: "",
                        handover_person_id: null,
                        handover_notes: ""
                      });
                      setDuration(0);
                      setValidationErrors([]);
                    }}
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Preview Request"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Balance & Tips */}
            <div className={styles.infoSidebar}>
              {/* Balance Summary */}
              <div className={styles.balanceCard}>
                <h3 className={styles.sidebarTitle}>
                  <FiTrendingUp className={styles.sidebarIcon} />
                  Your Leave Balance
                </h3>
                <div className={styles.balanceList}>
                  {leaveTypes.map((type) => {
                    const balance = availableBalance.find(b => b.leave_type_id === type.id);
                    const used = balance ? balance.used_days : 0;
                    const remaining = balance ? balance.remaining_days : (type.is_paid ? type.max_days : 0);
                    const total = balance ? balance.total_days : (type.is_paid ? type.max_days : 0);
                    const color = getLeaveTypeColor(type.name);

                    return (
                      <div key={type.id} className={styles.balanceItem}>
                        <div className={styles.balanceType}>
                          <div
                            className={styles.balanceColor}
                            style={{ backgroundColor: color }}
                          />
                          <span>{type.name}</span>
                        </div>
                        <div className={styles.balanceNumbers}>
                          <span className={styles.balanceUsed}>
                            {used} used
                          </span>
                          <span
                            className={styles.balanceTotal}
                            style={{ color: color }}
                          >
                            {remaining}/{total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.balanceFooter}>
                  <div className={styles.totalRemaining}>
                    <span>Total Remaining:</span>
                    <strong>
                      {availableBalance.reduce((sum, b) => sum + (b.remaining_days || 0), 0)} days
                    </strong>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className={styles.tipsCard}>
                <h3 className={styles.sidebarTitle}>
                  <FiAlertCircle className={styles.sidebarIcon} />
                  Tips for Approval
                </h3>
                <ul className={styles.tipsList}>
                  <li>Submit requests at least 2 weeks in advance</li>
                  <li>Provide clear and detailed reasons</li>
                  <li>Ensure proper handover arrangements</li>
                  <li>Check team calendar for conflicts</li>
                  <li>Keep emergency contact updated</li>
                  <li>For unpaid leave, ensure all paid leaves are exhausted first</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className={styles.historyContent}>
            <div className={styles.historyHeader}>
              <h2>My Leave History</h2>
              <button
                className={styles.toggleHistoryBtn}
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? <FiChevronUp /> : <FiChevronDown />}
                {showHistory ? 'Hide Details' : 'Show All Requests'}
              </button>
            </div>

            <div className={styles.historyStats}>
              <div className={styles.historyStat}>
                <span className={styles.statLabel}>Total Requests:</span>
                <span className={styles.statValue}>{leaveHistory.length}</span>
              </div>
              <div className={styles.historyStat}>
                <span className={styles.statLabel}>Pending:</span>
                <span className={styles.statValue}>
                  {leaveHistory.filter(l => l.status === 'pending').length}
                </span>
              </div>
              <div className={styles.historyStat}>
                <span className={styles.statLabel}>Approved:</span>
                <span className={styles.statValue}>
                  {leaveHistory.filter(l => l.status === 'approved').length}
                </span>
              </div>
            </div>

            {leaveHistory.length === 0 ? (
              <div className={styles.emptyHistory}>
                <FiClock size={48} />
                <p>No leave requests yet</p>
                <p className={styles.emptySubtext}>Submit your first leave request to see it here</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {leaveHistory.slice(0, showHistory ? leaveHistory.length : 5).map((leave) => (
                  <div key={leave.id} className={styles.historyItem}>
                    <div className={styles.historyHeaderRow}>
                      <div className={styles.historyTypeDate}>
                        <div
                          className={styles.historyType}
                          style={{
                            backgroundColor: `${getLeaveTypeColor(leave.leave_type_name)}15`,
                            color: getLeaveTypeColor(leave.leave_type_name)
                          }}
                        >
                          {leave.leave_type_name}
                        </div>
                        <div className={styles.historyDates}>
                          {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                        </div>
                      </div>
                      <div className={styles.historyStatusActions}>
                        <div className={`${styles.historyStatus} ${getStatusColorClass(leave.status)}`}>
                          {leave.status}
                        </div>
                        {leave.status === 'pending' && (
                          <button
                            className={styles.cancelRequestBtn}
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to cancel this leave request?')) {
                                try {
                                  await leaveAPI.cancelLeaveRequest(leave.id);
                                  // Refresh history
                                  const historyData = await leaveAPI.getMyLeaveRequests();
                                  setLeaveHistory(historyData);
                                } catch (err) {
                                  console.error('Failed to cancel request:', err);
                                  alert(err.response?.data?.detail || 'Failed to cancel request');
                                }
                              }
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.historyDetails}>
                      <div className={styles.historyDuration}>
                        <strong>{leave.duration_days}</strong> days
                      </div>
                      <div className={styles.historyReason}>
                        <strong>Reason:</strong> {leave.reason}
                      </div>
                      {leave.admin_comments && (
                        <div className={styles.historyComments}>
                          <strong>Admin Comments:</strong> {leave.admin_comments}
                        </div>
                      )}
                      {leave.approved_by_name && (
                        <div className={styles.historyApprover}>
                          <strong>Approved by:</strong> {leave.approved_by_name} on {formatDate(leave.approved_at)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Balance Tab */}
        {activeTab === "balance" && (
          <div className={styles.balanceContent}>
            <h2>My Leave Balance</h2>
            <p className={styles.balanceSubtitle}>
              Current fiscal year: {new Date().getFullYear()}
            </p>

            <div className={styles.balanceGrid}>
              {leaveTypes.map((type) => {
                const balance = availableBalance.find(b => b.leave_type_id === type.id);
                const used = balance ? balance.used_days : 0;
                const remaining = balance ? balance.remaining_days : (type.is_paid ? type.max_days : 0);
                const total = balance ? balance.total_days : (type.is_paid ? type.max_days : 0);
                const percentage = total > 0 ? (remaining / total) * 100 : 0;
                const color = getLeaveTypeColor(type.name);

                return (
                  <div key={type.id} className={styles.balanceCardLarge}>
                    <div className={styles.balanceCardHeader}>
                      <div
                        className={styles.balanceIcon}
                        style={{ backgroundColor: `${color}20`, color: color }}
                      >
                        {getLeaveTypeIcon(type)}
                      </div>
                      <div className={styles.balanceTitle}>
                        <h3>{type.name}</h3>
                        <p className={styles.balanceDescription}>{type.description || `${type.is_paid ? 'Paid' : 'Unpaid'} leave`}</p>
                      </div>
                    </div>

                    <div className={styles.balanceProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                      <div className={styles.progressLabels}>
                        <span className={styles.progressUsed}>{used} used</span>
                        <span className={styles.progressRemaining} style={{ color: color }}>
                          {remaining} remaining
                        </span>
                      </div>
                    </div>

                    <div className={styles.balanceDetails}>
                      <div className={styles.balanceDetail}>
                        <span className={styles.detailLabel}>Total Allocated:</span>
                        <span className={styles.detailValue}>{total} days</span>
                      </div>
                      <div className={styles.balanceDetail}>
                        <span className={styles.detailLabel}>Used:</span>
                        <span className={styles.detailValue}>{used} days</span>
                      </div>
                      <div className={styles.balanceDetail}>
                        <span className={styles.detailLabel}>Remaining:</span>
                        <span className={styles.detailValue} style={{ color: color }}>
                          <strong>{remaining} days</strong>
                        </span>
                      </div>
                      {!type.is_paid && (
                        <div className={styles.balanceNote}>
                          <FiInfo />
                          <span>Unpaid leave is allocated by admin upon request</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.balanceSummary}>
              <h3>Summary</h3>
              <div className={styles.summaryStats}>
                <div className={styles.summaryStat}>
                  <div className={styles.statLabel}>Total Paid Leave:</div>
                  <div className={styles.statValue}>
                    {availableBalance
                      .filter(b => b.leave_type && b.leave_type.is_paid)
                      .reduce((sum, b) => sum + (b.total_days || 0), 0)} days
                  </div>
                </div>
                <div className={styles.summaryStat}>
                  <div className={styles.statLabel}>Total Used:</div>
                  <div className={styles.statValue}>
                    {availableBalance.reduce((sum, b) => sum + (b.used_days || 0), 0)} days
                  </div>
                </div>
                <div className={styles.summaryStat}>
                  <div className={styles.statLabel}>Total Remaining:</div>
                  <div className={styles.statValue}>
                    <strong>
                      {availableBalance.reduce((sum, b) => sum + (b.remaining_days || 0), 0)} days
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Review Your Leave Request
              </h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowPreview(false)}
                disabled={submitting}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.previewHeader}>
                <div
                  className={styles.previewType}
                  style={{
                    backgroundColor: `${getLeaveTypeColor(getSelectedLeaveType()?.name)}15`,
                    color: getLeaveTypeColor(getSelectedLeaveType()?.name),
                    borderColor: `${getLeaveTypeColor(getSelectedLeaveType()?.name)}30`
                  }}
                >
                  {getSelectedLeaveType()?.name}
                </div>
                <div className={styles.previewDuration}>
                  {duration} day{duration !== 1 ? 's' : ''}
                </div>
              </div>

              <div className={styles.previewDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Dates:</span>
                  <span className={styles.detailValue}>
                    {formatDate(leaveForm.start_date)} - {formatDate(leaveForm.end_date)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Emergency Contact:</span>
                  <span className={styles.detailValue}>
                    {leaveForm.emergency_contact || "Not provided"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Handover Notes:</span>
                  <span className={styles.detailValue}>
                    {leaveForm.handover_notes || "None"}
                  </span>
                </div>
              </div>

              <div className={styles.previewReason}>
                <h4>Reason for Leave</h4>
                <p className={styles.reasonText}>{leaveForm.reason}</p>
              </div>

              {getSelectedLeaveType() && !getSelectedLeaveType().is_paid && (
                <div className={styles.unpaidNote}>
                  <FiAlertCircle />
                  <div>
                    <strong>Unpaid Leave Note:</strong>
                    <p>This is an unpaid leave request. Admin will need to allocate unpaid days before approval.</p>
                  </div>
                </div>
              )}

              <div className={styles.previewAlert}>
                <FiAlertCircle />
                <p>Once submitted, your request will be sent to your manager for approval.</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowPreview(false)}
                disabled={submitting}
              >
                Edit Request
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirmSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className={styles.submitSpinner}></div>
                    Submitting...
                  </>
                ) : (
                  "Submit for Approval"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ApplyLeave;