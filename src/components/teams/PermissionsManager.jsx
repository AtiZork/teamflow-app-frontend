// src/components/teams/PermissionsManager.jsx
import { useState } from "react";
import { FiShield, FiSave, FiAlertCircle } from "react-icons/fi";
import styles from "../../styles/TeamManagement.module.css";

const PermissionsManager = () => {
    const [selectedRole, setSelectedRole] = useState("admin");
    const [hasChanges, setHasChanges] = useState(false);

    const roles = [
        {
            id: "admin",
            name: "Admin",
            color: "#3b82f6",
            memberCount: 3,
            description: "Full access to all features"
        },
        {
            id: "member",
            name: "Member",
            color: "#10b981",
            memberCount: 12,
            description: "Standard team member access"
        },
        {
            id: "viewer",
            name: "Viewer",
            color: "#6b7280",
            memberCount: 5,
            description: "Read-only access"
        }
    ];

    const permissions = {
        admin: {
            teamManagement: {
                viewTeam: true,
                inviteMembers: true,
                removeMembers: true,
                editRoles: true
            },
            attendance: {
                viewOwn: true,
                viewAll: true,
                approveRequests: true,
                exportReports: true
            },
            projects: {
                viewOwn: true,
                viewAll: true,
                createProjects: true,
                deleteProjects: true
            },
            tasks: {
                viewOwn: true,
                viewAll: true,
                createTasks: true,
                assignTasks: true,
                deleteTasks: true
            }
        },
        member: {
            teamManagement: {
                viewTeam: true,
                inviteMembers: false,
                removeMembers: false,
                editRoles: false
            },
            attendance: {
                viewOwn: true,
                viewAll: false,
                approveRequests: false,
                exportReports: false
            },
            projects: {
                viewOwn: true,
                viewAll: true,
                createProjects: false,
                deleteProjects: false
            },
            tasks: {
                viewOwn: true,
                viewAll: false,
                createTasks: true,
                assignTasks: false,
                deleteTasks: false
            }
        },
        viewer: {
            teamManagement: {
                viewTeam: true,
                inviteMembers: false,
                removeMembers: false,
                editRoles: false
            },
            attendance: {
                viewOwn: true,
                viewAll: false,
                approveRequests: false,
                exportReports: false
            },
            projects: {
                viewOwn: true,
                viewAll: false,
                createProjects: false,
                deleteProjects: false
            },
            tasks: {
                viewOwn: true,
                viewAll: false,
                createTasks: false,
                assignTasks: false,
                deleteTasks: false
            }
        }
    };

    const [rolePermissions, setRolePermissions] = useState(permissions);

    const handlePermissionToggle = (category, permission) => {
        setRolePermissions(prev => ({
            ...prev,
            [selectedRole]: {
                ...prev[selectedRole],
                [category]: {
                    ...prev[selectedRole][category],
                    [permission]: !prev[selectedRole][category][permission]
                }
            }
        }));
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        // API call to save permissions
        console.log("Saving permissions:", rolePermissions);
        setHasChanges(false);
    };

    const permissionCategories = [
        {
            id: "teamManagement",
            title: "Team Management",
            permissions: [
                { id: "viewTeam", label: "View Team Members", description: "Can view team member list and details" },
                { id: "inviteMembers", label: "Invite Members", description: "Can send invitations to new team members" },
                { id: "removeMembers", label: "Remove Members", description: "Can remove members from the team" },
                { id: "editRoles", label: "Edit Roles", description: "Can change member roles and permissions" }
            ]
        },
        {
            id: "attendance",
            title: "Attendance & Leave",
            permissions: [
                { id: "viewOwn", label: "View Own Attendance", description: "Can view own attendance records" },
                { id: "viewAll", label: "View All Attendance", description: "Can view all team attendance records" },
                { id: "approveRequests", label: "Approve Leave Requests", description: "Can approve or reject leave requests" },
                { id: "exportReports", label: "Export Reports", description: "Can export attendance reports" }
            ]
        },
        {
            id: "projects",
            title: "Projects",
            permissions: [
                { id: "viewOwn", label: "View Own Projects", description: "Can view assigned projects" },
                { id: "viewAll", label: "View All Projects", description: "Can view all team projects" },
                { id: "createProjects", label: "Create Projects", description: "Can create new projects" },
                { id: "deleteProjects", label: "Delete Projects", description: "Can delete projects" }
            ]
        },
        {
            id: "tasks",
            title: "Tasks",
            permissions: [
                { id: "viewOwn", label: "View Own Tasks", description: "Can view assigned tasks" },
                { id: "viewAll", label: "View All Tasks", description: "Can view all team tasks" },
                { id: "createTasks", label: "Create Tasks", description: "Can create new tasks" },
                { id: "assignTasks", label: "Assign Tasks", description: "Can assign tasks to team members" },
                { id: "deleteTasks", label: "Delete Tasks", description: "Can delete tasks" }
            ]
        }
    ];

    return (
        <div className={styles.permissionsManager}>
            <div className={styles.permissionsGrid}>
                {/* Roles Sidebar */}
                <div className={styles.rolesSidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>Roles</h3>
                    </div>
                    <div className={styles.roleList}>
                        {roles.map(role => (
                            <button
                                key={role.id}
                                className={`${styles.roleItem} ${selectedRole === role.id ? styles.selectedRole : ''}`}
                                style={{ borderLeftColor: role.color }}
                                onClick={() => setSelectedRole(role.id)}
                            >
                                <div className={styles.roleHeader}>
                                    <div className={styles.roleName}>
                                        <div
                                            className={styles.roleColorDot}
                                            style={{ backgroundColor: role.color }}
                                        />
                                        {role.name}
                                    </div>
                                    <span className={styles.roleMemberCount}>{role.memberCount}</span>
                                </div>
                                <p className={styles.roleDescription}>{role.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permissions Panel */}
                <div className={styles.permissionsPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h3>Permissions for {roles.find(r => r.id === selectedRole)?.name}</h3>
                            <p className={styles.panelSubtitle}>
                                Configure what this role can access and modify
                            </p>
                        </div>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSaveChanges}
                            disabled={!hasChanges}
                        >
                            <FiSave /> Save Changes
                        </button>
                    </div>

                    {permissionCategories.map(category => (
                        <div key={category.id} className={styles.permissionCategory}>
                            <h4 className={styles.categoryTitle}>{category.title}</h4>
                            <div className={styles.permissionItems}>
                                {category.permissions.map(permission => (
                                    <div key={permission.id} className={styles.permissionItem}>
                                        <div className={styles.permissionInfo}>
                                            <div className={styles.permissionLabel}>{permission.label}</div>
                                            <div className={styles.permissionDescription}>
                                                {permission.description}
                                            </div>
                                        </div>
                                        <label className={styles.toggleSwitch}>
                                            <input
                                                type="checkbox"
                                                checked={rolePermissions[selectedRole][category.id][permission.id]}
                                                onChange={() => handlePermissionToggle(category.id, permission.id)}
                                                disabled={selectedRole === 'admin' && permission.id !== 'viewOwn'}
                                            />
                                            <span className={styles.toggleSlider}></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Danger Zone */}
                    {selectedRole !== "admin" && (
                        <div className={styles.dangerZone}>
                            <h4 className={styles.dangerTitle}>
                                <FiAlertCircle /> Danger Zone
                            </h4>
                            <p className={styles.dangerText}>
                                Deleting this role will remove all associated permissions and reassign members.
                            </p>
                            <div className={styles.dangerActions}>
                                <button className={styles.dangerBtn} style={{ backgroundColor: '#ef4444', color: 'white' }}>
                                    Delete Role
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Members with this role */}
                <div className={styles.membersSidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>Members ({roles.find(r => r.id === selectedRole)?.memberCount})</h3>
                    </div>
                    <div className={styles.membersList}>
                        <p className={styles.noMembers}>
                            Member management coming soon...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionsManager;
