// // src/components/modals/ProjectModal.jsx
// import React from 'react';
// import BaseModal from './BaseModal';

// export default function ProjectModal({
//   onClose,
//   onSave,
//   title = "Create Project",
//   inputPlaceholder = "Name",
//   textareaPlaceholder = "Description",
//   submitText = "Save",
//   extraFields = null,
//   inputValue = "",
//   onInputChange,
//   textareaValue = "",
//   onTextareaChange,
// }) {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave({
//       name: inputValue,
//       description: textareaValue,
//     });
//   };

//   const footer = (
//     <>
//       <button type="button" className="btn btn-secondary" onClick={onClose}>
//         Cancel
//       </button>
//       <button type="submit" form="project-form" className="btn btn-primary">
//         {submitText}
//       </button>
//     </>
//   );

//   return (
//     <BaseModal
//       isOpen={true} // Always rendered when used, so always open
//       onClose={onClose}
//       title={title}
//       footer={footer}
//     >
//       <form id="project-form" onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label className="form-label">{inputPlaceholder}</label>
//           <input
//             type="text"
//             placeholder={`Enter ${inputPlaceholder.toLowerCase()}`}
//             value={inputValue}
//             onChange={(e) => onInputChange(e.target.value)}
//             className="form-input"
//             required
//           />
//         </div>

//         <div className="form-group">
//           <label className="form-label">{textareaPlaceholder}</label>
//           <textarea
//             placeholder={`Enter ${textareaPlaceholder.toLowerCase()}`}
//             value={textareaValue}
//             onChange={(e) => onTextareaChange(e.target.value)}
//             className="form-textarea"
//             rows="4"
//           />
//         </div>

//         {extraFields}
//       </form>
//     </BaseModal>
//   );
// }




















// src/components/modals/ProjectModal.jsx
import React from 'react';
import BaseModal from './BaseModal';

export default function ProjectModal({
  onClose,
  onSave,
  title = "Create Project",
  inputPlaceholder = "Name",
  textareaPlaceholder = "Description",
  submitText = "Save",
  extraFields = null,
  inputValue = "",
  onInputChange,
  textareaValue = "",
  onTextareaChange,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();

    // Map frontend "name" to backend "title"
    onSave({
      title: inputValue,          // <-- FIXED
      description: textareaValue, // optional
    });
  };

  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button type="submit" form="project-form" className="btn btn-primary">
        {submitText}
      </button>
    </>
  );

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <form id="project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">{inputPlaceholder}</label>
          <input
            type="text"
            placeholder={`Enter ${inputPlaceholder.toLowerCase()}`}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">{textareaPlaceholder}</label>
          <textarea
            placeholder={`Enter ${textareaPlaceholder.toLowerCase()}`}
            value={textareaValue}
            onChange={(e) => onTextareaChange(e.target.value)}
            className="form-textarea"
            rows="4"
          />
        </div>

        {extraFields}
      </form>
    </BaseModal>
  );
}
