// src/pages/Signup.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { signupUser } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/Auth.module.css";

import { Users, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Zap, Target, TrendingUp, Globe, Rocket, Shield } from 'lucide-react';

export default function Signup() {
  const nav = useNavigate();
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await signupUser(form);
      const access_token = data?.access_token ?? data?.token ?? null;
      const user = data?.user ?? data?.data ?? null;

      if (!user) {
        console.error("Signup error: server response missing user object", data);
        toast.error("Signup succeeded but client did not receive user data.");
        setLoading(false);
        return;
      }

      login({ access_token, user });

      if (access_token) localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userName", user.full_name ?? user.name ?? user.email.split("@")[0]);
      if (user.role) localStorage.setItem("userRole", user.role);
      if (user.organization_id) localStorage.setItem("organizationId", user.organization_id);

      toast.success("Organization created successfully! 🎉");

      if (user.role === "admin" || user.role === "super_admin") {
        nav("/admin");
      } else {
        nav("/member");
      }
    } catch (err) {
      console.error("Signup error:", err);
      const msg = err?.message || err?.detail || "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundOrb1} />
      <div className={styles.backgroundOrb2} />
      <div className={styles.backgroundGrid} />

      {/* Left Side - Hero Section */}
      <div className={styles.leftPanel}>
        <div className={styles.brandSection}>
          <Link to="/" className={styles.brandLogo}>
            <div className={styles.logoIcon}>
              <span className={styles.logoTF}>TF</span>
            </div>
            <span className={styles.brandName}>TeamFlow</span>
          </Link>

          <div className={styles.brandTagline}>
            <Rocket size={20} />
            <span>Launch Your Team's Success</span>
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Start Your Team's Journey Today
          </h1>
          <p className={styles.heroSubtitle}>
            Join thousands of teams that transformed their collaboration with TeamFlow. Get enterprise-grade tools in minutes.
          </p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <TrendingUp size={24} />
              </div>
              <h3 className={styles.featureTitle}>Boost Productivity</h3>
              <p className={styles.featureDesc}>Teams see 40% faster project completion</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <Globe size={24} />
              </div>
              <h3 className={styles.featureTitle}>Global Teams</h3>
              <p className={styles.featureDesc}>Seamless collaboration across time zones</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <Shield size={24} />
              </div>
              <h3 className={styles.featureTitle}>Enterprise Security</h3>
              <p className={styles.featureDesc}>Bank-level encryption & compliance</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <Sparkles size={24} />
              </div>
              <h3 className={styles.featureTitle}>AI Powered</h3>
              <p className={styles.featureDesc}>Smart insights & automation</p>
            </div>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10k+</div>
              <div className={styles.statLabel}>Teams Trust Us</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>99.9%</div>
              <div className={styles.statLabel}>Platform Uptime</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className={styles.rightPanel}>
        <div className={styles.authCard}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>Create your account</h1>
            <div className={styles.authSwitch}>
              <span>Already have an account?</span>
              <Link to="/login" className={styles.switchLink}>
                Sign in
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Full Name
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Email address
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  minLength={8}
                  className={styles.formInput}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className={styles.passwordToggle}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className={styles.passwordHint}>
                Minimum 8 characters with letters and numbers
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Creating Organization...
                </>
              ) : (
                <>
                  Create Organization
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className={styles.divider}>
              <span>or sign up with</span>
            </div>

            <button type="button" className={styles.socialButton}>
              <svg className={styles.socialIcon} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className={styles.termsSection}>
              <p className={styles.termsText}>
                By signing up, you agree to our{" "}
                <a href="#" className={styles.termsLink}>Terms of Service</a> and{" "}
                <a href="#" className={styles.termsLink}>Privacy Policy</a>
              </p>
            </div>

            <div className={styles.authFooter}>
              <Link to="/" className={styles.backLink}>
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}