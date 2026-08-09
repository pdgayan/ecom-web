import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { AUTH_URL } from "../api";

export default function ProfilePage() {
  const { token, updateUser } = useApp();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${AUTH_URL}/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (isMounted) {
            setError(data.message || "Unable to load profile.");
          }
          return;
        }

        if (isMounted) {
          setProfile(data.user);
          setForm({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            phone: data.user.phone || "",
          });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (isMounted) {
          setError("Unable to reach the server. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (token) {
      fetchProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [token]);

  function handleChange(field) {
    return (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${AUTH_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          phone: form.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to update profile.");
        return;
      }

      setProfile(data.user);
      updateUser(data.user);
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="profile-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-screen">
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="profile-screen">
      <div className="profile-panel">
        <div className="eyebrow">Account</div>
        <h1>My Profile</h1>

        {error && <div className="form-error">{error}</div>}
        {successMessage && (
          <div className="form-success">{successMessage}</div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={handleChange("first_name")}
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={handleChange("last_name")}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={profile.email} readOnly disabled />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="+1 555 123 4567"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={profile.role} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Verification Status</label>
              <input
                type="text"
                value={profile.is_verified ? "Verified" : "Not verified"}
                readOnly
                disabled
              />
            </div>
          </div>

          <button
            className="btn btn-primary btn-wide"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}