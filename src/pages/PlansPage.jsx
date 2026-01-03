
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Header from "../components/layout/Header";
import PricingSection from "../components/payment/PricingSection";
import "../styles/plans.css";

const PlansPage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const userRole = localStorage.getItem("userRole") || "";

        // Check if user is super admin (organization creator)
        // Adjust these conditions based on your actual role system
        const isSuperAdmin = userRole === "admin" ||
          userRole === "super_admin" ||
          userRole === "organization_admin" ||
          userRole === "owner";

        if (!isSuperAdmin) {
          // Redirect unauthorized users
          navigate("/admin"); // or wherever you want to redirect them
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking authorization:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <Header
          title="Choose Your Plan"
          subtitle="Loading..."
        />
        <div className="plans-page">
          <div className="pricing-container">
            <div className="loading-message">Checking permissions...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return (
      <Layout>
        <Header
          title="Access Denied"
          subtitle="You don't have permission to view this page"
        />
        <div className="plans-page">
          <div className="pricing-container">
            <div className="error-message">
              <p>Only organization administrators can upgrade plans.</p>
              <button
                onClick={() => navigate("/admin")}
                className="btn btn--primary"
                style={{ marginTop: '1rem' }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header
        title="Choose Your Plan"
        subtitle="Simple pricing. No surprises. Upgrade anytime."
      />

      <div className="plans-page">
        <PricingSection />
      </div>
    </Layout>
  );
};

export default PlansPage;