import React from "react";
import "../../styles/plans.css";

const PriceBadge = ({ type = "recommended", children }) => {
  const getBadgeIcon = () => {
    switch (type) {
      case "recommended":
        return "⭐";
      case "free":
        return "🎁";
      case "popular":
        return "🔥";
      case "active": // ✅ NEW: Active badge type
        return "✅";
      default:
        return "";
    }
  };

  return (
    <div className={`price-badge price-badge--${type}`}>
      <span className="price-badge__icon">{getBadgeIcon()}</span>
      {children}
    </div>
  );
};

export default PriceBadge;