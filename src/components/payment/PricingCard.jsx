import React from "react";
import PriceBadge from "./PriceBadge";
import "../../styles/plans.css";

const PricingCard = ({
  plan,
  price,
  period = "mo",
  features,
  ctaText,
  isPopular = false,
  isFree = false,
  isLoading = false,
  isDisabled = false,
  isActive = false,
  daysLeft = 0,
  onSelect,
}) => {
  const handleClick = () => {
    if (!isLoading && !isDisabled && !isActive) {
      onSelect();
    }
  };

  return (
    <div className={`pricing-card ${isPopular ? "pricing-card--popular" : ""} ${isDisabled ? "pricing-card--disabled" : ""} ${isActive ? "pricing-card--active" : ""}`}>
      
      {isActive && (
        <div className="pricing-card__active-badge">
          <span className="pricing-card__active-icon">✓</span>
          Current Plan
          {daysLeft > 0 && (
            <span className="pricing-card__days-left">({daysLeft} days left)</span>
          )}
        </div>
      )}
      
      <div className="pricing-card__header">
        <h3 className="pricing-card__title">{plan}</h3>
        {isPopular && !isActive && (
          <PriceBadge type="recommended">Most Popular</PriceBadge>
        )}
        {isFree && !isActive && (
          <PriceBadge type="free">Free Forever</PriceBadge>
        )}
      </div>

      <div className="pricing-card__price">
        {isFree ? (
          <span className="pricing-card__amount pricing-card__amount--free">Free</span>
        ) : (
          <>
            <span className="pricing-card__amount">${price}</span>
            <span className="pricing-card__period">/{period}</span>
          </>
        )}
      </div>

      <ul className="pricing-card__features">
        {features.map((feature, index) => (
          <li key={index} className="pricing-card__feature">
            <span className="pricing-card__checkmark">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="pricing-card__footer">
        <button
          className={`pricing-card__cta ${
            isFree ? "pricing-card__cta--secondary" : "pricing-card__cta--primary"
          } ${isLoading ? "pricing-card__cta--loading" : ""} ${
            isDisabled ? "pricing-card__cta--disabled" : ""
          } ${isActive ? "pricing-card__cta--active" : ""}`}
          onClick={handleClick}
          disabled={isLoading || isDisabled || isActive}
          aria-label={`Select ${plan} plan`}
        >
          {isLoading ? (
            <>
              <span className="pricing-card__spinner"></span>
              Processing...
            </>
          ) : (
            ctaText
          )}
        </button>

        <div className="pricing-card__notice">
          {isFree ? (
            "No credit card required"
          ) : (
            <>
              <span className="pricing-card__lock">🔒</span>
              Secure payment via Stripe
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingCard;