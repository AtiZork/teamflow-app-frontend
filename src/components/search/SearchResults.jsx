
// import React from 'react';
// import styles from "../../styles/SearchResults.module.css";

// const SearchResultsBlock = ({ searchResults = [], onClose }) => {
//   const StatusBadge = ({ status }) => {
//     const statusConfig = {
//       'Open': { color: '#3B82F6', bgColor: '#DBEAFE' },
//       'In Progress': { color: '#F59E0B', bgColor: '#FEF3C7' },
//       'Resolved': { color: '#10B981', bgColor: '#D1FAE5' },
//       'Closed': { color: '#6B7280', bgColor: '#F3F4F6' },
//       'Completed': { color: '#10B981', bgColor: '#D1FAE5' }
//     };

//     const config = statusConfig[status] || statusConfig['Open'];

//     return (
//       <span 
//         className={styles.statusBadge}
//         style={{ 
//           color: config.color, 
//           backgroundColor: config.bgColor 
//         }}
//       >
//         {status}
//       </span>
//     );
//   };

//   const PriorityBadge = ({ priority }) => {
//     const priorityConfig = {
//       'Low': { color: '#10B981', bgColor: '#D1FAE5' },
//       'Medium': { color: '#F59E0B', bgColor: '#FEF3C7' },
//       'High': { color: '#EF4444', bgColor: '#FEE2E2' },
//       'Urgent': { color: '#DC2626', bgColor: '#FECACA' },
//       'low': { color: '#10B981', bgColor: '#D1FAE5' },
//       'medium': { color: '#F59E0B', bgColor: '#FEF3C7' },
//       'high': { color: '#EF4444', bgColor: '#FEE2E2' }
//     };

//     const displayPriority = priority?.charAt(0).toUpperCase() + priority?.slice(1);
//     const config = priorityConfig[priority] || priorityConfig['Low'];

//     return (
//       <span 
//         className={styles.priorityBadge}
//         style={{ 
//           color: config.color, 
//           backgroundColor: config.bgColor 
//         }}
//       >
//         {displayPriority}
//       </span>
//     );
//   };

//   // Transform API task data to match the table format
//   const transformTaskData = (task) => ({
//     id: task.id,
//     ticketId: task.project_name ? `${task.project_name}-${task.id}` : `TASK-${task.id}`,
//     title: task.title,
//     projectType: task.project_name || 'General',
//     status: task.status,
//     priority: task.priority,
//     createdBy: 'Current User', // You can replace with actual creator data
//     department: 'Operation',
//     location: 'Office',
//     // Fixed: Use member_names if available, otherwise use member_ids to show actual IDs
//     assignedTo: task.member_names || (task.member_ids && task.member_ids.length > 0 
//       ? `Users: ${task.member_ids.join(', ')}` 
//       : 'Unassigned'),
//     assignedDepartment: 'Dev',
//     // Fixed: preserve member_ids for display logic
//     member_ids: task.member_ids || []
//   });

//   const results = searchResults.map(transformTaskData);

//   return (
//     <div className={styles.resultsContainer}>
//       <div className={styles.resultsHeader}>
//         <h2 className={styles.resultsTitle}>Search Results</h2>
//         <button className={styles.closeButton} onClick={onClose}>
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
//           </svg>
//         </button>
//       </div>

//       <div className={styles.tableContainer}>
//         <table className={styles.resultsTable}>
//           <thead>
//             <tr>
//               <th className={styles.tableHeader}>Sr #</th>
//               <th className={styles.tableHeader}>Ticket ID</th>
//               <th className={styles.tableHeader}>Title</th>
//               <th className={styles.tableHeader}>Project/Type</th>
//               <th className={styles.tableHeader}>Status</th>
//               <th className={styles.tableHeader}>Priority</th>
//               {/* <th className={styles.tableHeader}>Created By/Department/Location</th> */}
//               <th className={styles.tableHeader}>Department/Location</th>
//               {/* Fixed: changed column label to "Assign To" */}
//               <th className={styles.tableHeader}>Assign To</th>
//               <th className={styles.tableHeader}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {results.length > 0 ? (
//               results.map((result, index) => (
//                 <tr key={result.id} className={styles.tableRow}>
//                   <td className={styles.tableCell}>{index + 1}</td>
//                   <td className={styles.tableCell}>
//                     <span className={styles.ticketId}>{result.ticketId}</span>
//                   </td>
//                   <td className={styles.tableCell}>
//                     <span className={styles.title}>{result.title}</span>
//                   </td>
//                   <td className={styles.tableCell}>
//                     <span className={styles.projectType}>{result.projectType}</span>
//                   </td>
//                   <td className={styles.tableCell}>
//                     <StatusBadge status={result.status} />
//                   </td>
//                   <td className={styles.tableCell}>
//                     <PriorityBadge priority={result.priority} />
//                   </td>
//                   <td className={styles.tableCell}>
//                     <div className={styles.userInfo}>
//                       <div className={styles.userName}>{result.createdBy}</div>
//                       <div className={styles.userDetails}>
//                         {result.department} • {result.location}
//                       </div>
//                     </div>
//                   </td>
//                   <td className={styles.tableCell}>
//                     <div className={styles.userInfo}>
//                       {/* Fixed: display actual member information in Assign To column */}
//                       <div className={styles.userName}>
//                         {result.assignedTo}
//                       </div>
//                       <div className={styles.userDetails}>
//                         {result.assignedDepartment}
//                       </div>
//                     </div>
//                   </td>
//                   <td className={styles.tableCell}>
//                     <button className={styles.actionButton}>
//                       <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                         <path d="M8 9C8.82843 9 9.5 8.32843 9.5 7.5C9.5 6.67157 8.82843 6 8 6C7.17157 6 6.5 6.67157 6.5 7.5C6.5 8.32843 7.17157 9 8 9Z" fill="currentColor"/>
//                         <path d="M8 9C8.82843 9 9.5 8.32843 9.5 7.5C9.5 6.67157 8.82843 6 8 6C7.17157 6 6.5 6.67157 6.5 7.5C6.5 8.32843 7.17157 9 8 9Z" fill="currentColor"/>
//                         <path d="M1.5 7.5C1.5 6.67157 2.17157 6 3 6C3.82843 6 4.5 6.67157 4.5 7.5C4.5 8.32843 3.82843 9 3 9C2.17157 9 1.5 8.32843 1.5 7.5Z" fill="currentColor"/>
//                         <path d="M11.5 7.5C11.5 6.67157 12.1716 6 13 6C13.8284 6 14.5 6.67157 14.5 7.5C14.5 8.32843 13.8284 9 13 9C12.1716 9 11.5 8.32843 11.5 7.5Z" fill="currentColor"/>
//                       </svg>
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className={styles.tableCell} style={{ textAlign: 'center', padding: '40px' }}>
//                   No tasks found matching your search criteria.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className={styles.pagination}>
//         <button className={styles.paginationButton} disabled>
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         </button>
        
//         <button className={`${styles.paginationButton} ${styles.active}`}>1</button>
//         <button className={styles.paginationButton}>2</button>
//         <button className={styles.paginationButton}>3</button>
        
//         <button className={styles.paginationButton}>
//           <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//             <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SearchResultsBlock;





















import React from 'react';
import styles from "../../styles/SearchResults.module.css";

const SearchResultsBlock = ({ searchResults = [], onClose }) => {
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'Open': { color: '#3B82F6', bgColor: '#DBEAFE' },
      'In Progress': { color: '#F59E0B', bgColor: '#FEF3C7' },
      'Resolved': { color: '#10B981', bgColor: '#D1FAE5' },
      'Closed': { color: '#6B7280', bgColor: '#F3F4F6' },
      'Completed': { color: '#10B981', bgColor: '#D1FAE5' }
    };

    const config = statusConfig[status] || statusConfig['Open'];

    return (
      <span 
        className={styles.statusBadge}
        style={{ 
          color: config.color, 
          backgroundColor: config.bgColor 
        }}
      >
        {status}
      </span>
    );
  };

  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      'Low': { color: '#10B981', bgColor: '#D1FAE5' },
      'Medium': { color: '#F59E0B', bgColor: '#FEF3C7' },
      'High': { color: '#EF4444', bgColor: '#FEE2E2' },
      'Urgent': { color: '#DC2626', bgColor: '#FECACA' },
      'low': { color: '#10B981', bgColor: '#D1FAE5' },
      'medium': { color: '#F59E0B', bgColor: '#FEF3C7' },
      'high': { color: '#EF4444', bgColor: '#FEE2E2' }
    };

    const displayPriority = priority?.charAt(0).toUpperCase() + priority?.slice(1);
    const config = priorityConfig[priority] || priorityConfig['Low'];

    return (
      <span 
        className={styles.priorityBadge}
        style={{ 
          color: config.color, 
          backgroundColor: config.bgColor 
        }}
      >
        {displayPriority}
      </span>
    );
  };

  // Transform API task data to match the table format
  const transformTaskData = (task) => ({
    id: task.id,
    ticketId: task.project_name ? `${task.project_name}-${task.id}` : `TASK-${task.id}`,
    title: task.title,
    projectType: task.project_name || 'General',
    status: task.status,
    priority: task.priority,
    createdBy: 'Current User', // You can replace with actual creator data
    department: 'Operation',
    location: 'Office',
    // Fixed: Use member_names if available, otherwise use member_ids to show actual IDs
    assignedTo: task.member_names ? 
      (Array.isArray(task.member_names) ? task.member_names.join(', ') : task.member_names) 
      : (task.member_ids && task.member_ids.length > 0 
        ? `Users: ${task.member_ids.join(', ')}` 
        : 'Unassigned'),
    assignedDepartment: 'Dev',
    // Fixed: preserve member_ids for display logic
    member_ids: task.member_ids || []
  });

  const results = searchResults.map(transformTaskData);

  return (
    <div className={styles.resultsContainer}>
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>Search Results</h2>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th className={styles.tableHeader}>Sr #</th>
              <th className={styles.tableHeader}>Ticket ID</th>
              <th className={styles.tableHeader}>Title</th>
              <th className={styles.tableHeader}>Project/Type</th>
              <th className={styles.tableHeader}>Status</th>
              <th className={styles.tableHeader}>Priority</th>
              {/* <th className={styles.tableHeader}>Created By/Department/Location</th> */}
              <th className={styles.tableHeader}>Department/Location</th>
              {/* Fixed: changed column label to "Assign To" */}
              <th className={styles.tableHeader}>Assign To</th>
              <th className={styles.tableHeader}>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.length > 0 ? (
              results.map((result, index) => (
                <tr key={result.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{index + 1}</td>
                  <td className={styles.tableCell}>
                    <span className={styles.ticketId}>{result.ticketId}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.title}>{result.title}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={styles.projectType}>{result.projectType}</span>
                  </td>
                  <td className={styles.tableCell}>
                    <StatusBadge status={result.status} />
                  </td>
                  <td className={styles.tableCell}>
                    <PriorityBadge priority={result.priority} />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{result.createdBy}</div>
                      <div className={styles.userDetails}>
                        {result.department} • {result.location}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.userInfo}>
                      {/* Fixed: display actual member information in Assign To column */}
                      <div className={styles.userName}>
                        {result.assignedTo}
                      </div>
                      <div className={styles.userDetails}>
                        {result.assignedDepartment}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <button className={styles.actionButton}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 9C8.82843 9 9.5 8.32843 9.5 7.5C9.5 6.67157 8.82843 6 8 6C7.17157 6 6.5 6.67157 6.5 7.5C6.5 8.32843 7.17157 9 8 9Z" fill="currentColor"/>
                        <path d="M8 9C8.82843 9 9.5 8.32843 9.5 7.5C9.5 6.67157 8.82843 6 8 6C7.17157 6 6.5 6.67157 6.5 7.5C6.5 8.32843 7.17157 9 8 9Z" fill="currentColor"/>
                        <path d="M1.5 7.5C1.5 6.67157 2.17157 6 3 6C3.82843 6 4.5 6.67157 4.5 7.5C4.5 8.32843 3.82843 9 3 9C2.17157 9 1.5 8.32843 1.5 7.5Z" fill="currentColor"/>
                        <path d="M11.5 7.5C11.5 6.67157 12.1716 6 13 6C13.8284 6 14.5 6.67157 14.5 7.5C14.5 8.32843 13.8284 9 13 9C12.1716 9 11.5 8.32843 11.5 7.5Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className={styles.tableCell} style={{ textAlign: 'center', padding: '40px' }}>
                  No tasks found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button className={styles.paginationButton} disabled>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button className={`${styles.paginationButton} ${styles.active}`}>1</button>
        <button className={styles.paginationButton}>2</button>
        <button className={styles.paginationButton}>3</button>
        
        <button className={styles.paginationButton}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchResultsBlock;