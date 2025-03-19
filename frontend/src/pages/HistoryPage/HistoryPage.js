import React from "react";
import { useNavigate } from "react-router-dom";
import "./HistoryPage.css";

const HistoryPage = () => {
  const navigate = useNavigate();

  // Example history data (Replace with MongoDB data)
  const historyData = [
    { id: "1", title: "Steve Jobs Speech", date: "March 20, 2025" },
    { id: "2", title: "J.K. Rowling Interview", date: "March 18, 2025" },
    { id: "3", title: "Elon Musk AI Talk", date: "March 15, 2025" },
  ];

  // Simulate downloading files (Replace with actual backend URL)
  const handleDownload = (id, format) => {
    const fileUrl = `http://localhost:5000/download/${id}.${format}`;
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="history-page">
      {/* Sidebar */}
      <div className="transcription-sidebar">
        <h2 className="transcription-logo">Video Analysis and Note Generation System</h2>
        <ul>
          <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
          <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcription</li>
          <li onClick={() => navigate("/summary")} style={{ cursor: "pointer" }}>Note</li>
          <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translation</li>
          <li className="transcription-active">History</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="history-content">
        <h1>📌 History</h1>
        <p>View or download your saved transcripts and notes.</p>

        <div className="history-list">
          {historyData.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-title">{item.title}</div>
              <div className="history-date">{item.date}</div>
              <button onClick={() => navigate(`/view/${item.id}`)}>👁 View</button>
              <button onClick={() => handleDownload(item.id, "pdf")}>📄 Download PDF</button>
              <button onClick={() => handleDownload(item.id, "docx")}>📝 Download Word</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
