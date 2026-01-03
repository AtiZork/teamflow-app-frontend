/**
 * Opens the TaskModal in view-only mode.
 * 
 * @param {Object} task - The task object to view
 * @param {Function} setSelectedTask - State setter for selected task
 * @param {Function} setModalMode - State setter for modal mode ('view' or 'edit')
 * @param {Function} setShowTaskModal - State setter to show/hide modal
 * @param {boolean} loadingDependencies - Optional: prevent opening if data is loading
 * @param {Function} toast - Optional: show error if loading
 */
export const openViewTaskModal = (
    task,
    setSelectedTask,
    setModalMode,
    setShowTaskModal,
    loadingDependencies = false,
    toast = null
) => {
    if (loadingDependencies) {
        if (toast) toast.error("Please wait while data loads...");
        return;
    }

    setSelectedTask(task);
    setModalMode('view');
    setShowTaskModal(true);
};
