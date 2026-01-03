import {
  FiUsers,
  FiCheckCircle,
  FiCalendar,
  FiHome,
  FiTrendingUp
} from "react-icons/fi";
import styles from "../../styles/attendance/AttendanceStatsCards.module.css";

const AttendanceStatsCards = ({ stats, isLoading }) => {
  // Helper to get numeric hours for progress bar
  const getNumericHours = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.includes(':')) {
      const [h, m] = val.split(':').map(Number);
      return h + (m / 60);
    }
    return parseFloat(val) || 0;
  };

  const cards = [
    {
      id: "total_employees",
      title: "Total Employees",
      value: stats.total_employees || 0,
      icon: <FiUsers />,
      color: "#3B82F6",
      bgColor: "#EFF6FF"
    },
    {
      id: "present_today",
      title: "Present Today",
      value: stats.present_today || 0,
      icon: <FiCheckCircle />,
      color: "#10B981",
      bgColor: "#ECFDF5"
    },
    {
      id: "on_leave",
      title: "On Leave",
      value: stats.on_leave || 0,
      icon: <FiCalendar />,
      color: "#F59E0B",
      bgColor: "#FFFBEB"
    },
    {
      id: "remote_work",
      title: "Remote Work",
      value: stats.remote_work || 0,
      icon: <FiHome />,
      color: "#8B5CF6", // Purple for Remote
      bgColor: "#F5F3FF"
    },
    {
      id: "average_hours",
      title: "Avg. Hours",
      value: stats.average_hours || "00:00",
      icon: <FiTrendingUp />,
      color: "#6366F1", // Indigo for Avg Hours to differentiate
      bgColor: "#EEF2FF"
    }
  ];

  return (
    <div className={styles["stats-cards"]}>
      {cards.map(card => (
        <div
          key={card.id}
          className={styles["stat-card"]}
          style={{ backgroundColor: card.bgColor }}
        >
          <div className={styles["stat-content"]}>
            <div className={styles["stat-text"]}>
              <div className={styles["stat-value"]}>
                {isLoading ? (
                  <div className={styles["value-skeleton"]}></div>
                ) : (
                  // Display value as is (logic handled in card definition)
                  typeof card.value === 'number' && card.id === 'average_hours'
                    ? card.value.toFixed(1)
                    : card.value
                )}
              </div>
              <div className={styles["stat-title"]}>{card.title}</div>
            </div>
            <div
              className={styles["stat-icon"]}
              style={{ color: card.color }}
            >
              {card.icon}
            </div>
          </div>

          {/* Progress bar for average hours */}
          {card.id === "average_hours" && !isLoading && (
            <div className={styles["progress-bar"]}>
              <div
                className={styles["progress-fill"]}
                style={{
                  width: `${Math.min(100, (getNumericHours(card.value) / 8) * 100)}%`,
                  backgroundColor: card.color
                }}
              ></div>
              <div className={styles["progress-labels"]}>
                <span>0h</span>
                <span>Target: 8h</span>
                <span>12h</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AttendanceStatsCards;