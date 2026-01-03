import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header";
import "../styles/payment.css";

const PaymentCancel = () => {
  return (
    <Layout>
      {/* Use the reusable Header component */}
      <Header
        title="Payment Cancelled"
        subtitle="Your payment was not completed"
      />

      <div className="payment-status-page">
        <div className="payment-status-container">
          <div className="payment-status-card payment-status-card--cancel">
            <div className="payment-status-icon">❌</div>
            <h1 className="payment-status-title">Payment Cancelled</h1>
            <p className="payment-status-message">
              Your payment was cancelled. No charges have been made to your account.
            </p>

            {/* <div className="payment-status-actions">
              <Link to="/plans" className="btn btn--primary">
                Back to Plans
              </Link>
              <Link to="/" className="btn btn--secondary">
                Go to Home
              </Link>
            </div> */}

            <div className="payment-help">
              <p>
                Having trouble?{" "}
                <a href="mailto:support@teamflow.com" className="help-link">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancel;