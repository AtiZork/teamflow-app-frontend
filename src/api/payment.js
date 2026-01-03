// src/api/payment.js
import axios from "axios";
import { API_URL } from "../config/apiConfig";

console.log("✅ API_URL:", API_URL);

// ===============================================================
// 🔐 Helper: Get Authorization Header
// ===============================================================
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  return { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// ===============================================================
// 1️⃣ CHECK PAYMENT VISIBILITY
// ===============================================================
export async function checkPaymentVisibility() {
  try {
    const res = await axios.get(`${API_URL}/payments/visibility`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    return res.data;
  } catch (err) {
    console.error("❌ Error checking payment visibility:", err);
    return {
      show_payment: false,
      user_role: null,
      is_super_admin: false,
      is_invited: null
    };
  }
}

// ===============================================================
// 2️⃣ GET AVAILABLE PLANS
// ===============================================================
export async function getPaymentPlans() {
  try {
    const res = await axios.get(`${API_URL}/payments/plans`, {
      headers: getAuthHeaders(),
      timeout: 15000
    });
    
    console.log("📦 Plans loaded from backend:", res.data);
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ Error fetching plans:", err);
    
    // Return fallback plans if backend fails
    const fallbackPlans = [
      {
        id: 1,
        name: "Free",
        slug: "free",
        member_limit: 3,
        description: "Perfect for small teams getting started",
        features: ["Basic usage", "Up to 3 members", "Essential task management"],
        price_monthly: 0.0,
        price_yearly: 0.0,
        stripe_price_id_monthly: "price_1SNSov4tFCDhgWln9seN8YL3",
        stripe_price_id_yearly: "price_1SNSov4tFCDhgWln9seN8YL3"
      },
      {
        id: 2,
        name: "Pro",
        slug: "pro",
        member_limit: 10,
        description: "For growing teams with advanced needs",
        features: ["Up to 10 members", "Priority support", "Advanced analytics", "Custom fields"],
        price_monthly: 29.0,
        price_yearly: 29.0,
        stripe_price_id_monthly: "price_1SNSqa4tFCDhgWlnCrlCFCJi",
        stripe_price_id_yearly: "price_1SNSqa4tFCDhgWlnCrlCFCJi"
      },
      {
        id: 3,
        name: "Team",
        slug: "team",
        member_limit: 9999,
        description: "For large organizations and enterprises",
        features: ["Unlimited members", "Advanced analytics", "API access", "Dedicated support", "Custom branding"],
        price_monthly: 99.0,
        price_yearly: 99.0,
        stripe_price_id_monthly: "price_1SNSrT4tFCDhgWlncMYVpyEY",
        stripe_price_id_yearly: "price_1SNSrT4tFCDhgWlncMYVpyEY"
      }
    ];
    
    return fallbackPlans;
  }
}

// ===============================================================
// 3️⃣ CREATE CHECKOUT SESSION (MAIN PAYMENT FUNCTION - FIXED)
// ===============================================================
// In payment.js - Update createCheckoutSession function
export async function createCheckoutSession(priceId) {
  try {
    console.log("🔄 Creating checkout session for price:", priceId);

    // ✅ VALIDATE: Check if priceId is provided and valid
    if (!priceId) {
      throw new Error("Price ID is required to create checkout session");
    }

    if (!priceId.startsWith('price_')) {
      throw new Error("Invalid price ID format");
    }

    const res = await axios.post(
      `${API_URL}/payments/create-checkout-session`,
      { price_id: priceId },
      { 
        headers: getAuthHeaders(),
        timeout: 15000
      }
    );
    
    console.log("✅ Checkout session created:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Checkout session error:", err);
    
    const errorMessage = err.response?.data?.detail || err.message || "Failed to create checkout session";
    
    // Handle CORS errors specifically
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
      throw new Error("Cannot connect to payment server. Please check your internet connection and try again.");
    }
    
    if (err.response?.status === 403) {
      throw new Error("Only organization owners can create checkout sessions.");
    } else if (err.response?.status === 404) {
      throw new Error("Pricing plan not found.");
    } else if (err.response?.status === 400) {
      throw new Error(errorMessage);
    } else if (err.response?.status === 500) {
      throw new Error("Payment server error. Please try again later.");
    } else {
      throw new Error(errorMessage);
    }
  }
}


// ===============================================================
// 4️⃣ SUBSCRIBE TO FREE PLAN (FIXED)
// ===============================================================
export async function subscribeFreePlan() {
  try {
    console.log("🔄 Subscribing to free plan");

    const res = await axios.post(
      `${API_URL}/payments/subscribe-free`,
      {}, // ✅ CORRECT: Empty object for POST
      { 
        headers: getAuthHeaders(),
        timeout: 15000
      }
    );
    
    console.log("✅ Free plan subscribed:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Free plan subscription error:", err);
    
    // Extract detailed error information from response
    const errorDetail = err.response?.data?.detail || "";
    const errorMessage = err.response?.data?.message || errorDetail || "Failed to subscribe to free plan.";
    
    if (err.response?.status === 400 || err.response?.status === 403) {
      // Check if it's a member limit error
      if (errorMessage.includes("member") && errorMessage.includes("limit")) {
        throw new Error(`🚫 Cannot switch to Free plan\n\nYou currently have more team members than the Free plan allows (maximum 3 members).\n\nPlease remove extra members first or upgrade to a higher plan.`);
      } else {
        throw new Error(`Cannot switch to Free plan: ${errorMessage}`);
      }
    } else if (err.response?.status === 400) {
      // Handle other 400 errors
      throw new Error(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
  }
}

// ===============================================================
// 5️⃣ CANCEL SUBSCRIPTION (FIXED)
// ===============================================================
export async function cancelSubscription() {
  try {
    console.log("🔄 Canceling subscription...");
    
    const res = await axios.post(
      `${API_URL}/payments/cancel`,
      {}, // ✅ CORRECT: Empty object for POST
      { 
        headers: getAuthHeaders(),
        timeout: 15000
      }
    );
    
    console.log("✅ Subscription canceled:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Cancel subscription error:", err);
    throw new Error(err.response?.data?.detail || "Failed to cancel subscription.");
  }
}

// ===============================================================
// 6️⃣ GET CURRENT SUBSCRIPTION (FIXED)
// ===============================================================
export async function getCurrentSubscription() {
  try {
    const res = await axios.get(`${API_URL}/payments/current`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log("✅ Current subscription:", res.data);
    
    // ✅ CORRECT: Handle both object and null responses
    return res.data; // Could be ActiveSubscriptionOut object OR null
  } catch (err) {
    console.error("❌ Get current subscription error:", err);
    
    // Don't throw for 403/404, just return null (user might not have access or no subscription)
    if (err.response?.status === 403 || err.response?.status === 404) {
      return null;
    }
    
    // For other errors, return null but log the error
    console.warn("Unable to fetch current subscription, returning null");
    return null;
  }
}

// ===============================================================
// 7️⃣ GET PAYMENT HISTORY (FIXED)
// ===============================================================
export async function getPaymentHistory() {
  try {
    const res = await axios.get(`${API_URL}/payments/history`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log("✅ Payment history loaded:", res.data?.length || 0, "records");
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error("❌ Get payment history error:", err);
    
    // Return empty array instead of throwing for better UX
    if (err.response?.status === 403) {
      console.warn("User doesn't have permission to view payment history");
      return [];
    }
    
    throw new Error(err.response?.data?.detail || "Failed to fetch payment history.");
  }
}

// ===============================================================
// 8️⃣ CHECK PLAN LIMITS (UPDATED)
// ===============================================================
export async function checkPlanLimits() {
  try {
    const res = await axios.get(`${API_URL}/payments/check-limits`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log("✅ Plan limits checked:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Check plan limits error:", err);
    
    // Return sensible defaults instead of throwing
    return {
      current_plan: "Free",
      current_members: 1, // Assume at least current user
      member_limit: 3,
      can_add_more: true,
      is_expired: false,
      remaining_slots: 2
    };
  }
}

// ===============================================================
// 9️⃣ VERIFY STRIPE SESSION (MISSING - ADDED)
// ===============================================================
export async function verifyStripeSession(sessionId) {
  try {
    console.log("🔍 Verifying Stripe session:", sessionId);
    
    if (!sessionId) {
      throw new Error("Session ID is required for verification");
    }

    const res = await axios.get(
      `${API_URL}/payments/verify-session?session_id=${sessionId}`,
      { timeout: 10000 }
    );
    
    console.log("✅ Stripe session verified:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Verify Stripe session error:", err);
    throw new Error(err.response?.data?.detail || "Failed to verify Stripe session.");
  }
}

// ===============================================================
// 🧩 PAYMENT UTILITIES (UPDATED)
// ===============================================================
export const paymentUtils = {
  async canSeePayments() {
    try {
      const visibility = await checkPaymentVisibility();
      return visibility.show_payment === true;
    } catch (err) {
      console.error("Error checking payment visibility:", err);
      return false;
    }
  },

  canSeePaymentsLocal() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userRole = user.role;
      const isPublicAdmin = user.is_public_admin === true;
      return userRole === "super_admin" && isPublicAdmin;
    } catch (err) {
      return false;
    }
  },

  isTenantOwner() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userRole = user.role;
      const isPublicAdmin = user.is_public_admin === true;
      return userRole === "super_admin" && isPublicAdmin;
    } catch (err) {
      return false;
    }
  },

  // Format price for display
  formatPrice(price, currency = "USD") {
    if (!price && price !== 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  },

  // Get plan features based on plan name - MATCHING BACKEND
  getPlanFeatures(planName) {
    const featuresMap = {
      "Free": [
        "Basic usage", 
        "Up to 3 members", 
        "Essential task management"
      ],
      "Pro": [
        "Up to 10 members", 
        "Priority support", 
        "Advanced analytics", 
        "Custom fields"
      ],
      "Team": [
        "Unlimited members", 
        "Advanced analytics", 
        "API access", 
        "Dedicated support", 
        "Custom branding"
      ]
    };
    
    return featuresMap[planName] || featuresMap["Free"];
  },

  // Check if user can invite more members
  async canInviteMoreMembers() {
    try {
      const limits = await checkPlanLimits();
      return limits.can_add_more === true;
    } catch (err) {
      console.error("Error checking member limits:", err);
      return false;
    }
  },

  // Get current plan info
  async getCurrentPlanInfo() {
    try {
      const [limits, subscription] = await Promise.all([
        checkPlanLimits(),
        getCurrentSubscription()
      ]);
      
      return {
        ...limits,
        subscription: subscription
      };
    } catch (err) {
      console.error("Error getting plan info:", err);
      return {
        current_plan: "Free",
        current_members: 1,
        member_limit: 3,
        can_add_more: true,
        is_expired: false,
        remaining_slots: 2,
        subscription: null
      };
    }
  },

  // Get Stripe Price ID for a plan
  async getPriceIdForPlan(planName, billingCycle = 'monthly') {
    try {
      const plans = await getPaymentPlans();
      const plan = plans.find(p => p.name === planName);
      
      if (!plan) {
        throw new Error(`Plan ${planName} not found`);
      }
      
      return billingCycle === 'monthly' 
        ? plan.stripe_price_id_monthly 
        : plan.stripe_price_id_yearly;
    } catch (err) {
      console.error("Error getting price ID for plan:", err);
      throw err;
    }
  }
};



// ===============================================================
// 🔟 GET MY SUBSCRIPTION (Used for restoring plan after login)
// ===============================================================
export async function getMySubscription() {
  try {
    const res = await axios.get(`${API_URL}/payments/me/subscription`, {
      headers: getAuthHeaders(),
      timeout: 10000,
    });

    console.log("✅ My subscription data loaded:", res.data);
    return res.data; // should include current plan info (Free / Pro / Team)
  } catch (err) {
    console.error("❌ Error loading my subscription:", err);

    if (err.response?.status === 404) {
      console.warn("No active subscription found for user");
      return null;
    }

    return null;
  }
}



// Add this function to your payment.js
export async function getSubscriptionStatus() {
  try {
    const res = await axios.get(`${API_URL}/payments/current`, {
      headers: getAuthHeaders(),
      timeout: 10000
    });
    
    console.log("✅ Subscription status:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Get subscription status error:", err);
    return {
      plan_id: "free",
      start_at: null,
      expires_at: null,
      status: "inactive",
      days_left: 0
    };
  }
}

// ===============================================================
// 🔟 PAYMENT STATUS CONSTANTS (MATCHING BACKEND)
// ===============================================================
export const PaymentStatus = {
  ACTIVE: 'active',
  CANCELED: 'canceled', 
  PENDING: 'pending',
  EXPIRED: 'expired',
  PAST_DUE: 'past_due'
};

// ===============================================================
// 1️⃣1️⃣ PLAN NAME CONSTANTS (MATCHING BACKEND)
// ===============================================================
export const PlanNames = {
  FREE: 'Free',
  PRO: 'Pro', 
  TEAM: 'Team'
};

// ===============================================================
// 1️⃣2️⃣ BILLING CYCLE CONSTANTS (MATCHING BACKEND)
// ===============================================================
export const BillingCycle = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

// ===============================================================
// 🎯 EXPORT ALL FUNCTIONS
// ===============================================================
export default {
  checkPaymentVisibility,
  getPaymentPlans,
  createCheckoutSession,
  subscribeFreePlan,
  cancelSubscription,
  getCurrentSubscription,
  getPaymentHistory,
  checkPlanLimits,
  verifyStripeSession, // ✅ ADDED
  paymentUtils,
  PaymentStatus,
  PlanNames,
  BillingCycle
};