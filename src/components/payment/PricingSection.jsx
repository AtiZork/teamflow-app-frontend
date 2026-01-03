import React, { useState, useEffect } from "react";
import { createCheckoutSession, subscribeFreePlan, getPaymentPlans, getCurrentSubscription, paymentUtils } from "../../api/payment";
import PricingCard from "./PricingCard";
import toast from "react-hot-toast"; // ✅ Add this import
import Loader from "./Loader";
import "../../styles/plans.css";

const PricingSection = () => {
  const [loadingPrice, setLoadingPrice] = useState(null);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    checkAuthentication();

    // 🔄 Load from localStorage if available first
    const savedSub = JSON.parse(localStorage.getItem("subscription") || "null");
    if (savedSub) {
      setSubscriptionStatus(savedSub);
      console.log("💾 Loaded subscription from storage:", savedSub);
    }

    loadData();
  }, []);

  const checkAuthentication = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    console.log("🔐 Authentication status:", !!token);
  };

  const fetchSubscriptionStatus = async () => {
    if (!isAuthenticated) {
      console.log("🔐 Skipping subscription status - user not authenticated");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payments/me/subscription`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data);
        localStorage.setItem("subscription", JSON.stringify(data)); // ✅ keep consistent
        console.log("📅 Subscription status:", data);
        
        // ✅ Store subscription info for UI state persistence
        if (data.plan_id && data.status === 'active') {
          localStorage.setItem('activePlan', data.plan_id);
          localStorage.setItem('subscriptionDaysLeft', data.days_left);
        }
      } else if (response.status === 401) {
        console.log("🔐 User not authenticated for subscription status");
      }
    } catch (err) {
      console.error("❌ Failed to fetch subscription status:", err);
    }
  };

  const loadData = async () => {
    try {
      setLoadingPlans(true);
      
      if (isAuthenticated) {
        const subscription = await getCurrentSubscription();
        setCurrentSubscription(subscription);
        console.log("📋 Current subscription:", subscription);
        
        await fetchSubscriptionStatus();
      } else {
        console.log("🔐 User not authenticated - loading public plans only");
      }
      
      const plansData = await getPaymentPlans();
      console.log("📦 Plans data received:", plansData);
      
      if (!plansData || plansData.length === 0) {
        setPlans(getDefaultPlans());
        return;
      }
      
      const transformedPlans = plansData.map(plan => {
        console.log("📋 Processing plan:", plan);
        
        const hasPriceId = plan.stripe_price_id_monthly && 
                          plan.stripe_price_id_monthly.startsWith('price_') &&
                          !plan.stripe_price_id_monthly.includes('YOUR_') &&
                          plan.stripe_price_id_monthly.length > 20;
        
        const isPaidPlan = plan.name !== "Free" && plan.name !== "FREE";
        
        if (isPaidPlan && !hasPriceId) {
          console.warn(`⚠️ Plan ${plan.name} is missing valid Stripe price ID:`, plan.stripe_price_id_monthly);
        }
        
        return {
          id: plan.id,
          plan: plan.name,
          price: plan.price_monthly || 0,
          price_yearly: plan.price_yearly || 0,
          features: Array.isArray(plan.features) ? plan.features : getDefaultFeatures(plan.name),
          stripe_price_id_monthly: plan.stripe_price_id_monthly,
          stripe_price_id_yearly: plan.stripe_price_id_yearly,
          member_limit: plan.member_limit,
          description: plan.description,
          isPopular: plan.name === "Pro" || plan.name === "PRO",
          isFree: plan.name === "Free" || plan.name === "FREE",
          hasValidPriceId: hasPriceId
        };
      });

      console.log("🎨 Transformed plans:", transformedPlans);
      setPlans(transformedPlans);
      
    } catch (err) {
      console.error("❌ Failed to load data:", err);
      setError("Failed to load pricing information. Please try again.");
      setPlans(getDefaultPlans());
    } finally {
      setLoadingPlans(false);
    }
  };

  // ✅ ENHANCED: Improved plan button configuration with active state
  const getPlanButtonConfig = (planData) => {
    if (!isAuthenticated) {
      if (planData.isFree) {
        return {
          ctaText: "Get Started Free",
          isLoading: false,
          isDisabled: false,
          isActive: false
        };
      } else {
        return {
          ctaText: "Sign Up to Upgrade",
          isLoading: false,
          isDisabled: false,
          isActive: false
        };
      }
    }

    const planName = planData.plan.toLowerCase();
    
    // ✅ Check if this plan is currently active with remaining days
    const isActiveSubscription = subscriptionStatus && 
                                subscriptionStatus.plan_id === planName && 
                                subscriptionStatus.status === 'active' && 
                                subscriptionStatus.days_left > 0;

    // ✅ Get days left from subscription status or localStorage fallback
    const daysLeft = subscriptionStatus?.days_left || 
                    parseInt(localStorage.getItem('subscriptionDaysLeft')) || 0;

    if (isActiveSubscription) {
      return {
        ctaText: `Active Plan — ${daysLeft} days left`,
        isLoading: false,
        isDisabled: true,
        isActive: true,
        daysLeft: daysLeft
      };
    }
    
    // For Free plan
    if (planData.isFree) {
      const isCurrentlyFree = !subscriptionStatus || 
                             (subscriptionStatus.plan_id === 'free' && 
                              subscriptionStatus.status === 'active');
      
      return {
        ctaText: isCurrentlyFree ? "Current Plan ✓" : "Switch to Free",
        isLoading: loadingPrice === planData.id,
        isDisabled: isCurrentlyFree,
        isActive: isCurrentlyFree,
        daysLeft: isCurrentlyFree ? 30 : 0
      };
    }
    
    // For paid plans - check if actively subscribed
    const isSubscribedToThisPlan = subscriptionStatus && 
                                  subscriptionStatus.plan_id === planName && 
                                  subscriptionStatus.status === 'active';
    
    const hasValidStripeConfig = planData.hasValidPriceId;
    
    return {
      ctaText: hasValidStripeConfig ? `Upgrade to ${planData.plan}` : "Setup Required",
      isLoading: loadingPrice === planData.id,
      isDisabled: !hasValidStripeConfig || isSubscribedToThisPlan,
      isActive: isSubscribedToThisPlan,
      daysLeft: isSubscribedToThisPlan ? (subscriptionStatus.days_left || 30) : 0
    };
  };

  // ✅ ENHANCED: Check if plan is active for UI highlighting
  const isPlanActive = (planData) => {
    if (!isAuthenticated) return false;
    
    const planName = planData.plan.toLowerCase();
    const isActiveSubscription = subscriptionStatus && 
                                subscriptionStatus.plan_id === planName && 
                                subscriptionStatus.status === 'active' && 
                                subscriptionStatus.days_left > 0;
    
    // Also check localStorage as fallback
    const localStoragePlan = localStorage.getItem('activePlan');
    const localStorageDaysLeft = parseInt(localStorage.getItem('subscriptionDaysLeft'));
    
    return isActiveSubscription || 
           (localStoragePlan === planName && localStorageDaysLeft > 0);
  };

  // ✅ KEEP ORIGINAL WORKING PAYMENT LOGIC
  const handleSelectPlan = async (planData) => {
    console.log("🎯 Plan selected:", planData);
    
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    
    const planName = planData.plan.toLowerCase();
    if (subscriptionStatus && 
        subscriptionStatus.plan_id === planName && 
        subscriptionStatus.status === 'active' && 
        subscriptionStatus.days_left > 0) {
      console.log("✅ Already actively subscribed to this plan, no action needed");
      return;
    }

    if (planData.isFree) {
      await handleSwitchToFreePlan(planData);
      return;
    }

    if (!planData.hasValidPriceId) {
      setError(`🚫 ${planData.plan} plan is not available for payment yet. Please contact support.`);
      return;
    }

    setLoadingPrice(planData.id);
    setError(null);

    try {
      console.log("🔄 Selecting paid plan:", planData);
      
      const priceId = planData.stripe_price_id_monthly;
      
      if (!priceId) {
        throw new Error("No price ID available for this plan");
      }

      console.log("💳 Creating checkout session with price:", priceId);
      // ✅ USE ORIGINAL WORKING PAYMENT FUNCTION
      const session = await createCheckoutSession(priceId);
      
      if (session.checkout_url) {
        console.log("✅ Redirecting to Stripe checkout");
        // Store pending plan for UI update after return
        localStorage.setItem('pendingPlan', planData.plan);
        window.location.href = session.checkout_url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (err) {
      console.error("❌ Checkout session error:", err);
      
      if (err.message.includes("Invalid price configuration") || err.message.includes("No such price")) {
        setError(`🚫 Payment configuration error for ${planData.plan} plan. Please contact support.`);
      } else {
        setError(err.message || "Failed to create checkout session");
      }
      
      setLoadingPrice(null);
    }
  };

  // ✅ KEEP ORIGINAL WORKING FREE PLAN LOGIC
  // const handleSwitchToFreePlan = async (planData) => {
  //   try {
  //     setLoadingPrice("free");
  //     setError(null);
  //     console.log("🔄 Switching to free plan...");
      
  //     // ✅ USE ORIGINAL WORKING PAYMENT FUNCTION
  //     await subscribeFreePlan();
      
  //     // ✅ Update UI state immediately
  //     localStorage.setItem('activePlan', 'free');
  //     localStorage.setItem('subscriptionDaysLeft', '30');
      
  //     // Refresh subscription status
  //     await fetchSubscriptionStatus();
      
  //     alert("✅ Successfully switched to Free plan!\n\nNote: You can invite up to 3 team members with the Free plan.");
      
  //   } catch (err) {
  //     console.error("❌ Free plan switch error:", err);
      
  //     let userFriendlyError = err.message || "Failed to switch to free plan";
      
  //     if (err.message.includes("Member limit reached")) {
  //       userFriendlyError = `🚫 Cannot switch to Free plan\n\nYou currently have more than 3 team members. Please:\n\n• Remove some team members first, OR\n• Stay on your current plan`;
  //     }
      
  //     setError(userFriendlyError);
  //   } finally {
  //     setLoadingPrice(null);
  //   }
  // };

// ✅ PROFESSIONAL: Free plan switching with centered top toast notifications
const handleSwitchToFreePlan = async (planData) => {
  try {
    setLoadingPrice("free");
    setError(null);
    console.log("🔄 Switching to free plan...");
    
    // ✅ USE UPDATED PAYMENT FUNCTION
    await subscribeFreePlan();
    
    // ✅ Update UI state immediately
    localStorage.setItem('activePlan', 'free');
    localStorage.setItem('subscriptionDaysLeft', '30');
    
    // Refresh subscription status
    await fetchSubscriptionStatus();
    
    // ✅ Professional success toast - top center
    toast.success("Account successfully activated with Free plan", {
      position: "top-center",
      duration: 4000,
    });
    
  } catch (err) {
    console.error("❌ Free plan switch error:", err);
    
    // Check if it's a member limit error
    const isMemberLimitError = err.message.includes("🚫") || 
                              err.message.includes("member") || 
                              err.message.includes("limit") ||
                              err.message.includes("Cannot switch to Free plan");
    
    if (isMemberLimitError) {
      // ✅ Clean, professional error toast - top center
      toast.error(
        `Cannot switch to Free plan. Your team has more than 3 members. Please remove extra members or choose a different plan.`,
        {
          duration: 6000,
          position: 'top-center',
        }
      );
      
      // Clear the error state
      setError(null);
    } else {
      // For other errors
      toast.error(err.message || "Failed to switch to free plan", {
        position: "top-center",
        duration: 5000,
      });
      setError(err.message || "Failed to switch to free plan");
    }
  } finally {
    setLoadingPrice(null);
  }
};


  // ✅ ADDED: Check for pending plan after payment return
  useEffect(() => {
    const checkPendingPlan = () => {
      const pendingPlan = localStorage.getItem('pendingPlan');
      if (pendingPlan && isAuthenticated) {
        console.log("🔄 Processing pending plan:", pendingPlan);
        localStorage.removeItem('pendingPlan');
        // Refresh subscription status to update UI
        fetchSubscriptionStatus();
      }
    };

    checkPendingPlan();
  }, [isAuthenticated]);

  const getDefaultPlans = () => {
    return [
      {
        id: 1,
        plan: "Free",
        price: 0,
        price_yearly: 0,
        features: ["Up to 3 team members", "Basic task management", "1 project"],
        stripe_price_id_monthly: null,
        stripe_price_id_yearly: null,
        member_limit: 3,
        description: "Perfect for small teams",
        isPopular: false,
        isFree: true,
        hasValidPriceId: false
      },
      {
        id: 2,
        plan: "Pro",
        price: 29,
        price_yearly: 290,
        features: ["Up to 10 team members", "Advanced task management", "Unlimited projects", "Priority support"],
        stripe_price_id_monthly: null,
        stripe_price_id_yearly: null,
        member_limit: 10,
        description: "For growing teams",
        isPopular: true,
        isFree: false,
        hasValidPriceId: false
      },
      {
        id: 3,
        plan: "Team",
        price: 99,
        price_yearly: 990,
        features: ["Unlimited team members", "Enterprise features", "Custom integrations", "Dedicated support"],
        stripe_price_id_monthly: null,
        stripe_price_id_yearly: null,
        member_limit: 999,
        description: "For large organizations",
        isPopular: false,
        isFree: false,
        hasValidPriceId: false
      }
    ];
  };

  const getDefaultFeatures = (planName) => {
    const featureMap = {
      "Free": ["Up to 3 team members", "Basic task management", "1 project"],
      "Pro": ["Up to 10 team members", "Advanced task management", "Unlimited projects", "Priority support"],
      "Team": ["Unlimited team members", "Enterprise features", "Custom integrations", "Dedicated support"]
    };
    return featureMap[planName] || ["Basic features"];
  };

  const sortedPlans = [...plans].sort((a, b) => {
    const order = { 'Free': 1, 'Pro': 2, 'Team': 3 };
    return order[a.plan] - order[b.plan];
  });

  console.log("🔍 Current state:", {
    loadingPlans,
    plansCount: plans.length,
    currentSubscription,
    subscriptionStatus,
    error,
    loadingPrice,
    isAuthenticated
  });

  if (loadingPlans) {
    return (
      <section className="pricing-section">
        <div className="pricing-container">
          <Loader size="large" text="Loading plans..." />
        </div>
      </section>
    );
  }

  return (
    <section className="pricing-section">
      <div className="pricing-container">
        {plans.some(plan => !plan.isFree && !plan.hasValidPriceId) && (
          <div className="config-warning">
            <strong>⚠️ Setup Required:</strong> Some paid plans need Stripe configuration. Contact support.
          </div>
        )}

        {!isAuthenticated && (
          <div className="auth-notice">
            <strong>🔐 Sign up required:</strong> Please create an account to subscribe to paid plans.
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            <strong>Error:</strong> {error}
            <button 
              className="error-retry" 
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {sortedPlans.length === 0 ? (
          <div className="no-plans-message">
            <h3>No plans available</h3>
            <p>Please check your connection and try again.</p>
            <button onClick={loadData} className="retry-button">
              Retry Loading Plans
            </button>
          </div>
        ) : (
          <>
            <div className="pricing-grid">
              {sortedPlans.map((planData) => {
                const buttonConfig = getPlanButtonConfig(planData);
                const isActive = isPlanActive(planData);
                
                return (
                  <PricingCard
                    key={planData.id}
                    {...planData}
                    ctaText={buttonConfig.ctaText}
                    isLoading={buttonConfig.isLoading}
                    isDisabled={buttonConfig.isDisabled}
                    isActive={isActive}
                    daysLeft={buttonConfig.daysLeft}
                    onSelect={() => handleSelectPlan(planData)}
                  />
                );
              })}
            </div>

            <div className="payment-security">
              <div className="stripe-badge">
                <span className="stripe-lock">🔒</span>
                Secure payment by Stripe — we never store card details
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PricingSection;