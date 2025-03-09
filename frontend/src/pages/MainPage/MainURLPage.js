import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainURLPage.css";

function MainURLPage() {
  const [dragOver, setDragOver] = useState(false);
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
    alert("File uploaded!"); // You can implement actual file handling here
  };

  return (
    <div className="main-url-page">
    <div className="main-container">
      {/* Sidebar */}
      <div className="main-sidebar">
        <h2 className="main-logo">cockatoo</h2>
        <ul>
          <li className="main-active">Upload</li>
          <li onClick={() => navigate("/transcripts")} style={{ cursor: "pointer" }}>
            Transcripts
          </li>
          <li>Notes</li>
          <li onClick={() => navigate("/mainurl/translate")} style={{ cursor: "pointer" }}>
            Translate</li>
          <li>History</li>
        </ul>
        <button className="main-upgrade-btn">Upgrade to Pro</button>
      </div>

      {/* Main Content */}
      <div className="main-primary-content">
        <div className="main-header">
          <p>
            You're on the free tier. Get more transcripts, full-length exports, and more with Cockatoo Pro.{" "}
            <a href="#">Upgrade Now</a>
          </p>
        </div>

        <div className="main-upload-section">
          <label className="main-dropdown">
            Language:
            <select>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>
          <label className="main-dropdown">
            Number of people speaking:
            <select>
              <option>Detect automatically</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>
          </label>
        </div>

        {/* Drag and Drop Box */}
        <div
          className={`main-drop-box ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>
            Drop an audio or video file here
            <br />
            or click to browse
          </p>
        </div>

        <div className="main-import-section">
          <p>Import with a share link (Dropbox, Google Drive, etc)</p>
          <button className="main-import-btn">Import</button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default MainURLPage;