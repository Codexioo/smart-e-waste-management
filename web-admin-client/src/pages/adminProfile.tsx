import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import "../styles/adminProfile.css";
import { useNavigate } from "react-router-dom";
import { MdEdit, MdSave, MdCancel, MdDelete, MdCloudUpload, MdPerson } from 'react-icons/md';
import defaultAvatar from "../user.png";

const AdminProfile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setUsername(data.username);
        setEmail(data.email);
        setTelephone(data.telephone);
        setAddress(data.address);
        setProfileImage(data.profile_image || "");
      } catch (err) {
        alert("Failed to load profile");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.put(
        "/profile",
        { username, telephone, address, email, profile_image: profileImage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      alert("Error updating profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result);
      }
    };
  
    reader.readAsDataURL(file);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.delete("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      alert("Account deleted successfully");
      navigate("/adminLogin");
    } catch (err) {
      alert("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile-wrapper">
      <div className="image-section">
        <div style={{ position: 'relative' }}>
          <img
            src={profileImage || defaultAvatar}
            alt="Profile"
            className="admin-avatar-preview"
          />
          {!profileImage && !isEditing && (
            <div style={{ position: 'absolute', bottom: 30, right: 10, backgroundColor: 'var(--primary)', padding: 8, borderRadius: '50%', border: '3px solid white' }}>
              {React.createElement(MdPerson as any, { size: 20, color: "white" })}
            </div>
          )}
        </div>

        {isEditing && (
          <div className="image-edit-buttons">
            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <label htmlFor="imageUpload" className="upload-btn">
              {React.createElement(MdCloudUpload as any, { size: 18, style: { marginRight: 8 } })}
              {profileImage ? "Change Image" : "Upload Image"}
            </label>

            {profileImage && (
              <button className="remove-btn" onClick={() => setProfileImage("")}>
                {React.createElement(MdDelete as any, { size: 18, style: { marginRight: 8 } })}
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
        <div>
          <label className="admin-label">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} disabled={!isEditing} placeholder="Enter username" />
        </div>
        <div>
          <label className="admin-label">Email Address</label>
          <input value={email} onChange={e => setEmail(e.target.value)} disabled={!isEditing} placeholder="Enter email" />
        </div>
        <div>
          <label className="admin-label">Telephone</label>
          <input value={telephone} onChange={e => setTelephone(e.target.value)} disabled={!isEditing} placeholder="Enter telephone" />
        </div>
        <div>
          <label className="admin-label">Home Address</label>
          <input value={address} onChange={e => setAddress(e.target.value)} disabled={!isEditing} placeholder="Enter address" />
        </div>
      </div>

      <div className="admin-profile-buttons">
        {isEditing ? (
          <>
            <button onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {React.createElement(MdSave as any, { size: 20 })}
              <span>Save Changes</span>
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn" style={{ backgroundColor: 'var(--background)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {React.createElement(MdCancel as any, { size: 20 })}
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {React.createElement(MdEdit as any, { size: 20 })}
            <span>Edit Profile</span>
          </button>
        )}
        <button className="danger" onClick={handleDelete} disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {React.createElement(MdDelete as any, { size: 20 })}
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
