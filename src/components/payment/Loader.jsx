// import React from "react";
// import "../../styles/plans.css";

// const Loader = ({ size = "medium", text = "Processing..." }) => {
//   return (
//     <div className={`loader-container loader-${size}`}>
//       <div className="loader-spinner"></div>
//       {text && <p className="loader-text">{text}</p>}
//     </div>
//   );
// };

// export default Loader;



















import React from "react";
import "../../styles/plans.css";

const Loader = ({ size = "medium", text = "Processing...", type = "default" }) => {
  return (
    <div className={`loader-container loader-${size} loader-${type}`}>
      <div className="loader-spinner">
        <div className="loader-spinner__circle"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;