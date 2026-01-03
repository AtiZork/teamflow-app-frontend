
// Update in TimeSheet.jsx
import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Header from '../components/layout/Header';
import styles from '../styles/TimeSheet.module.css';
import {
  getEmployeesTimesheet,
  getCurrentWeekStart,
  getNextWeekStart,
  getPreviousWeekStart,
  formatDateForDisplay,
  getFilteredUserTasks,
  getWorklogsSummary
} from '../api/timesheet';
import { getOrganizationMembers } from '../api/users';
import { getTask, createTask, updateTask, getTasks } from '../api/tasks';
import TaskModal from "../components/modals/TaskModal";
import TimeLogDetailsModal from "../components/modals/TimeLogDetailsModal.jsx";

const TimeSheet = () => {

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    employee_id: '',
    week_start: getCurrentWeekStart(),
    week_type: 'this-week',
    custom_start: '',
    custom_end: ''
  });

  // Modal state management
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');
  const [modalLoading, setModalLoading] = useState(false);

  // ✅ NEW: State for Time Log Details Modal
  const [showTimeLogModal, setShowTimeLogModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);


  const statusMap = {
    open: "Open",
    todo: "To Do",
    "inprogress": "In Progress",
    "in-progress": "In Progress",
    qa: "In QA",
    "In QA": "in_qa",
    "in_qa": "In QA",
    done: "Done",
  };

  const adminName = localStorage.getItem("userName") || "Admin";

  // Fetch initial data
  useEffect(() => {
    fetchTimesheetData();
    fetchOrganizationMembers();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ NEW: Function to open time log details modal
  const openTimeLogDetails = (employee) => {
    setSelectedEmployee({
      id: employee.user_id || employee.id,
      name: employee.full_name || employee.user_name || "Unknown"
    });
    setShowTimeLogModal(true);
  };

  // ✅ NEW: Function to close time log details modal
  const closeTimeLogDetails = () => {
    setShowTimeLogModal(false);
    setSelectedEmployee(null);
  };

  const fetchOrganizationMembers = async () => {
    try {
      const members = await getOrganizationMembers();
      setEmployees(members);
    } catch (error) {
      console.error('Error fetching organization members:', error);
      setEmployees([]);
    }
  };

  // ... existing fetchProjects, normalizeTaskData, openCreateTaskModal, saveTask, closeTaskModal functions ...

  const fetchProjects = async () => {
    try {
      const { getProjects } = await import('../api/projects');
      const projectsData = await getProjects();
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const normalizeTaskData = (taskData) => {
    if (!taskData) return null;

    const memberIds = taskData.member_ids || (taskData.member_id ? [taskData.member_id] : []);
    const members = memberIds.map(memberId =>
      employees.find(u => u.id === memberId)
    ).filter(Boolean);

    const project = projects.find((p) => p.id === taskData.project_id);

    const statusKey = taskData.status?.toLowerCase().replace(/[-\s]/g, "");
    const displayStatus = statusMap[statusKey] || "Open";

    return {
      ...taskData,
      status: displayStatus,
      project_name: project?.title || "Unknown Project",
      members: members,
      created_by_name: adminName,
    };
  };

  const openCreateTaskModal = async (taskId = null) => {
    if (taskId) {
      setModalLoading(true);
      try {
        const tasks = await getTasks();
        const taskData = tasks.find(t => t.id === taskId);

        if (taskData) {
          const normalizedTask = normalizeTaskData(taskData);
          setSelectedTask(normalizedTask);
          setModalMode('view');
        } else {
          const singleTaskData = await getTask(taskId);
          const normalizedTask = normalizeTaskData(singleTaskData);
          setSelectedTask(normalizedTask);
          setModalMode('view');
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        setSelectedTask({ id: taskId });
        setModalMode('view');
      } finally {
        setModalLoading(false);
      }
    } else {
      setSelectedTask(null);
      setModalMode('edit');
    }
    setShowTaskModal(true);
  };

  const saveTask = async (payload) => {
    try {
      setModalLoading(true);

      const reverseStatusMap = {
        "Open": "open",
        "To Do": "todo",
        "In Progress": "in-progress",
        "In QA": "in_qa",
        "Done": "done",
      };

      const backendStatus = reverseStatusMap[payload.status] || payload.status.toLowerCase().replace(/ /g, "-");
      const taskPayload = {
        ...payload,
        status: backendStatus
      };

      Object.keys(taskPayload).forEach(
        key => taskPayload[key] === undefined && delete taskPayload[key]
      );

      if (payload.id) {
        await updateTask(payload.id, taskPayload);
        console.log('Task updated successfully');
      } else {
        await createTask(taskPayload);
        console.log('Task created successfully');
      }

      closeTaskModal();
      fetchTimesheetData();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setModalLoading(false);
  };

  // ... rest of your existing functions (fetchTimesheetData, enhanceDataWithWorklogsSummary, formatEmployeeTaskData, etc.) ...

  const fetchTimesheetData = async () => {
    setLoading(true);
    try {
      let apiFilters = {};

      switch (filters.week_type) {
        case 'prev-week':
          apiFilters.week_start = getPreviousWeekStart(filters.week_start);
          break;
        case 'next-week':
          apiFilters.week_start = getNextWeekStart(filters.week_start);
          break;
        case 'custom-range':
          if (filters.custom_start && filters.custom_end) {
            apiFilters.start_date = filters.custom_start;
            apiFilters.end_date = filters.custom_end;
          } else {
            apiFilters.week_start = getCurrentWeekStart();
          }
          break;
        default:
          apiFilters.week_start = filters.week_start;
      }

      if (filters.employee_id) {
        apiFilters.user_id = filters.employee_id;
      }

      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });

      let timesheetData;

      if (filters.employee_id) {
        const [taskData, worklogsData] = await Promise.all([
          getFilteredUserTasks(apiFilters),
          getWorklogsSummary(apiFilters)
        ]);

        const formattedData = formatEmployeeTaskData(taskData, worklogsData, filters.employee_id);
        timesheetData = formattedData;
      } else {
        const summaryResponse = await getEmployeesTimesheet(apiFilters);
        timesheetData = summaryResponse.data || summaryResponse || [];

        if (timesheetData.length > 0) {
          const enhancedData = await enhanceDataWithWorklogsSummary(timesheetData, apiFilters.week_start || apiFilters.start_date);
          timesheetData = enhancedData;
        }
      }

      setData(timesheetData);
    } catch (error) {
      console.error('Error fetching timesheet data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const enhanceDataWithWorklogsSummary = async (timesheetData, weekStart) => {
    try {
      const enhancedData = [];
      const currentDate = new Date().toISOString().split('T')[0];

      for (const employee of timesheetData) {
        try {
          const worklogsData = await getWorklogsSummary({
            week_start: weekStart,
            user_id: employee.user_id || employee.id
          });

          const taskData = await getFilteredUserTasks({
            week_start: weekStart,
            user_id: employee.user_id || employee.id
          });

          const weekDates = getWeekDates();
          const dailyDataWithTasks = [];

          weekDates.forEach((weekDate, index) => {
            const dateStr = weekDate.isoDate;
            const isFutureDate = dateStr > currentDate;

            const dayTasks = !isFutureDate ? (taskData.daily_tasks?.[dateStr] || []) : [];

            const existingDayData = (employee.daily_data || employee.week_data || [])[index] || {};

            const dailyTaskHours = dayTasks.reduce((sum, task) => sum + (task.logged_hours || 0), 0);
            const dailyWorkHours = existingDayData.work_hours || existingDayData.hours || dailyTaskHours;

            dailyDataWithTasks.push({
              day: weekDate.day,
              date: weekDate.date,
              isoDate: dateStr,
              work_hours: dailyWorkHours,
              task_time: dailyTaskHours,
              tasks: dayTasks,
              isFuture: isFutureDate,
              isToday: dateStr === currentDate
            });
          });

          enhancedData.push({
            ...employee,
            daily_data: dailyDataWithTasks,
            total_work_hours: worklogsData.total_work_hours || 0,
            total_task_time: worklogsData.total_task_time || 0,
            weekly_total_hours: worklogsData.total_work_hours || 0
          });
        } catch (error) {
          console.error(`Error enhancing data for employee ${employee.user_id}:`, error);
          enhancedData.push(employee);
        }
      }

      return enhancedData;
    } catch (error) {
      console.error('Error enhancing data with worklogs summary:', error);
      return timesheetData;
    }
  };

  const formatEmployeeTaskData = (taskData, worklogsData, employeeId) => {
    if (!taskData || !taskData.daily_tasks) return [];

    const employee = employees.find(emp => emp.id === parseInt(employeeId));
    if (!employee) return [];

    const weekDates = getWeekDates();
    const currentDate = new Date().toISOString().split('T')[0];
    const formattedData = [];

    weekDates.forEach((weekDate, index) => {
      const dateStr = weekDate.isoDate;
      const isFutureDate = dateStr > currentDate;

      const dayTasks = !isFutureDate ? (taskData.daily_tasks[dateStr] || []) : [];

      const dailyTaskHours = dayTasks.reduce((sum, task) => sum + (task.logged_hours || 0), 0);
      const dailyWorkHours = dailyTaskHours;

      formattedData.push({
        day: weekDate.day,
        date: weekDate.date,
        isoDate: dateStr,
        work_hours: dailyWorkHours,
        task_time: dailyTaskHours,
        tasks: dayTasks,
        isFuture: isFutureDate,
        isToday: dateStr === currentDate
      });
    });

    return [{
      id: employeeId,
      user_id: employeeId,
      first_name: employee.first_name,
      last_name: employee.last_name,
      full_name: employee.full_name,
      user_name: employee.user_name,
      profile_image: employee.profile_image,
      designation: employee.designation || employee.role || 'Employee',
      total_work_hours: worklogsData.total_work_hours || 0,
      total_task_time: worklogsData.total_task_time || 0,
      daily_data: formattedData,
      weekly_total_hours: worklogsData.total_work_hours || 0
    }];
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    fetchTimesheetData();
  };

  const getWeekDates = () => {
    let startDate;

    switch (filters.week_type) {
      case 'prev-week':
        startDate = getPreviousWeekStart(filters.week_start);
        break;
      case 'next-week':
        startDate = getNextWeekStart(filters.week_start);
        break;
      case 'custom-range':
        startDate = filters.custom_start || getCurrentWeekStart();
        break;
      default:
        startDate = filters.week_start;
    }

    const dates = [];
    const daysCount = filters.week_type === 'custom-range' && filters.custom_end ?
      Math.ceil((new Date(filters.custom_end) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1 : 7;

    for (let i = 0; i < daysCount; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      if (filters.week_type === 'custom-range' && filters.custom_end && date > new Date(filters.custom_end)) {
        break;
      }

      const isoDate = date.toISOString().split('T')[0];
      dates.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        date: formatDateForDisplay(isoDate),
        isoDate: isoDate,
        isFuture: isoDate > new Date().toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const renderTaskNames = (tasks, dateStr, isFuture = false) => {
    if (isFuture) {
      return (
        <div className={styles.futureDate}>
          Future Date
        </div>
      );
    }

    if (!tasks || tasks.length === 0) {
      return null;
    }

    return (
      <div className={styles.tasksList}>
        {tasks.slice(0, 3).map((task, taskIndex) => (
          <div
            key={taskIndex}
            className={`${styles.taskItem} ${styles[getPriorityClass(task.priority)]}`}
            onClick={() => openCreateTaskModal(task.task_id || task.id)}
            style={{ cursor: 'pointer' }}
            title="Click to view/edit task"
          >
            <span className={styles.taskTitle}>
              {task.task_title || task.title || `Task #${task.task_id || task.id}`}
            </span>
            {task.logged_hours > 0 && (
              <span className={styles.taskHours}>
                ({task.logged_hours}h)
              </span>
            )}
          </div>
        ))}
        {tasks.length > 3 && (
          <div className={styles.moreTasks}>
            +{tasks.length - 3} more
          </div>
        )}
      </div>
    );
  };

  const getPriorityClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'taskPriorityHigh';
      case 'medium':
        return 'taskPriorityMedium';
      case 'low':
        return 'taskPriorityLow';
      default:
        return 'taskPriorityDefault';
    }
  };

  const weekDates = getWeekDates();

  return (
    <Layout>
      <Header
        title="Time Sheet"
        subtitle="Manage and view employee timesheets"
      />

      <div className={styles.container}>
        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <div className={`${styles.filterGroup} ${filters.week_type === 'custom-range' ? styles.shrinkField : ''}`}>
            <label className={styles.filterLabel}>Employees</label>
            <select
              className={styles.dropdown}
              value={filters.employee_id}
              onChange={(e) => handleFilterChange('employee_id', e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name || emp.user_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unknown'}
                </option>
              ))}
            </select>
          </div>

          <div className={`${styles.filterGroup} ${styles.weekSelectionGroup} ${filters.week_type === 'custom-range' ? styles.expandField : ''}`}>
            <label className={styles.filterLabel}>Select Week</label>
            <div className={styles.weekSelectionContainer}>
              <select
                className={`${styles.dropdown} ${styles.weekTypeDropdown}`}
                value={filters.week_type}
                onChange={(e) => handleFilterChange('week_type', e.target.value)}
              >
                <option value="prev-week">Prev Week</option>
                <option value="this-week">This Week</option>
                <option value="next-week">Next Week</option>
                <option value="custom-range">Custom Range</option>
              </select>

              {filters.week_type === 'custom-range' && (
                <div className={styles.customRangeContainer}>
                  <input
                    type="date"
                    className={`${styles.dropdown} ${styles.dateInput}`}
                    value={filters.custom_start}
                    onChange={(e) => handleFilterChange('custom_start', e.target.value)}
                    placeholder="Start Date"
                  />
                  <span className={styles.dateSeparator}>to</span>
                  <input
                    type="date"
                    className={`${styles.dropdown} ${styles.dateInput}`}
                    value={filters.custom_end}
                    onChange={(e) => handleFilterChange('custom_end', e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.searchButtonContainer}>
            <button
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.buttonSpinner}></span>
                  Searching...
                </>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>

        {/* Week Header */}
        {!loading && data.length > 0 && (
          <div className={styles.weekHeader}>
            <div className={styles.employeeInfoHeader}>Employee</div>
            <div className={styles.daysGrid} style={{ gridTemplateColumns: `repeat(${weekDates.length}, 1fr)` }}>
              {weekDates.map((date, index) => (
                <div key={index} className={styles.dayHeader}>
                  <div className={styles.dayName}>{date.day}</div>
                  <div className={styles.date}>{date.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Loading timesheet data...
          </div>
        )}

        {/* Timesheet Grid */}
        {!loading && data.length > 0 && (
          <div className={styles.timesheetGrid}>
            {data.map(employee => (
              <div
                key={employee.id || employee.user_id}
                className={styles.employeeCard}
              >
                <div className={styles.employeeInfo}>
                  <div className={styles.employeeAvatar}>
                    {employee.profile_image ? (
                      <img
                        src={employee.profile_picture || employee.profile_image}
                        alt={employee.full_name || employee.user_name || "Employee"}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {(employee.full_name || employee.user_name || "EE").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className={styles.employeeDetails}>
                    <h3 className={styles.employeeName}>
                      {employee.full_name || employee.user_name || "Unknown"}
                    </h3>
                    <p className={styles.employeeDesignation}>
                      {employee.designation || employee.role || "Employee"}
                    </p>

                    {/* ✅ UPDATED: Make TTT clickable */}
                    <div className={styles.employeeStats}>
                      <span className={styles.statTwh}>
                        TWH: {employee.total_work_hours?.toFixed(1) || "0.0"}
                      </span>
                      <span
                        className={`${styles.statTtt} ${styles.clickableTtt}`}
                        onClick={() => openTimeLogDetails(employee)}
                        title="Click to view detailed time logs"
                      >
                        TTT: {employee.total_task_time?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={styles.daysGrid}
                  style={{
                    gridTemplateColumns: `repeat(${weekDates.length}, 1fr)`,
                  }}
                >
                  {employee.daily_data?.map((day, dayIndex) => (
                    <div key={dayIndex} className={styles.dayCellContainer}>
                      <div
                        className={`${styles.dayCell} ${day.isFuture ? styles.futureDay : ""}`}
                      >
                        {day.isFuture ? (
                          <div className={styles.futureDateContent}>
                            <span className={styles.futureText}>Future Date</span>
                          </div>
                        ) : (
                          <div className={styles.dayContent}>
                            {renderTaskNames(day.tasks, day.isoDate, day.isFuture)}
                          </div>
                        )}
                      </div>

                      {!day.isFuture && (
                        <div className={styles.dayMetrics}>
                          <span className={styles.workHours}>
                            WH: 8.0
                          </span>
                          <span className={styles.taskTime}>
                            Task Time: {day.task_time?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📊</div>
            <h3>No Timesheet Data</h3>
            <p>No timesheet records found for the selected filters.</p>
            <button
              className={styles.retryButton}
              onClick={fetchTimesheetData}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          onClose={closeTaskModal}
          onSave={saveTask}
          editing={selectedTask}
          column={selectedTask?.status || "Open"}
          projects={projects}
          users={employees}
          viewOnly={modalMode === 'view'}
          loading={modalLoading}
        />
      )}

      {/* ✅ NEW: Time Log Details Modal */}
      {showTimeLogModal && selectedEmployee && (
        <TimeLogDetailsModal
          isOpen={showTimeLogModal}
          onClose={closeTimeLogDetails}
          userId={selectedEmployee.id}
          userName={selectedEmployee.name}
        />
      )}
    </Layout>
  );
};

export default TimeSheet;