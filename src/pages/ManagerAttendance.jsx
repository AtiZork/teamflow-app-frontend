// src/pages/ManagerAttendance.jsx
import Layout from "../components/layout/Layout.jsx";
import Header from "../components/layout/Header.jsx";
import AttendanceTracking from "../components/teams/AttendanceTracking.jsx";
import styles from "../styles/ManagerAttendance.module.css";

const ManagerAttendance = () => {
  return (
    <Layout>
      <Header
        title="Team Attendance"
        subtitle="Monitor and manage team check-ins"
      />
      <div className={styles["manager-container"]}>
        <AttendanceTracking />
      </div>
    </Layout>
  );
};

export default ManagerAttendance;