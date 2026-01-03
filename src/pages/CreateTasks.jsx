import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header.jsx";
import Kanban from "../components/tasks/Kanban";
import { useRef } from "react";
import "../styles/CreateTasks.module.css";


export default function CreateTaskPage() {
  const kanbanRef = useRef();

  const openCreateTaskModal = (taskId = null) => {
    if (kanbanRef.current && kanbanRef.current.openCreateModal) {
      kanbanRef.current.openCreateModal(taskId);
    }
  };

  return (
    <Layout>
      <Header
        title="Create Tasks"
        subtitle="Manage and organize your tasks efficiently. Update to save progress—required for Dashboard & Reports tracking."
        actionButtonText="+ Create Task"
        onActionClick={() => openCreateTaskModal()}
      />

      <Kanban ref={kanbanRef} openTaskModal={openCreateTaskModal} />
    </Layout>
  );
}
