// src/components/EmployeeDetailModal.jsx
import { FiX, FiCalendar, FiMapPin, FiClock, FiActivity } from "react-icons/fi";
import styles from "../../styles/EmployeeDetailModal.module.css";

const EmployeeDetailModal = ({ employee, onClose }) => {
    if (!employee) return null;

    return (
        <div className={styles["modal-overlay"]} onClick={onClose}>
            <div className={styles["modal-content"]} onClick={e => e.stopPropagation()}>
                <div className={styles["modal-header"]}>
                    <h2>{employee.name}'s Attendance Details</h2>
                    <button className={styles["close-btn"]} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className={styles["modal-body"]}>
                    {/* Add detailed attendance history for this employee */}
                    <div className={styles["detail-grid"]}>
                        <div className={styles["detail-card"]}>
                            <h3>Today's Summary</h3>
                            <div className={styles["detail-item"]}>
                                <FiClock className={styles["icon"]} />
                                <span>Check In:</span>
                                <strong>{employee.checkInTime || '--:--'}</strong>
                            </div>
                            <div className={styles["detail-item"]}>
                                <FiClock className={styles["icon"]} />
                                <span>Check Out:</span>
                                <strong>{employee.checkOutTime || '--:--'}</strong>
                            </div>
                            <div className={styles["detail-item"]}>
                                <FiActivity className={styles["icon"]} />
                                <span>Status:</span>
                                <strong style={{ textTransform: 'capitalize' }}>{employee.status.replace('_', ' ')}</strong>
                            </div>
                            <div className={styles["detail-item"]}>
                                <FiMapPin className={styles["icon"]} />
                                <span>Location:</span>
                                <strong>{employee.location || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailModal;
