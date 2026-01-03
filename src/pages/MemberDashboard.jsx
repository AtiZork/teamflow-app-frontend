import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header.jsx";
import { useEffect, useState, useContext } from "react";
import TaskCard from "../components/tasks/TaskCard";
import TaskModal from "../components/modals/TaskModal";
import { getTasks, updateTask, deleteTask, updateTaskStatusOnly } from "../api/tasks.js";
import { getProjects } from "../api/projects.js";
import { getUsers } from "../api/users.js";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const COLUMNS = ["Open", "To Do", "In Progress", "In QA", "Done"];

const reverseStatusMap = {
  "Open": "open",
  "To Do": "todo",
  "In Progress": "in-progress",
  "In QA": "in_qa",
  "Done": "done",
};

export default function MemberDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalMode, setModalMode] = useState('view');

  // Get user data from multiple sources with fallbacks
  const getUserData = () => {
    // Priority: AuthContext user -> localStorage -> fallbacks
    if (user) {
      return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
      };
    }

    // Fallback to localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser && storedUser.id) {
      return {
        id: storedUser.id,
        full_name: storedUser.full_name || storedUser.name || "Member",
        email: storedUser.email || "member@example.com",
        role: storedUser.role || "member",
        organization_id: storedUser.organization_id || parseInt(localStorage.getItem("organizationId"))
      };
    }

    // Final fallback
    return {
      id: parseInt(localStorage.getItem("userId")) || 0,
      full_name: localStorage.getItem("userName") || "Member",
      email: "member@example.com",
      role: "member",
      organization_id: parseInt(localStorage.getItem("organizationId")) || 0
    };
  };

  const currentUser = getUserData();
  const memberId = currentUser.id;
  const userName = currentUser.full_name;
  const userOrgId = currentUser.organization_id;
  const userRole = currentUser.role;

  console.log("🎯 MemberDashboard component rendering");
  console.log("👤 Current user data:", currentUser);
  console.log("🔍 AuthContext user:", user);
  console.log("📊 Derived data:", { memberId, userName, userOrgId, userRole });

  // Load all data function with better error handling
  const loadAllData = async () => {
    if (!memberId || !userOrgId) {
      console.warn("⚠️ Cannot load data - missing memberId or userOrgId");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Loading member dashboard data...");

      // Load tasks with error handling
      let tasksData = [];
      try {
        tasksData = await getTasks();
        console.log(`📊 Loaded ${tasksData.length} total tasks from API`);
      } catch (error) {
        console.error("❌ Failed to load tasks:", error);
        tasksData = [];
        // Don't show toast for auth errors - they're handled by AuthContext
        if (!error.message?.includes("token") && !error.message?.includes("401")) {
          toast.error("Failed to load tasks");
        }
      }

      // Filter tasks for current member
      const userTasks = tasksData.filter(task => {
        // Check if task has member_ids array and includes current member
        if (task.member_ids && Array.isArray(task.member_ids)) {
          return task.member_ids.includes(parseInt(memberId));
        }
        // Fallback for old member_id field
        if (task.member_id) {
          return task.member_id === parseInt(memberId);
        }
        return false;
      });

      console.log(`✅ Filtered ${userTasks.length} tasks for member ${memberId}`);

      // Normalize task statuses
      const statusMap = {
        open: "Open",
        todo: "To Do",
        "in-progress": "In Progress",
        inprogress: "In Progress",
        qa: "In QA",
        "in_qa": "In QA",
        done: "Done",
      };

      const normalizedTasks = userTasks.map((task) => ({
        ...task,
        // Ensure member_ids is always an array
        member_ids: task.member_ids || (task.member_id ? [task.member_id] : []),
        status: statusMap[task.status?.toLowerCase().replace(/[-\s]/g, "")] || "Open",
      }));

      setTasks(normalizedTasks);

      // Load projects
      let projectsData = [];
      try {
        projectsData = await getProjects();
        setProjects(projectsData || []);
        console.log(`✅ Loaded ${projectsData?.length || 0} projects`);
      } catch (error) {
        console.error("❌ Failed to load projects:", error);
        setProjects([]);
      }

      // Load users based on role
      let usersData = [];
      if (userRole === "admin" || userRole === "super_admin") {
        try {
          usersData = await getUsers();
          const orgUsers = usersData.filter(u => u.organization_id === userOrgId);
          setUsers(orgUsers);
          console.log(`✅ Loaded ${orgUsers.length} users (admin access)`);
        } catch (error) {
          console.warn("⚠️ Could not fetch users, using minimal user set:", error.message);
          createMinimalUserSet(normalizedTasks);
        }
      } else {
        // For members, create minimal user set
        createMinimalUserSet(normalizedTasks);
        console.log("ℹ️ Member role - using minimal user set");
      }

    } catch (error) {
      console.error("❌ Unexpected error in loadAllData:", error);
      toast.error("Failed to load dashboard data");
      setTasks([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to create minimal user set
  const createMinimalUserSet = (tasks) => {
    const minimalUsers = [
      {
        id: parseInt(memberId),
        full_name: currentUser.full_name,
        email: currentUser.email,
        organization_id: userOrgId,
        role: userRole
      }
    ];

    // Add other members from tasks
    const memberIds = new Set();
    tasks.forEach(task => {
      if (task.member_ids && Array.isArray(task.member_ids)) {
        task.member_ids.forEach(id => {
          if (id !== parseInt(memberId)) {
            memberIds.add(id);
          }
        });
      }
    });

    // Create placeholder users for other members
    memberIds.forEach(id => {
      minimalUsers.push({
        id: id,
        full_name: `Team Member ${id}`,
        email: `member${id}@example.com`,
        organization_id: userOrgId,
        role: 'member'
      });
    });

    setUsers(minimalUsers);
    console.log(`✅ Created minimal user set with ${minimalUsers.length} users`);
  };

  useEffect(() => {
    console.log("🎯 useEffect triggered in MemberDashboard");

    // Wait for auth to load, then load data
    if (!authLoading) {
      if (memberId && userOrgId) {
        loadAllData();
      } else {
        console.warn("⚠️ Missing required user data:", {
          memberId,
          userOrgId,
          authLoading,
          hasToken: !!localStorage.getItem("token")
        });
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, userOrgId, authLoading]);



  // Task Modal Functions
  const openViewTaskModal = (task) => {
    setSelectedTask(task);
    setModalMode('view');
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setModalMode('edit');
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
    setModalMode('view');
  };

  const handleSaveTask = async (taskData) => {
    try {
      const backendStatus = reverseStatusMap[taskData.status] || (taskData.status || "").toLowerCase().replace(/\s+/g, "-");

      if (userRole === "member") {
        // Member: allowed to change status only — call PATCH endpoint
        const updated = await updateTaskStatusOnly(selectedTask.id, backendStatus);

        // Normalize returned status for UI
        const statusMap = {
          open: "Open",
          todo: "To Do",
          "in-progress": "In Progress",
          inprogress: "In Progress",
          "in_qa": "In QA",  // This will now match
          inqa: "In QA",
          qa: "In QA",
          done: "Done",
        };

        const normalized = {
          ...selectedTask,
          ...updated,
          status: statusMap[updated.status?.toLowerCase().replace(/\s/g, "")] || updated.status || taskData.status
          // Only remove spaces ↑, keep underscores and dashes
        };

        setTasks(prev => prev.map(t => t.id === selectedTask.id ? normalized : t));
        toast.success("Task status updated");
        closeTaskModal();
        return;
      }

      // Admin path: full update allowed
      const updatedTask = await updateTask(selectedTask.id, taskData);
      // Normalize status for UI (same mapping)
      const statusMap = {
        open: "Open",
        todo: "To Do",
        "in-progress": "In Progress",
        inprogress: "In Progress",
        qa: "In QA",
        "in_qa": "In QA",
        done: "Done",
      };
      const normalizedTask = {
        ...updatedTask,
        status: statusMap[updatedTask.status?.toLowerCase().replace(/[-\s]/g, "")] || updatedTask.status
      };
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? normalizedTask : t));
      toast.success("Task updated successfully");
      closeTaskModal();

    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.message || "Failed to delete task");
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      // member-safe status-only patch
      await updateTaskStatusOnly(draggedTask.id, reverseStatusMap[newStatus]);
      setTasks(prev =>
        prev.map(t => (t.id === draggedTask.id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDraggedTask(null);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <Layout>
        <div className="loading-state">
          <p>Checking authentication...</p>
        </div>
      </Layout>
    );
  }

  // Show message if no user data
  if (!memberId || !userOrgId) {
    return (
      <Layout>
        <Header
          title="Welcome 👋"
          subtitle="Please log in to access your tasks."
        />
        <div className="error-state">
          <p>Unable to load user information. Please log in again.</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title={`Hello, ${userName} 👋`}
        subtitle="Manage your assigned tasks across projects."
      />

      {userRole && (
        <div className={`role-badge ${userRole}`}>
          {userRole === 'member' && '👤 Team Member'}
          {userRole === 'admin' && '🛠️ Administrator'}
          {userRole === 'super_admin' && '🛡️ Super Administrator'}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <p>Loading your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks assigned to you yet.</p>
          <p className="empty-state-subtitle">Tasks assigned to you will appear here.</p>
        </div>
      ) : (
        <section className="kanban-board">
          <div className="kanban-columns">
            {COLUMNS.map((col) => (
              <TaskCard
                key={col}
                title={col}
                tasks={tasks.filter((t) => t.status === col)}
                onAdd={null}
                onEdit={openEditTaskModal}
                onView={openViewTaskModal}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col)}
                showAddButton={false}
                users={users}
              />
            ))}
          </div>
        </section>
      )}

      {showTaskModal && (
        <TaskModal
          onClose={closeTaskModal}
          onSave={handleSaveTask}
          editing={selectedTask}
          column={selectedTask?.status}
          projects={projects}
          users={users}
          viewOnly={modalMode === 'view'}
        />
      )}
    </Layout>
  );
}