import Sidebar from "./Sidebar";
import "../../index.css";

export default function Layout({ children }) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">{children}</main>
        </div>
    );
}
