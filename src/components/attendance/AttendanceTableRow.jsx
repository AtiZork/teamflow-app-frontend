// src/components/attendance/AttendanceTableRow.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { FiMapPin, FiClock, FiExternalLink, FiEye } from "react-icons/fi";
import { formatAttendanceTime, calculateTotalHours, getAttendanceStatusColor } from "../../api/attendance";
import EmployeeDetailModal from "../modals/EmployeeDetailModal";
import styles from "../../styles/attendance/AttendanceTableRow.module.css";

const AttendanceTableRow = ({ record, weeklyData }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getAvatarInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return "#6B7280";
    const colors = [
      "#3B82F6",
      "#10B981",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
      "#EF4444",
      "#06B6D4",
    ];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const calculateTodayHours = () => {
    if (record.checkIn && record.checkOut) {
      return calculateTotalHours(record.checkIn, record.checkOut);
    }
    return record.totalHours || "00:00";
  };

  const getWeeklyHours = () => {
    if (weeklyData && weeklyData.total_hours) {
      return weeklyData.total_hours;
    }
    return record.weeklyHours || "00:00";
  };

  const getWeeklyAttendance = () => {
    if (weeklyData && weeklyData.days_worked && weeklyData.total_days) {
      return `${weeklyData.days_worked}/${weeklyData.total_days} days`;
    }
    if (record.presentDays !== undefined) {
      return `${record.presentDays}/5 days`;
    }
    if (typeof record.weeklyAttendance === "number") {
      const days = Math.round((record.weeklyAttendance / 100) * 5);
      return `${days}/5 days`;
    }
    return record.weeklyAttendance || "0/5 days";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      present: "Present",
      absent: "Absent",
      leave: "On Leave",
      half_day: "Half Day",
      late: "Late",
      working: "Working",
      on_break: "On Break",
      checked_out: "Checked Out",
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status) => {
    const color = getAttendanceStatusColor(status);
    return {
      backgroundColor: `${color}15`,
      color: color,
      borderColor: `${color}30`,
    };
  };

  const formatLocation = (location) => {
    if (!location) return "N/A";
    if (location.length > 30) {
      return `${location.substring(0, 27)}...`;
    }
    return location;
  };

  const employee = record.employee || {};
  const avatarColor = getAvatarColor(employee.name);
  const avatarInitials = getAvatarInitials(employee.name);
  const todayHours = calculateTodayHours();
  const weeklyHours = getWeeklyHours();
  const weeklyAttendance = getWeeklyAttendance();
  const statusBadge = getStatusBadge(record.status);
  const statusStyle = getStatusStyle(record.status);

  const handleExportIndividual = () => {
    const headers = [
      "Employee",
      "Email",
      "Role",
      "Check In",
      "Check Out",
      "Break",
      "Status",
      "Location",
      "Today Hours",
      "Weekly Hours",
    ];
    const row = [
      employee.name || "",
      employee.email || "",
      employee.role || "",
      record.checkIn || "",
      record.checkOut || "",
      record.breakTime || "",
      record.status || "",
      record.actualLocation || record.location || "",
      todayHours,
      weeklyHours,
    ];
    const csv = [
      headers.join(","),
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (employee.name || "employee").replace(/\s+/g, "_").toLowerCase();
    link.href = url;
    link.download = `attendance_${safeName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <tr className={styles["table-row"]}>
      <td className={styles["employee-cell"]}>
        <div className={styles["employee-info"]}>
          <div className={styles["avatar"]} style={{ backgroundColor: avatarColor }}>
            {avatarInitials}
          </div>
          <div className={styles["employee-details"]}>
            <div className={styles["employee-name"]}>{employee.name || "Unknown"}</div>
            <div className={styles["employee-email"]}>{employee.email || "No email"}</div>
            <div className={styles["employee-role"]}>{employee.role || "N/A"}</div>
          </div>
        </div>
      </td>

      <td className={styles["role-cell"]}>
        <div className={styles["role-badge"]}>
          {employee.role === "super_admin" && "Super Admin"}
          {employee.role === "admin" && "Admin"}
          {employee.role === "member" && "Member"}
          {!employee.role && "N/A"}
        </div>
      </td>

      <td className={styles["time-cell"]}>
        {record.checkIn ? (
          <div className={styles["time-value"]}>{formatAttendanceTime(record.checkIn)}</div>
        ) : (
          <span className={styles["no-data"]}>--:--</span>
        )}
      </td>

      <td className={styles["time-cell"]}>
        {record.breakTime && record.breakTime !== "00:00" ? (
          <div className={styles["break-time"]}>
            <FiClock className={styles["break-icon"]} />
            {record.breakTime}
          </div>
        ) : (
          <span className={styles["no-data"]}>No breaks</span>
        )}
      </td>

      <td className={styles["time-cell"]}>
        {record.checkOut ? (
          <div className={styles["time-value"]}>{formatAttendanceTime(record.checkOut)}</div>
        ) : record.status === "working" ? (
          <span className={styles["active-indicator"]}>Active</span>
        ) : (
          <span className={styles["no-data"]}>--:--</span>
        )}
      </td>

      <td className={styles["status-cell"]}>
        <span className={styles["status-badge"]} style={statusStyle}>
          {statusBadge}
        </span>
      </td>

      <td className={styles["location-cell"]}>
        {record.location ? (
          <div className={styles["location-type"]}>{record.location}</div>
        ) : (
          <span className={styles["no-data"]}>N/A</span>
        )}
      </td>

      <td className={styles["location-cell"]}>
        {record.actualLocation || record.address ? (
          <div className={styles["actual-location"]}>
            <FiMapPin className={styles["location-icon"]} />
            <span title={record.actualLocation || record.address}>
              {formatLocation(record.actualLocation || record.address)}
            </span>
          </div>
        ) : (
          <span className={styles["no-data"]}>Not tracked</span>
        )}
      </td>

      <td className={styles["hours-cell"]}>
        <div className={styles["hours-value"]}>
          {todayHours}
          {todayHours !== "00:00" && (
            <div className={styles["hours-progress"]}>
              <div
                className={styles["hours-progress-bar"]}
                style={{
                  width: `${
                    ((parseInt(todayHours.split(":")[0]) +
                      parseInt(todayHours.split(":")[1]) / 60) /
                      8) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          )}
        </div>
      </td>

      <td className={styles["hours-cell"]}>
        <div className={styles["hours-value"]}>
          {weeklyHours}
          <div className={styles["hours-trend"]}>
            {weeklyData && weeklyData.trend && (
              <span className={styles[`trend-${weeklyData.trend}`]}>
                {weeklyData.trend === "up" ? "↗" : weeklyData.trend === "down" ? "↘" : "→"}
              </span>
            )}
          </div>
        </div>
      </td>

      <td className={styles["attendance-cell"]}>
        <div className={styles["attendance-value"]}>
          {weeklyAttendance}
          <div className={styles["attendance-progress"]}>
            <div
              className={styles["attendance-progress-bar"]}
              style={{
                width:
                  typeof weeklyAttendance === "string" && weeklyAttendance.includes("/")
                    ? `${
                        (parseInt(weeklyAttendance.split("/")[0]) /
                          parseInt(weeklyAttendance.split("/")[1])) *
                        100
                      }%`
                    : "0%",
              }}
            ></div>
          </div>
        </div>
      </td>

      <td className={styles["actions-cell"]}>
        <div className={styles["action-buttons"]}>
          <button
            className={styles["view-btn"]}
            title="View Details"
            onClick={() => setShowDetails(true)}
          >
            <FiEye />
          </button>
          <button
            className={styles["export-btn"]}
            title="Export Individual Report"
            onClick={handleExportIndividual}
          >
            <FiExternalLink />
          </button>
        </div>
        {showDetails &&
          createPortal(
            <EmployeeDetailModal
              employee={{
                name: employee.name || "Unknown",
                checkInTime: record.checkIn || "--:--",
                checkOutTime: record.checkOut || "--:--",
                status: record.status || "absent",
                location: record.actualLocation || record.location || "N/A",
              }}
              onClose={() => setShowDetails(false)}
            />,
            document.body
          )}
      </td>
    </tr>
  );
};

export default AttendanceTableRow;
