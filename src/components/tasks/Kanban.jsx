
// src/components/Kanban.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import TaskCard from "./TaskCard";
import TaskModal from "../modals/TaskModal";
import ConfirmationModal from "../modals/ConfirmationModal.jsx";
import { openViewTaskModal } from "./ViewTask.jsx";
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatusOnly } from "../../api/tasks.js";
import { getUsers } from "../../api/users.js";
import { getProjects } from "../../api/projects.js";
import { refreshDashboardData } from "../../api/getMembers";
import toast from "react-hot-toast";

const COLUMNS = ["Open", "To Do", "In Progress", "In QA", "Done"];

const Kanban = forwardRef((_props, ref) => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingDependencies, setLoadingDependencies] = useState(true);
    const [draggedTask, setDraggedTask] = useState(null);

    // Unified modal state
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalMode, setModalMode] = useState('edit'); // 'edit' or 'view'
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Confirmation modal state
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({
        title: "",
        message: "",
        onConfirm: () => { }
    });

    const adminName = localStorage.getItem("userName") || "Admin";

    // Your frontend mapping
    const statusMap = {
        open: "Open",
        todo: "To Do",
        "inprogress": "In Progress",
        "in-progress": "In Progress",
        qa: "In QA",
        inqa: "In QA",
        "in_qa": "In QA",
        done: "Done",
    };

    const reverseStatusMap = {
        "Open": "open",
        "To Do": "todo",
        "In Progress": "in-progress",
        "In QA": "in_qa",
        "Done": "done",
    };

    const loadTasks = async () => {
        if (projects.length === 0 || users.length === 0) return;

        try {
            const data = await getTasks();
            const normalized = data.map((t) => {
                const memberIds = t.member_ids || (t.member_id ? [t.member_id] : []);
                const members = memberIds.map(memberId =>
                    users.find(u => u.id === memberId)
                ).filter(Boolean);

                const project = projects.find((p) => p.id === t.project_id);
                return {
                    ...t,
                    status: statusMap[t.status?.toLowerCase().replace(/[-\s]/g, "")] || "Open",
                    project_name: project?.title || "Unknown Project",
                    members: members,
                    created_by_name: adminName,
                };
            });
            setTasks(normalized);
        } catch (e) {
            console.error("❌ loadTasks error:", e);
            toast.error("Failed to load tasks");
            setTasks([]);
        }
    };

    useEffect(() => {
        const loadProjectsAndUsers = async () => {
            try {
                setLoadingDependencies(true);

                // Check user role before fetching users
                const user = JSON.parse(localStorage.getItem("user"));
                let userData = [];

                if (user?.role === "admin" || user?.role === "super_admin") {
                    userData = await getUsers();
                } else {
                    // Members don't fetch users list
                    userData = [];
                }

                const projData = await getProjects();
                setProjects(projData || []);
                setUsers(userData || []);
            } catch (e) {
                console.error("Failed to load projects or users:", e);
                toast.error("Failed to load dependencies");
                setProjects([]);
                setUsers([]);
            } finally {
                setLoadingDependencies(false);
            }
        };
        loadProjectsAndUsers();
    }, []);

    useEffect(() => {
        if (!loadingDependencies && projects.length > 0 && users.length > 0) {
            loadTasks();
        }
    }, [projects, users, loadingDependencies]);

    // Auto-refresh (optional)
    useEffect(() => {
        if (!loadingDependencies && projects.length > 0 && users.length > 0) {
            const interval = setInterval(loadTasks, 2000);
            return () => clearInterval(interval);
        }
    }, [loadingDependencies, projects, users]);

    // Open modal for creating or editing
    const openEditModal = (col = "Open", task = null) => {
        if (loadingDependencies) {
            toast.error("Loading team members and projects...");
            return;
        }
        if (users.length === 0) {
            toast.error("No team members available.");
            return;
        }
        setSelectedTask(task);
        setModalMode('edit');
        setShowTaskModal(true);
    };

    // Open modal for viewing (uses your new utility)
    const viewTask = (task) => {
        openViewTaskModal(
            task,
            setSelectedTask,
            setModalMode,
            setShowTaskModal,
            loadingDependencies,
            toast
        );
    };

    useImperativeHandle(ref, () => ({
        openCreateModal: () => openEditModal("Open")
    }));

    const closeTaskModal = () => {
        setShowTaskModal(false);
        setSelectedTask(null);
    };

    const saveTask = async (payload) => {
        try {
            const backendStatus = reverseStatusMap[payload.status] || payload.status.toLowerCase().replace(/ /g, "-");

            const taskPayload = {
                ...payload,
                status: backendStatus,
                // Ensure member_ids is preserved as an array
                member_ids: payload.member_ids || []
            };

            // Remove undefined and empty fields (but keep member_ids even if empty array)
            Object.keys(taskPayload).forEach(key => {
                if (taskPayload[key] === undefined) {
                    delete taskPayload[key];
                }
            });

            // Members: only send status if allow_member_edit = false
            const userRole = localStorage.getItem("userRole") || "";
            if (userRole === "MEMBER" && !payload.allow_member_edit) {
                // Send only status
                const statusOnlyPayload = { status: backendStatus };
                const updated = await updateTask(payload.id, statusOnlyPayload);
                toast.success("Task status updated successfully!");
                closeTaskModal();
                loadTasks();
                return;
            }

            // Admin or editable members
            let updatedTask;
            if (payload.id) {
                // ✅ FIXED: Ensure member_ids is sent for updates
                console.log("🔄 Updating task with payload:", taskPayload);
                updatedTask = await updateTask(payload.id, taskPayload);
                toast.success("Task updated successfully!");
            } else {
                // ✅ FIXED: Ensure member_ids is sent for creation
                console.log("🆕 Creating task with payload:", taskPayload);
                updatedTask = await createTask(taskPayload);
                toast.success("Task created successfully!");
            }

            const project = projects.find(p => p.id === updatedTask.project_id);
            const members = updatedTask.member_ids?.map(id => users.find(u => u.id === id)).filter(Boolean) || [];
            const statusKey = updatedTask.status.toLowerCase().replace(/[-\s]/g, "");
            const displayStatus = statusMap[statusKey] || "Open";

            const normalizedTask = {
                ...updatedTask,
                status: displayStatus,
                project_name: project?.title || "Unknown Project",
                members,
                created_by_name: adminName,
            };

            setTasks(prev => payload.id
                ? prev.map(t => t.id === payload.id ? normalizedTask : t)
                : [...prev, normalizedTask]
            );

            closeTaskModal();
        } catch (e) {
            console.error("Save task error:", e);
            toast.error(e.message || "Task operation failed");
        }
    };

    const editTask = (task) => openEditModal(task.status, task);

    const removeTask = async (taskId) => {
        setConfirmationConfig({
            title: "Delete Task",
            message: "Are you sure you want to delete this task?",
            onConfirm: async () => {
                try {
                    await deleteTask(taskId);
                    toast.success("🗑️ Task deleted successfully!");
                    setTasks(prev => prev.filter(t => t.id !== taskId));
                } catch (e) {
                    toast.error(e.message || "Failed to delete task");
                }
            }
        });
        setShowConfirmation(true);
    };

    // Drag and Drop Handlers
    const handleDragStart = (task) => setDraggedTask(task);
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
            // Update backend
            await updateTaskStatusOnly(draggedTask.id, reverseStatusMap[newStatus]);

            // Update frontend instantly
            setTasks(prev =>
                prev.map(t => (t.id === draggedTask.id ? { ...t, status: newStatus } : t))
            );
            toast.success(`Task moved to ${newStatus}`);

            // Refresh Admin Dashboard + Reports data
            try {
                await refreshDashboardData();
                console.log("✅ Dashboard & reports data refreshed");
            } catch (refreshErr) {
                console.warn("⚠️ Dashboard refresh skipped:", refreshErr);
            }

        } catch (err) {
            toast.error(err.message || "Failed to move task");
        } finally {
            setDraggedTask(null);
        }
    };

    return (
        <div className="kanban-board">
            <div className="kanban-columns">
                {COLUMNS.map((col) => (
                    <TaskCard
                        key={col}
                        title={col}
                        tasks={tasks.filter((t) => t.status === col)}
                        onAdd={() => openEditModal(col)}
                        onView={viewTask}
                        onEdit={editTask}
                        onDelete={removeTask}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col)}
                        showAddButton={true}
                        users={users}
                    />
                ))}
            </div>

            {/* Unified TaskModal */}
            {showTaskModal && (
                <TaskModal
                    onClose={closeTaskModal}
                    onSave={saveTask}
                    editing={selectedTask}
                    column={selectedTask?.status || "Open"}
                    projects={projects}
                    users={users}
                    viewOnly={modalMode === 'view'}
                />
            )}

            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={confirmationConfig.onConfirm}
                title={confirmationConfig.title}
                message={confirmationConfig.message}
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />
        </div>
    );
});

Kanban.displayName = 'Kanban';
export default Kanban;
