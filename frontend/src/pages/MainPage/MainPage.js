import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MainPage.css";

function MainPage() {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importLink, setImportLink] = useState("");
  const [transcription, setTranscription] = useState(""); // Store transcription result
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

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload_video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Transcription:", response.data);
      setTranscription(response.data.combined_transcription);
      alert("File uploaded and processed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error processing file.");
    }
    setLoading(false);
  };

  // ✅ Send video URL to Flask backend
  const handleImport = async () => {
    if (!importLink.trim()) {
      alert("Please enter a valid video URL.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/upload_video", { url: importLink });

      console.log("Transcription:", response.data);
      setTranscription(response.data.combined_transcription);
      alert("Video URL processed successfully!");
    } catch (error) {
      console.error("Error processing URL:", error);
      alert("Error processing video.");
    }
    setLoading(false);
  };

  return (
    <div className="main-url-page">
      <div className="main-container">
        {/* Sidebar */}
        <div className="main-sidebar">
          <h2 className="main-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li className="main-active">Upload</li>
            <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcription</li>
            <li>Notes</li>
            <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translation</li>
            <li>History</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-primary-content">
          <div className="main-header">
            <p>Welcome to Video Content Analysis and Note Generation System</p>
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

          <div className="main-import-section">
            <p>Import with a share link (YouTube, Dropbox, Google Drive, etc.)</p>
            <input
              type="text"
              value={importLink}
              onChange={(e) => setImportLink(e.target.value)}
              placeholder="Enter video URL"
            />
            <button className="main-import-btn" onClick={handleImport} disabled={loading}>
              {loading ? "Processing..." : "Import"}
            </button>
          </div>

          {/* Display Transcription Result */}
          {transcription && (
            <div className="transcription-result">
              <h3>Transcription Result:</h3>
              <pre>{transcription}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainPage;