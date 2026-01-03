// TimeLogDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { useUserTaskLogs } from "../../api/tasks.js";
import styles from "../../styles/TimeLogModal.module.css";

const TimeLogDetailsModal = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}) => {
  const [weeksBack, setWeeksBack] = useState(12);
  
  // Use the custom hook for data fetching
  const { data: taskData, loading, error, refetch } = useUserTaskLogs(
    isOpen && userId ? userId : null, 
    weeksBack
  );

  // Refetch when weeksBack changes
  useEffect(() => {
    if (isOpen && userId) {
      refetch?.();
    }
  }, [isOpen, userId, weeksBack, refetch]);

  // Format date from YYYY-MM-DD to MM-DD-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format week range for display
  const formatWeekRange = (weekStart, weekEnd) => {
    if (!weekStart || !weekEnd) return '';
    try {
      const start = new Date(weekStart);
      const end = new Date(weekEnd);
      return `${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')} to ${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`;
    } catch {
      return 'Invalid Date Range';
    }
  };

  // Close modal and reset state
  const handleClose = () => {
    setWeeksBack(12);
    onClose();
  };

  // Handle weeks back change
  const handleWeeksBackChange = (weeks) => {
    setWeeksBack(weeks);
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTop}>
            <h2 className={styles.modalTitle}>
              Time Log Details {userName && `- ${userName}`}
            </h2>
            <button 
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          {/* Weeks Filter */}
          <div className={styles.weeksFilter}>
            <label>Show data for last:</label>
            <div className={styles.weeksButtons}>
              {[4, 8, 12, 24].map(weeks => (
                <button
                  key={weeks}
                  className={`${styles.weekButton} ${weeksBack === weeks ? styles.active : ''}`}
                  onClick={() => handleWeeksBackChange(weeks)}
                >
                  {weeks} weeks
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading task logs...</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Unable to Load Data</h3>
              <p className={styles.errorMessage}>{error}</p>
              <div className={styles.errorActions}>
                <button 
                  className={styles.retryButton}
                  onClick={() => refetch?.()}
                >
                  Try Again
                </button>
                <button 
                  className={styles.closeButtonSecondary}
                  onClick={handleClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : !taskData ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📊</div>
              <h3>No Data Available</h3>
              <p>No task data found for this user in the selected time period.</p>
            </div>
          ) : (
            <div className={styles.dataContainer}>
              {/* Overall Summary */}
              <div className={styles.overallSummary}>
                <h3>Overall Summary</h3>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total Tasks</span>
                    <span className={styles.summaryValue}>
                      {taskData.summary?.total_tasks || taskData.tasks?.length || 0}
                    </span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Total Hours</span>
                    <span className={styles.summaryValue}>
                      {(taskData.summary?.total_logged_hours || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Work Logs</span>
                    <span className={styles.summaryValue}>
                      {taskData.summary?.total_work_logs || 
                        taskData.tasks?.reduce((sum, task) => sum + (task.logs?.length || 0), 0) || 0}
                    </span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Active Weeks</span>
                    <span className={styles.summaryValue}>
                      {taskData.summary?.weeks_with_data || 
                        Object.keys(taskData.weeklyAggregation || {}).length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Aggregation */}
              {taskData.weeklyAggregation && Object.keys(taskData.weeklyAggregation).length > 0 && (
                <div className={styles.weeklySection}>
                  <h3>Weekly Summary</h3>
                  <div className={styles.weeklyGrid}>
                    {Object.entries(taskData.weeklyAggregation).map(([weekKey, weekData]) => (
                      <div key={weekKey} className={styles.weekCard}>
                        <div className={styles.weekRange}>
                          {formatWeekRange(weekData.week_start, weekData.week_end)}
                        </div>
                        <div className={styles.weekStats}>
                          <span className={styles.weekHours}>
                            {(weekData.total_hours || 0).toFixed(1)}h
                          </span>
                          <div className={styles.weekDetails}>
                            <span>{weekData.task_count || 0} tasks</span>
                            <span>{weekData.log_count || 0} logs</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks with Time Logs */}
              {taskData.tasks && taskData.tasks.length > 0 ? (
                <div className={styles.tasksSection}>
                  <h3>Tasks & Time Logs</h3>
                  <div className={styles.tasksList}>
                    {taskData.tasks.map((task, index) => (
                      <div key={task.taskId || index} className={styles.taskCard}>
                        <div className={styles.taskHeader}>
                          <h4 className={styles.taskTitle}>{task.title || 'Untitled Task'}</h4>
                          <div className={styles.taskMeta}>
                            <span className={`${styles.taskStatus} ${styles[task.status?.toLowerCase()] || ''}`}>
                              {task.status || 'No Status'}
                            </span>
                            <span className={styles.taskPriority}>
                              {task.priority || 'No Priority'}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.taskDetails}>
                          <div className={styles.taskInfo}>
                            <span className={styles.project}>
                              <strong>Project:</strong> {task.projectName || 'No Project'}
                            </span>
                            <div className={styles.dateInfo}>
                              {task.startDate && (
                                <span className={styles.startDate}>
                                  <strong>Start:</strong> {formatDate(task.startDate)}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className={styles.dueDate}>
                                  <strong>Due:</strong> {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={styles.taskHours}>
                            <span className={styles.totalHours}>
                              <strong>Total Logged:</strong> {(task.totalLoggedHours || 0).toFixed(1)}h
                              {task.estimatedHours > 0 && 
                                ` / ${task.estimatedHours}h estimated`
                              }
                            </span>
                          </div>
                        </div>

                        {/* Time Logs for this task */}
                        {task.logs && task.logs.length > 0 ? (
                          <div className={styles.timeLogsSection}>
                            <h5>Time Logs ({task.logs.length})</h5>
                            <div className={styles.timeLogsList}>
                              {task.logs.map((log, logIndex) => (
                                <div key={log.logId || logIndex} className={styles.logEntry}>
                                  <span className={styles.logDate}>
                                    {formatDate(log.date)}
                                  </span>
                                  <span className={styles.logHours}>{log.hours}h</span>
                                  {log.description && (
                                    <span className={styles.logDescription}>
                                      {log.description}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.noLogs}>
                            <span>No time logs recorded for this task</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <h3>No Tasks Found</h3>
                  <p>No tasks are assigned to this user in the selected time period.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <div className={styles.footerInfo}>
            {taskData && taskData.dateRange && (
              <span className={styles.dateRange}>
                Data from {formatDate(taskData.dateRange.start_date)} to {formatDate(taskData.dateRange.end_date)}
              </span>
            )}
          </div>
          <button 
            className={styles.closeBtn}
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeLogDetailsModal;