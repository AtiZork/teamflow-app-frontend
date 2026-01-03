// src/components/AcceptInvitation.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateInvitation, acceptInvitation } from "../api/invitation.js";
import toast from "react-hot-toast";
import styles from "../styles/acceptinvite.module.css"; // ✅ FIXED: Import as styles object

const AcceptInvitation = () => {
  console.log("🎯 ACCEPT INVITATION COMPONENT IS LOADING!");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const result = await validateInvitation(token);
        setValid(true);
        setInvitationData(result);
        setLoading(false);
      } catch (error) {
        toast.error(error.message);
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    validateToken();
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const result = await acceptInvitation({
        token,
        full_name: formData.full_name,
        password: formData.password,
      });

      // Store user data and token
      localStorage.setItem("token", result.access_token);
      localStorage.setItem("user", JSON.stringify(result.user));
      if (result.user.organization_id) {
        localStorage.setItem("organizationId", result.user.organization_id.toString());
      }

      toast.success("Account activated successfully! Welcome to TeamFlow!");
      
      // ✅ FIXED: Redirect members to /dashboard instead of /member
      if (result.user.role === "admin" || result.user.role === "super_admin") {
        navigate("/admin");
      } else {
        navigate("/member"); 
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className={styles["accept-invite-container"]}>
        <div className={styles["invite-loading"]}>
          <div className={styles["invite-brand"]}>
            <div className={styles["invite-logo"]}>
              <span className={styles["invite-logo-text"]}>T</span>
            </div>
          </div>
          <div className={styles["invite-loading-spinner"]}></div>
          <p className={styles["invite-loading-text"]}>Validating your invitation...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className={styles["accept-invite-container"]}>
        <div className={styles["invite-invalid"]}>
          <div className={styles["invite-brand"]}>
            <div className={styles["invite-logo"]}>
              <span className={styles["invite-logo-text"]}>T</span>
            </div>
          </div>
          <div className={styles["invite-invalid-icon"]}>❌</div>
          <h1 className={styles["invite-invalid-title"]}>Invalid Invitation</h1>
          <p className={styles["invite-invalid-text"]}>
            This invitation link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/login")}
            className={styles["invite-invalid-btn"]}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["accept-invite-container"]}>
      <div className={styles["invite-card"]}>
        {/* Branding */}
        <div className={styles["invite-brand"]}>
          <div className={styles["invite-logo"]}>
            <span className={styles["invite-logo-text"]}>T</span>
          </div>
        </div>

        {/* Header */}
        <h1 className={styles["invite-title"]}>
          Join {invitationData?.org_name || "the team"}
        </h1>
        <p className={styles["invite-subtitle"]}>
          Complete your account setup
        </p>
        <p className={styles["invite-role"]}>
          Role: {invitationData?.role}
        </p>

        {/* Form */}
        <form className={styles["invite-form"]} onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div>
            <label htmlFor="full_name" className={styles["invite-label"]}>
              <span className={styles["invite-label-icon"]}>👤</span>
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={styles["invite-input"]}
              placeholder="Enter your full name"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className={styles["invite-label"]}>
              <span className={styles["invite-label-icon"]}>🔒</span>
              Password
            </label>
            <div className={styles["pw-wrapper"]}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={styles["invite-input"]}
                placeholder="Enter your password"
              />
              <div 
                className={styles["pw-eye"]}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className={styles["pw-icon"]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className={styles["pw-icon"]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className={styles["invite-label"]}>
              <span className={styles["invite-label-icon"]}>🔒</span>
              Confirm Password
            </label>
            <div className={styles["pw-wrapper"]}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={styles["invite-input"]}
                placeholder="Confirm your password"
              />
              <div 
                className={styles["pw-eye"]}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className={styles["pw-icon"]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className={styles["pw-icon"]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles["invite-btn"]}
          >
            Activate Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitation;