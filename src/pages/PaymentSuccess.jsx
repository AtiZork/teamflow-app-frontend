import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header";
import { API_URL } from "../config/apiConfig";
import "../styles/payment.css";

const PaymentSuccess = () => {
  const [sessionId, setSessionId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("verifying");
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get session_id from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get("session_id");

    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      verifySession(sessionIdParam);
    } else {
      setVerificationStatus("error");
      setError("No session ID found in URL");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifySession = async (sessionId) => {
    try {
      console.log("🔄 Verifying Stripe session:", sessionId);

      // Use fetch instead of axios to avoid auth headers
      const response = await fetch(
        `${API_URL}/payments/verify-session?session_id=${sessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Session verification response:", data);

      if (data.status === "complete" && data.payment_status === "paid") {
        setVerificationStatus("success");
        setSessionData(data);

        // Store plan info in localStorage for the dashboard to use
        if (data.plan_name) {
          localStorage.setItem("currentPlan", data.plan_name);
        }
      } else {
        setVerificationStatus("pending");
        setSessionData(data);
      }
    } catch (err) {
      console.error("❌ Session verification failed:", err);
      setVerificationStatus("error");
      setError(err.message || "Failed to verify payment");
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "verifying":
        return (
          <div className="payment-status-card payment-status-card--verifying">
            <div className="payment-status-icon">⏳</div>
            <h1 className="payment-status-title">Verifying Payment...</h1>
            <p className="payment-status-message">
              Please wait while we confirm your payment details.
            </p>
            <div className="payment-loading-spinner"></div>
          </div>
        );

      case "success":
        return (
          <div className="payment-status-card payment-status-card--success">
            <div className="payment-status-icon">✅</div>
            <h1 className="payment-status-title">Payment Successful!</h1>
            <p className="payment-status-message">
              Thank you for your purchase! Your {sessionData?.plan_name} plan is now active.
            </p>

            {sessionData && (
              <div className="payment-details">
                <div className="payment-detail-item">
                  <strong>Plan:</strong> {sessionData.plan_name}
                </div>
                {sessionData.amount_total && (
                  <div className="payment-detail-item">
                    <strong>Amount:</strong> ${(sessionData.amount_total / 100).toFixed(2)} {sessionData.currency?.toUpperCase()}
                  </div>
                )}
                {sessionData.customer_email && (
                  <div className="payment-detail-item">
                    <strong>Email:</strong> {sessionData.customer_email}
                  </div>
                )}
              </div>
            )}

            <div className="payment-status-actions">
              <Link to="/admin" className="btn btn--primary">
                Go to Dashboard
              </Link>
              <Link to="/plans" className="btn btn--secondary">
                View Plan Details
              </Link>
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="payment-status-card payment-status-card--pending">
            <div className="payment-status-icon">⏳</div>
            <h1 className="payment-status-title">Payment Processing</h1>
            <p className="payment-status-message">
              Your payment is being processed. This may take a few minutes.
            </p>
            <div className="payment-status-actions">
              <button
                onClick={() => verifySession(sessionId)}
                className="btn btn--primary"
              >
                Check Status Again
              </button>
              <Link to="/plans" className="btn btn--secondary">
                Back to Plans
              </Link>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="payment-status-card payment-status-card--error">
            <div className="payment-status-icon">❌</div>
            <h1 className="payment-status-title">Verification Failed</h1>
            <p className="payment-status-message">
              {error || "We couldn't verify your payment. Please contact support if the issue persists."}
            </p>
            <div className="payment-status-actions">
              <Link to="/plans" className="btn btn--primary">
                Back to Plans
              </Link>
              <Link to="/admin" className="btn btn--secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Header
        title="Payment Status"
        subtitle={
          verificationStatus === "verifying"
            ? "Verifying your payment..."
            : verificationStatus === "success"
              ? "Your subscription is now active!"
              : "Payment processing"
        }
      />

      <div className="payment-status-page">
        <div className="payment-status-container payment-status-container--centered">
          {renderContent()}

          <div className="payment-help">
            <p>
              Need help?{" "}
              <a href="mailto:support@teamflow.com" className="help-link">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;