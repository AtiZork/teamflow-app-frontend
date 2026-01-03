// src/pages/CreateProjects.jsx
import { createProject, getProjects, updateProject, deleteProject } from "../api/projects.js";
import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout.jsx";
import Header from "../components/layout/Header.jsx";
import ProjectModal from "../components/modals/ProjectModal.jsx"
import ConfirmationModal from "../components/modals/ConfirmationModal.jsx";
import toast from "react-hot-toast";


export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  // Add states for confirmation modal
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: "",
    message: "",
    onConfirm: () => { }
  });

  // Form state for modal
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  // Helper function to reset the form state and editing state
  const resetForm = () => {
    setProjectName("");
    setProjectDesc("");
    setEditing(null);
  };

  /* ---------- CRUD ---------- */
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.error(err);
      toast.error("Could not load projects");
    }
  };

  const saveProject = async (payload) => {
    // payload is { name, description }
    const isEdit = !!editing;
    try {
      if (isEdit) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
      }
      toast.success(isEdit ? "Project updated successfully!" : "Project created successfully!");
      fetchProjects();
      setShowModal(false); // Close the modal after submission
      resetForm(); // Reset the form
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    setConfirmationConfig({
      title: "Delete Project",
      message: "Are you sure you want to delete this project? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteProject(id);
          toast.success("🗑️ Project deleted successfully!");
          fetchProjects();
        } catch (err) {
          console.error(err);
          toast.error(err.message || "Failed to delete project");
        }
      }
    });
    setShowConfirmation(true);
  };

  /* ---------- Sync form state when editing changes ---------- */
  useEffect(() => {
    if (editing) {
      setProjectName(editing.name || "");
      setProjectDesc(editing.description || "");
    } else {
      setProjectName("");
      setProjectDesc("");
    }
  }, [editing]);

  /* ---------- Lifecycle ---------- */
  useEffect(() => {
    fetchProjects();
  }, []);

  /* ---------- Handlers ---------- */
  const openAdd = () => {
    resetForm(); // Reset the form before opening the modal
    setShowModal(true);
  };

  const openEdit = (proj) => {
    setEditing(proj);
    setShowModal(true);
  };

  /* ---------- Render ---------- */
  return (
    <Layout>
      <Header
        title="Project Management"
        subtitle="Add new projects and manage existing ones."
        actionButtonText="+ Add Project"
        onActionClick={openAdd}
      />

      {showModal && (
        <ProjectModal
          onClose={() => {
            setShowModal(false);
            resetForm(); // Reset the form when closing manually
          }}
          onSave={saveProject}
          editing={editing}
          title={editing ? "Update Project" : "Add New Project"}
          inputPlaceholder="Project Name"
          textareaPlaceholder="Project Description"
          submitText={editing ? "Update" : "Add"}
          inputValue={projectName}
          onInputChange={setProjectName}
          textareaValue={projectDesc}
          onTextareaChange={setProjectDesc}
        />
      )}

      {/* Add the confirmation modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmationConfig.onConfirm}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />

      <section className="project-list card">
        <div className="card-header">
          <h2>Existing Projects</h2>
        </div>

        <div className="table-wrapper">
          {projects.length === 0 ? (
            <p className="empty">No projects yet. Add one above.</p>
          ) : (
            <table className="project-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project Name</th>
                  <th>Description</th>
                  <th className="action-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj, idx) => (
                  <tr key={proj.id}>
                    <td>{idx + 1}</td>
                    <td>{proj.title}</td>
                    <td>{proj.description}</td>
                    <td className="action-col">
                      <div className="project-actions">
                        <button
                          className="project-edit-btn"
                          onClick={() => openEdit(proj)}
                        >
                          Edit
                        </button>
                        <button
                          className="project-delete-btn"
                          onClick={() => handleDelete(proj.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </Layout>
  );
}