// src/components/teams/AttendanceFilters.jsx
import { FiSearch, FiFilter, FiCalendar, FiDownload, FiUsers } from "react-icons/fi";
import { format } from "date-fns";
import styles from "../../styles/attendance/AttendanceFilters.module.css";
import { getWorkLocationOptions, getAttendanceStatusOptions } from "../../api/attendance";

const AttendanceFilters = ({
  dateRange,
  onDateRangeChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
  roleFilter,
  onRoleFilterChange,
  viewMode,
  onViewModeChange,
  onExport,
  totalRecords,
  isLoading
}) => {
  const workLocations = getWorkLocationOptions();
  const statusOptions = getAttendanceStatusOptions();
  
  const roleOptions = [
    { value: "all", label: "All Roles" },
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "member", label: "Member" }
  ];

  const handleStartDateChange = (e) => {
    const newDate = new Date(e.target.value);
    onDateRangeChange({ ...dateRange, startDate: newDate });
  };

  const handleEndDateChange = (e) => {
    const newDate = new Date(e.target.value);
    onDateRangeChange({ ...dateRange, endDate: newDate });
  };

  const handleSearch = (e) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className={styles["filters-container"]}>
      {/* Quick Date Presets */}
      <div className={styles["quick-date-presets"]}>
        <button
          className={styles["date-preset"]}
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            onDateRangeChange({ startDate: weekAgo, endDate: today });
          }}
        >
          Last 7 Days
        </button>
        <button
          className={styles["date-preset"]}
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            onDateRangeChange({ startDate: monthAgo, endDate: today });
          }}
        >
          Last 30 Days
        </button>
        <button
          className={styles["date-preset"]}
          onClick={() => {
            const today = new Date();
            onDateRangeChange({ startDate: today, endDate: today });
          }}
        >
          Today
        </button>
      </div>

      <div className={styles["filters-grid"]}>
        {/* Date Range */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>
            <FiCalendar className={styles["filter-icon"]} />
            Date Range
          </label>
          <div className={styles["date-inputs"]}>
            <input
              type="date"
              value={format(dateRange.startDate, "yyyy-MM-dd")}
              onChange={handleStartDateChange}
              className={styles["date-input"]}
              disabled={isLoading}
            />
            <span className={styles["date-separator"]}>to</span>
            <input
              type="date"
              value={format(dateRange.endDate, "yyyy-MM-dd")}
              onChange={handleEndDateChange}
              className={styles["date-input"]}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Search */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>
            <FiSearch className={styles["filter-icon"]} />
            Search Employees
          </label>
          <div className={styles["search-container"]}>
            <FiSearch className={styles["search-icon"]} />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles["search-input"]}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>
            <FiFilter className={styles["filter-icon"]} />
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className={styles["filter-select"]}
            disabled={isLoading}
          >
            <option value="all">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>
            <FiUsers className={styles["filter-icon"]} />
            Location
          </label>
          <select
            value={locationFilter}
            onChange={(e) => onLocationFilterChange(e.target.value)}
            className={styles["filter-select"]}
            disabled={isLoading}
          >
            <option value="all">All Locations</option>
            {workLocations.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className={styles["filter-group"]}>
          <label className={styles["filter-label"]}>
            <FiUsers className={styles["filter-icon"]} />
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className={styles["filter-select"]}
            disabled={isLoading}
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles["action-bar"]}>
        <div className={styles["records-count"]}>
          Showing <strong>{totalRecords}</strong> records
        </div>
        
        {/* View Toggle (Future) */}
        <div className={styles["view-toggle"]}>
          <button
            className={`${styles["view-btn"]} ${viewMode === "list" ? styles["active"] : ""}`}
            onClick={() => onViewModeChange("list")}
            disabled={isLoading}
          >
            List View
          </button>
          <button
            className={`${styles["view-btn"]} ${viewMode === "calendar" ? styles["active"] : ""}`}
            onClick={() => onViewModeChange("calendar")}
            disabled={isLoading}
          >
            Calendar View
          </button>
        </div>

        {/* Export Button */}
        <button
          className={styles["export-btn"]}
          onClick={onExport}
          disabled={isLoading || totalRecords === 0}
        >
          <FiDownload className={styles["export-icon"]} />
          Export Report
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilters;