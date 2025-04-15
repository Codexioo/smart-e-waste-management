import React, { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import "../styles/adminProfile.css"; // Create this for styling
import { useNavigate } from "react-router-dom";
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
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      await axios.delete("/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("adminToken");
      alert("Account deleted");
      navigate("/adminLogin");
    } catch (err) {
      alert("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-profile-wrapper">
      <h2 className="admin-profile-title">Admin Profile</h2>
      <div className="image-section">
  <img
    src={profileImage || defaultAvatar}
    alt="Profile"
    className="admin-avatar-preview"
  />

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
        {profileImage ? "Change Image" : "Add Profile Image"}
      </label>

      {profileImage && (
        <button className="remove-btn" onClick={() => setProfileImage("")}>
          Remove Image
        </button>
      )}
    </div>
  )}
</div>


      <label className="admin-label">Username</label>
      <input value={username} onChange={e => setUsername(e.target.value)} disabled={!isEditing} />

      <label className="admin-label">Email</label>
      <input value={email} onChange={e => setEmail(e.target.value)} disabled={!isEditing} />

      <label className="admin-label">Telephone</label>
      <input value={telephone} onChange={e => setTelephone(e.target.value)} disabled={!isEditing} />

      <label className="admin-label">Address</label>
      <input value={address} onChange={e => setAddress(e.target.value)} disabled={!isEditing} />

      <div className="admin-profile-buttons">
        {isEditing ? (
          <>
            <button onClick={handleSave} disabled={loading}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
        <button className="danger" onClick={handleDelete} disabled={loading}>Delete Account</button>
      </div>
    </div>
  );
};

export default AdminProfile;
