// src/pages/AttendanceTracking.jsx
import { useState, useEffect, useCallback } from "react";
import {
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";
import { format } from "date-fns";
// Note: Do not include Layout or Header here; TeamManagement provides them.
import AttendanceStatsCards from "../attendance/AttendanceStatsCards.jsx";
import AttendanceFilters from "../attendance/AttendanceFilters.jsx";
import AttendanceTable from "../attendance/AttendanceTable.jsx";
import { adminDashboardAPI } from "../../api/adminDashboard";
import { toast } from "react-hot-toast";
import styles from "../../styles/AttendanceTracking.module.css";
import BaseModal from "../modals/BaseModal";
import { API_URL } from "../../config/apiConfig";

const AttendanceTracking = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [attendanceStats, setAttendanceStats] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState({});

  // Export Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("Notification");
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
    endDate: new Date()
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // View state
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar" (future)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState({
    key: "employee.name",
    direction: "asc"
  });

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      setError(null);

      // Format date for API
      const dateStr = format(dateRange.endDate, "yyyy-MM-dd");

      console.log("Fetching dashboard data for date:", dateStr);

      // Fetch full dashboard data AND team members
      const [dashboardData, teamMembers] = await Promise.all([
        adminDashboardAPI.getFullDashboard(dateStr),
        adminDashboardAPI.getTeamMembers({ isActive: true })
      ]);

      console.log("Received dashboard data:", dashboardData);
      console.log("Received team members:", teamMembers);

      // Group attendance records by user_id (to handle multiple check-ins)
      const attendanceByUser = {};
      (dashboardData.attendance_records || []).forEach(record => {
        const userId = record.user_id;
        // Keep the most recent record for each user
        if (!attendanceByUser[userId]) {
          attendanceByUser[userId] = record;
        } else {
          // Compare check-in times and keep the latest
          const existingTime = attendanceByUser[userId].check_in || "00:00:00";
          const newTime = record.check_in || "00:00:00";
          if (newTime > existingTime) {
            attendanceByUser[userId] = record;
          }
        }
      });

      // Create weekly summary map
      const summaryMap = {};
      dashboardData.weekly_summaries?.forEach(summary => {
        summaryMap[summary.user_id] = {
          weeklyHours: summary.total_hours,
          weeklyAttendance: summary.attendance_percentage,
          presentDays: summary.present_days,
          absentDays: summary.absent_days,
          lateDays: summary.late_days
        };
      });
      setWeeklySummary(summaryMap);

      // Create ONE ROW PER EMPLOYEE (not per attendance record)
      const employeeRows = teamMembers.map(member => {
        const attendanceRecord = attendanceByUser[member.id];
        const weeklySummary = summaryMap[member.id];
        const initials = member.full_name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

        return {
          id: member.id, // Use employee ID as row ID
          employee: {
            id: member.id,
            name: member.full_name,
            email: member.email,
            role: member.role,
            jobTitle: member.job_title,
            department: member.department,
            avatar: initials,
            profilePicture: member.profile_picture,
            is_active: member.is_active
          },
          // Attendance data (or null if no attendance today)
          date: attendanceRecord?.date || dateStr,
          checkIn: attendanceRecord?.check_in || null,
          checkOut: attendanceRecord?.check_out || null,
          totalHours: attendanceRecord?.total_hours || "00:00",
          productiveHours: attendanceRecord?.productive_hours || "00:00",
          breakTime: attendanceRecord?.break_time || "00:00",
          overtime: attendanceRecord?.overtime || "00:00",
          status: attendanceRecord?.status || "absent",
          location: attendanceRecord?.location || null,
          actualLocation: attendanceRecord?.address || attendanceRecord?.location || "Not tracked", // ✅ Show address if available
          latitude: attendanceRecord?.latitude || null,
          longitude: attendanceRecord?.longitude || null,
          isLate: attendanceRecord?.is_late || false,
          notes: attendanceRecord?.notes || null,
          // Weekly summary data - CAP presentDays at maximum 5
          weeklyHours: weeklySummary?.weeklyHours || "00:00",
          weeklyAttendance: weeklySummary?.weeklyAttendance || 0,
          presentDays: Math.min(weeklySummary?.presentDays || 0, 5), // ✅ Cap at 5 days max
          absentDays: weeklySummary?.absentDays || 0
        };
      });

      setAttendanceRecords(employeeRows);
      console.log("Created employee rows:", employeeRows.length);

      // ✅ RECALCULATE STATS FROM ACTUAL DATA (not from backend stats which might be wrong)
      const actualPresentToday = employeeRows.filter(emp =>
        emp.status === 'present' || emp.status === 'working' || emp.checkIn !== null
      ).length;

      const actualAbsentToday = employeeRows.filter(emp =>
        emp.status === 'absent' && emp.checkIn === null
      ).length;

      // Calculate Remote Work count
      const actualRemoteToday = employeeRows.filter(emp =>
        emp.location && emp.location.toLowerCase() === 'remote'
      ).length;

      // Calculate average hours (HH:MM format)
      const totalHoursList = employeeRows
        .map(emp => emp.totalHours || "00:00")
        .filter(hours => hours !== "00:00");

      let averageHours = "00:00";
      if (totalHoursList.length > 0) {
        const totalMinutes = totalHoursList.reduce((sum, timeStr) => {
          const [h, m] = timeStr.split(':').map(Number);
          return sum + (h * 60 + m);
        }, 0);

        const avgMin = totalMinutes / totalHoursList.length;
        const h = Math.floor(avgMin / 60);
        const m = Math.round(avgMin % 60);
        averageHours = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }

      // Update stats with correct counts
      const totalEmployees = employeeRows.length;
      const attendanceRateToday = totalEmployees > 0
        ? ((actualPresentToday / totalEmployees) * 100)
        : 0;

      setAttendanceStats({
        total_employees: totalEmployees,
        present_today: actualPresentToday, // ✅ Actual count from records
        on_leave: actualAbsentToday,
        remote_work: actualRemoteToday,
        average_hours: averageHours,
        attendance_rate_today: attendanceRateToday
      });

      console.log("Stats updated:", {
        total: totalEmployees,
        present: actualPresentToday,
        absent: actualAbsentToday,
        remote: actualRemoteToday
      });

    } catch (error) {
      console.error("Error fetching attendance data:", error);
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to load attendance data";
      setError(errorMessage);
      toast.error(errorMessage);
      // Set empty data to allow UI to render
      setAttendanceRecords([]);
      setWeeklySummary({});
      setAttendanceStats({
        total_employees: 0,
        present_today: 0,
        on_leave: 0,
        remote_work: 0,
        average_hours: 0
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange, isRefreshing]);

  // Initial data fetch - FIXED: Only depend on dateRange changes
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    loadData();

    // Set up auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      if (mounted) {
        fetchData();
      }
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [dateRange]); // Only re-run when dateRange changes

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Handle export
  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      toast.loading("Exporting report...", { id: "export-toast" }); // Use toast.loading instead of toast.info

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/attendance/export-report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss("export-toast");

      setModalTitle("Success");
      setModalMessage("✓ Report exported successfully!");
      setShowModal(true);

      // Auto close after 3 seconds
      setTimeout(() => {
        setShowModal(false);
      }, 3000);

    } catch (error) {
      console.error("Export error:", error);
      toast.dismiss("export-toast");
      setModalTitle("Error");
      setModalMessage("✗ Failed to export report. Please try again.");
      setShowModal(true);
    } finally {
      setIsExporting(false);
    }
  };

  // Sort data
  // Helper to get nested object values (hoisted so sort can use it)
  function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  const sortedRecords = [...attendanceRecords].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Filter records based on filters
  const filteredRecords = sortedRecords.filter(record => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const employeeName = record.employee?.name?.toLowerCase() || "";
      const employeeEmail = record.employee?.email?.toLowerCase() || "";
      const employeeRole = record.employee?.role?.toLowerCase() || "";

      if (!employeeName.includes(searchLower) &&
        !employeeEmail.includes(searchLower) &&
        !employeeRole.includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && record.status !== statusFilter) {
      return false;
    }

    // Location filter
    if (locationFilter !== "all" && record.location !== locationFilter) {
      return false;
    }

    // Role filter
    if (roleFilter !== "all" && record.employee?.role !== roleFilter) {
      return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate employee stats for cards
  const employeeStats = {
    total_employees: attendanceStats.total_employees || 0,
    present_today: attendanceStats.present_today || 0,
    on_leave: attendanceStats.on_leave || 0,
    remote_work: attendanceStats.remote_work || 0,
    average_hours: attendanceStats.average_hours || 0
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of table
    const tableElement = document.querySelector(`.${styles["attendance-table"]}`);
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Render loading skeleton
  if (isLoading && !isRefreshing) {
    return (
      <div className={styles["attendance-container"]}>
        <div className={styles["loading-skeleton"]}>
          {/* Stats cards skeleton */}
          <div className={styles["stats-skeleton"]}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={styles["stat-card-skeleton"]}></div>
            ))}
          </div>

          {/* Filters skeleton */}
          <div className={styles["filters-skeleton"]}></div>

          {/* Table skeleton */}
          <div className={styles["table-skeleton"]}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
              <div key={i} className={styles["table-row-skeleton"]}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["attendance-container"]}>
      {/* Error display */}
      {error && (
        <div className={styles["error-alert"]}>
          <FiAlertCircle className={styles["error-icon"]} />
          <span>{error}</span>
          <button
            className={styles["retry-btn"]}
            onClick={handleRefresh}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <AttendanceStatsCards
        stats={employeeStats}
        isLoading={isRefreshing}
      />

      {/* Filters and Controls */}
      <AttendanceFilters
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        totalRecords={filteredRecords.length}
        isLoading={isRefreshing}
      />

      {/* Main Table */}
      <AttendanceTable
        records={paginatedRecords}
        weeklySummary={weeklySummary}
        sortConfig={sortConfig}
        onSort={handleSort}
        isLoading={isRefreshing}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalRecords={filteredRecords.length}
      />

      {/* Empty State */}
      {!isLoading && filteredRecords.length === 0 && (
        <div className={styles["empty-state"]}>
          <FiUsers className={styles["empty-icon"]} />
          <h3>No attendance records found</h3>
          <p>
            {searchQuery || statusFilter !== "all" || locationFilter !== "all"
              ? "Try adjusting your filters or search query"
              : "No attendance data available for the selected date range"}
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className={styles["attendance-footer"]}>
        <div className={styles["footer-info"]}>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Date Range:</span>
            <span className={styles["info-value"]}>
              {format(dateRange.startDate, "MMM dd, yyyy")} - {format(dateRange.endDate, "MMM dd, yyyy")}
            </span>
          </div>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Last Updated:</span>
            <span className={styles["info-value"]}>
              {format(new Date(), "hh:mm a")}
            </span>
          </div>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Data Source:</span>
            <span className={styles["info-value"]}>Live Attendance System</span>
          </div>
        </div>
        <div className={styles["footer-note"]}>
          <FiAlertCircle className={styles["note-icon"]} />
          <span>Data auto-refreshes every 60 seconds. Export for detailed reports.</span>
        </div>
      </div>
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalTitle}
        showCloseButton={true}
      >
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '16px' }}>
          {modalMessage}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={() => setShowModal(false)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </BaseModal>
    </div >
  );
};

export default AttendanceTracking;