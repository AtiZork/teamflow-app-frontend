// src/components/profile/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Layout from "../layout/Layout";
import Header from "../layout/Header"; // Import the Header component
import { getMyProfile, updateMyProfile } from "../../api/profile";
import "../../styles/profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    jobTitle: "",
    department: "",
    bio: "",
    timeZone: "UTC",
    skills: []
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to view your profile");
      navigate("/login");
      return;
    }
    loadUserProfile();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getMyProfile();
      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        jobTitle: userData.jobTitle || "",
        department: userData.department || "",
        bio: userData.bio || "",
        timeZone: userData.timeZone || "UTC",
        skills: userData.skills || []
      });
    } catch (error) {
      console.error("Failed to load profile:", error);

      if (error.message.includes("token") || error.message.includes("auth") || error.message.includes("401")) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        navigate("/login");
        return;
      }

      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to update your profile");
      navigate("/login");
      return;
    }

    try {
      setSaving(true);

      // 🔹 Update profile and use the returned data directly
      const updatedUser = await updateMyProfile(formData);

      // 🔹 Update both user and formData states immediately
      setUser(updatedUser);
      setFormData({
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        phoneNumber: updatedUser.phoneNumber || "",
        jobTitle: updatedUser.jobTitle || "",
        department: updatedUser.department || "",
        bio: updatedUser.bio || "",
        timeZone: updatedUser.timeZone || "UTC",
        skills: updatedUser.skills || [],
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      if (
        error.message.includes("token") ||
        error.message.includes("auth") ||
        error.message.includes("401")
      ) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        navigate("/login");
        return;
      }
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to update your profile");
      navigate("/login");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setSaving(true);

      // ✅ FIX: Send empty form data or only the image file for image-only updates
      const updatedUser = await updateMyProfile({}, file);

      // ✅ FIX: Update user state immediately with new image AND all other fields
      setUser(updatedUser);

      // ✅ FIX: Also update formData to ensure all fields stay in sync
      setFormData(prev => ({
        ...prev,
        // Keep all existing form data but ensure we have the latest from server
        fullName: updatedUser.fullName || prev.fullName,
        email: updatedUser.email || prev.email,
        phoneNumber: updatedUser.phoneNumber || prev.phoneNumber,
        jobTitle: updatedUser.jobTitle || prev.jobTitle,
        department: updatedUser.department || prev.department,
        bio: updatedUser.bio || prev.bio,
        timeZone: updatedUser.timeZone || prev.timeZone,
        skills: updatedUser.skills || prev.skills,
      }));

      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Failed to upload image:", error);
      if (
        error.message.includes("token") ||
        error.message.includes("auth") ||
        error.message.includes("401")
      ) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        navigate("/login");
        return;
      }
      toast.error(error.message || "Failed to upload profile image");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const handleImageClick = () => {
    document.getElementById('profile-image-input').click();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Layout>
        <Header
          title="Profile Settings"
          subtitle="Manage your account information and preferences"
        />
        <div className="profile-page">
          <div className="profile-card">
            <div className="profile-page-loading">Loading profile...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <Header
          title="Profile Settings"
          subtitle="Manage your account information and preferences"
        />
        <div className="profile-page">
          <div className="profile-card">
            <div className="profile-page-error">
              <p>Failed to load profile data</p>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Use the reusable Header component */}
      <Header
        title="Profile Settings"
        subtitle="Manage your account information and preferences"
      />

      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-content">
            {/* Profile Image Section */}
            <div className="profile-image-section">
              <div className="profile-image-container">
                <div
                  className="profile-image-upload"
                  onClick={handleImageClick}
                  style={{ cursor: 'pointer' }}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-initials">
                      {getInitials(user.fullName)}
                    </div>
                  )}
                  <div className="image-overlay">
                    Change Photo
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                    id="profile-image-input"
                  />
                </div>
                <div className="upload-actions">
                  <label htmlFor="profile-image-input" className="upload-label btn btn-secondary">
                    Choose Image
                  </label>
                </div>
                <p className="upload-instructions">
                  JPG, GIF or PNG. Max size 5MB.
                </p>
              </div>
            </div>

            {/* Profile Form Section */}
            <div className="profile-form-section">
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      readOnly
                      className="read-only"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="jobTitle">Job Title</label>
                    <input
                      type="text"
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Enter your job title"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Enter your department"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="timeZone">Time Zone</label>
                    <select
                      id="timeZone"
                      name="timeZone"
                      value={formData.timeZone}
                      onChange={handleInputChange}
                    >
                      <option value="UTC">UTC</option>
                      <option value="US/Eastern">US/Eastern</option>
                      <option value="US/Central">US/Central</option>
                      <option value="US/Mountain">US/Mountain</option>
                      <option value="US/Pacific">US/Pacific</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </select>
                  </div>
                </div>

                {/* Updated Skills Section */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="skills">Skills</label>
                    <div className="skill-input-container">
                      <input
                        type="text"
                        className="skill-input"
                        placeholder="Type a skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="skill-add-button"
                        onClick={addSkill}
                      >
                        Add
                      </button>
                    </div>

                    {formData.skills.length === 0 ? (
                      <p className="no-skills">No skills added yet.</p>
                    ) : (
                      <div className="skills-tags">
                        {formData.skills.map((skill, index) => (
                          <div key={index} className="skill-tag">
                            {skill}
                            <button
                              type="button"
                              className="skill-remove"
                              onClick={() => removeSkill(skill)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Account Status</label>
                    <input
                      type="text"
                      id="status"
                      value={user.isActive ? "Active" : "Inactive"}
                      readOnly
                      className="read-only"
                    />
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}