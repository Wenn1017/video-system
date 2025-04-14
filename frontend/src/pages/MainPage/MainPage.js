import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

import axios from "axios";
import "./MainPage.css";

function MainPage() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false); // Show loading state
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File uploaded:", file.name);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      console.log("File selected:", file.name);
    }
  };

  // ✅ Upload file to Flask backend
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please log in.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("token", token);
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload_video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        }
      });

      console.log("Transcription:", response.data.combined_transcription);

      if (!response.data.combined_transcription) {
        alert("Error: No transcription generated.");
        return;
      }

      const filename = response.data.combined_transcription.filename;
      const transcription = response.data.combined_transcription.transcription;

      localStorage.setItem("filename", filename);
      localStorage.setItem("transcription", JSON.stringify(transcription));

      // setTranscription(response.data.combined_transcription);
      alert("File uploaded and processed successfully!");

      // Navigate to transcription page with transcription data
      navigate("/transcription", { state: { filename, transcription } });

    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error processing file.");
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("filename");
    localStorage.removeItem("transcription");
    navigate("/");
  };

  return (
    <div className="main-url-page">
      <div className="main-container">
        {/* Sidebar */}
        <div className="main-sidebar">
          <h2 className="main-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li className="main-active">Upload</li>
            <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcript</li>
            <li onClick={() => navigate("/summary")} style={{ cursor: "pointer" }}>Note</li>
            <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translate</li>
            <li onClick={() => navigate("/history")} style={{ cursor: "pointer" }}>History</li>
          </ul>
          <li
            onClick={handleSignOut}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FiLogOut className="signout-icon" />
            <span>Sign Out</span>
          </li>
        </div>

        {/* Main Content */}
        <div className="main-primary-content">
          <div className="main-header">
            <p>Welcome to Video Content Analysis and Note Generation System</p>
          </div>

          <div
            className={`main-drop-box ${dragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <p>
              {selectedFile ? `Uploaded: ${selectedFile.name}` : "Drop an audio or video file here or click to browse"}
            </p>
            <input
              type="file"
              id="fileInput"
              accept="audio/*, video/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />
          </div>

          <button className="main-upload-btn" onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Upload & Transcribe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainPage;