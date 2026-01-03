// src/components/attendance-tracking/AttendanceTable.jsx
import { FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiEye } from "react-icons/fi";
import AttendanceTableRow from "./AttendanceTableRow.jsx";
import styles from "../../styles/attendance/AttendanceTable.module.css";

const AttendanceTable = ({
  records,
  weeklySummary,
  sortConfig,
  onSort,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalRecords
}) => {
  const columns = [
    { key: "employee.name", label: "Employee", sortable: true },
    { key: "employee.role", label: "Role", sortable: true },
    { key: "checkIn", label: "Check In", sortable: true },
    { key: "breakTime", label: "Break Time", sortable: true },
    { key: "checkOut", label: "Check Out", sortable: true },
    { key: "status", label: "Current Status", sortable: true },
    { key: "location", label: "Location Type", sortable: true },
    { key: "actualLocation", label: "Actual Location", sortable: false },
    { key: "todayHours", label: "Today's Hours", sortable: true },
    { key: "weeklyHours", label: "Weekly Hours", sortable: true },
    { key: "weeklyAttendance", label: "Weekly Attendance", sortable: true },
    { key: "actions", label: "Actions", sortable: false }
  ];

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles["pagination"]}>
        <button
          className={`${styles["page-btn"]} ${styles["prev-btn"]}`}
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <FiChevronLeft />
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              className={`${styles["page-btn"]} ${currentPage === 1 ? styles["active"] : ""}`}
              onClick={() => handlePageClick(1)}
              disabled={isLoading}
            >
              1
            </button>
            {startPage > 2 && <span className={styles["page-dots"]}>...</span>}
          </>
        )}

        {pageNumbers.map(page => (
          <button
            key={page}
            className={`${styles["page-btn"]} ${currentPage === page ? styles["active"] : ""}`}
            onClick={() => handlePageClick(page)}
            disabled={isLoading}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles["page-dots"]}>...</span>}
            <button
              className={`${styles["page-btn"]} ${currentPage === totalPages ? styles["active"] : ""}`}
              onClick={() => handlePageClick(totalPages)}
              disabled={isLoading}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className={`${styles["page-btn"]} ${styles["next-btn"]}`}
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          Next
          <FiChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className={styles["table-container"]}>
      <div className={styles["table-wrapper"]}>
        <table className={styles["attendance-table"]}>
          <thead>
            <tr>
              {columns.map(column => (
                <th 
                  key={column.key}
                  className={`${styles["table-header"]} ${column.sortable ? styles["sortable"] : ""}`}
                  onClick={() => column.sortable && onSort(column.key)}
                  style={{ cursor: column.sortable ? "pointer" : "default" }}
                >
                  <div className={styles["header-content"]}>
                    {column.label}
                    {column.sortable && (
                      <span className={styles["sort-icon"]}>
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading rows
              Array.from({ length: Math.min(5, itemsPerPage) }).map((_, index) => (
                <tr key={`loading-${index}`}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex}>
                      <div className={styles["loading-cell"]}></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length > 0 ? (
              records.map(record => (
                <AttendanceTableRow
                  key={record.id || record.employee?.id}
                  record={record}
                  weeklyData={weeklySummary[record.employee?.id]}
                />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles["no-data"]}>
                  <div className={styles["no-data-content"]}>
                    <FiEye className={styles["no-data-icon"]} />
                    <span>No attendance records to display</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination and Summary */}
      {records.length > 0 && (
        <div className={styles["table-footer"]}>
          <div className={styles["records-info"]}>
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
          </div>
          {renderPagination()}
          <div className={styles["page-size-info"]}>
            {itemsPerPage} per page
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;