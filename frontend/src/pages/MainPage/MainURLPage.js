import React, { useState } from "react";
import "./CockatooInterface.css";
import { FaUpload, FaFileAlt, FaLanguage } from "react-icons/fa";

function MainURL() {
  const [dragOver, setDragOver] = useState(false);

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
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2 className="logo">cockatoo</h2>
        <ul>
          <li className="active">
            <FaUpload className="icon" />
            Upload
          </li>
          <li>
            <FaFileAlt className="icon" />
            Your transcripts
          </li>
          <li>
            <FaLanguage className="icon" />
            Translate
          </li>
        </ul>
        <button className="upgrade-btn">Upgrade to Pro</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <p>You're on the free tier. Get more transcripts, full-length exports, and more with Cockatoo Pro. <a href="#">Upgrade Now</a></p>
        </div>

        <div className="upload-section">
          <label className="dropdown">
            Language:
            <select>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>
          <label className="dropdown">
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
          className={`drop-box ${dragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drop an audio or video file here<br />or click to browse</p>
        </div>

        <div className="import-section">
          <p>Import with a share link (Dropbox, Google Drive, etc)</p>
          <button className="import-btn">Import</button>
        </div>
      </div>
    </div>
  );
}

export default MainURL;