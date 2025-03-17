import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { jsPDF } from "jspdf";
import "./TranscriptionPage.css"; // Import the CSS file

const TranscriptionPage = () => {
  const [videoTitle, setVideoTitle] = useState("Uploaded Video Title");
  const [transcription, setTranscription] = useState("Your transcription text will appear here...");

  const navigate = useNavigate();

  // const handleExportPDF = () => {
  //   const doc = new jsPDF();
  //   doc.setFont("helvetica", "bold");
  //   doc.text(videoTitle, 10, 10);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(transcription, 10, 20, { maxWidth: 180 });
  //   doc.save(`${videoTitle}.pdf`);
  // };

  const handleExportWord = () => {
    let blob = new Blob([transcription], { type: "application/msword" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${videoTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="transcription-page">
      <div className="transcription-container">
        {/* Sidebar */}
        <div className="transcription-sidebar">
          <h2 className="transcription-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li onClick={() => navigate("/mainURL")} style={{ cursor: "pointer" }}>Upload</li>
            <li>Transcripts</li>
            <li>Notes</li>
            <li className="active">Transcription</li>
            <li>History</li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="transcription-main-content">
          <div className="transcription-header">
            <h3 className="transcription-video-title">{videoTitle}</h3>
            <div className="transcription-export-buttons">
              {/* <button className="btn" onClick={handleExportPDF}>Export PDF</button> */}
              <button className="transcription-btn" onClick={handleExportWord}>Export Word</button>
            </div>
          </div>

          {/* Transcription Box */}
          <div className="transcription-box">
            <textarea
              className="transcription-text"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Your transcription text..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPage;
