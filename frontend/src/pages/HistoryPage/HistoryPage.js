import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "./HistoryPage.css";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]); // State to store history data
  const [selectedTranscript, setSelectedTranscript] = useState(null); // Store selected transcript
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/get_all_transcriptions", {  
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {return response.json()})
    .then((data) => {
      const formattedData = data.map((item) => ({
        id: item._id, // Use MongoDB _id as unique identifier
        title: item.filename, // Use filename as title
        text: item.transcription_text,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }), // Format the date
      }));
      setHistoryData(formattedData);
      console.log(formattedData);
    })
    .catch((error) => console.error("Error fetching history:", error));
  }, []);

  // Fetch transcript details when View is clicked

  const handleView = (id) => {
    const transcript = historyData.find((item) => item.id === id)?.text;
  
    if (Array.isArray(transcript)) {
      setSelectedTranscript(transcript);
    } else if (typeof transcript === "string") {
      setSelectedTranscript([{ time: "", STT: transcript }]); // Wrap text in an array
    } else {
      setSelectedTranscript([]);
    }
  };

  // Simulate downloading files (Replace with actual backend URL)
  // const handleDownload = (id, format) => {
  //   const fileUrl = `http://localhost:5000/download/${id}.${format}`;
  //   window.open(fileUrl, "_blank");
  // };

  const handleDownload = (id) => {
    const selectedItem = historyData.find((item) => item.id === id);
    if (!selectedItem || !selectedItem.text) {
      alert("No transcript available for download.");
      return;
    }
  
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
  
    // Use the filename as the title
    const fileTitle = selectedItem.title || "Transcript";
    doc.text(fileTitle, 10, 10);
  
    doc.setFont("helvetica", "normal");
  
    let y = 20; // Initial Y position
    const pageHeight = doc.internal.pageSize.height; // Page height
    const marginBottom = 10; // Space at the bottom of the page
    const lineHeight = 10; // Line spacing
  
    let transcript = selectedItem.text;
  
    if (typeof transcript === "string") {
      transcript = [{ time: "", STT: transcript }]; // Wrap text in an array if it's just plain text
    }
  
    transcript.forEach((entry) => {
      const timeText = entry.time ? `${entry.time} - ` : ""; // Include timestamp if available
      const text = entry.STT || entry.text || "No transcription available"; // Ensure valid text
  
      const formattedText = doc.splitTextToSize(`${timeText}${text}`, 180); // Wrap text
  
      if (y + formattedText.length * lineHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = 20; // Reset Y position on new page
      }
  
      doc.text(formattedText, 10, y);
      y += formattedText.length * lineHeight;
    });
  
    doc.save(`${fileTitle.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="history-page">
      {/* Sidebar */}
      <div className="history-sidebar">
        <h2 className="history-logo">Video Analysis and Note Generation System</h2>
        <ul>
          <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
          <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcription</li>
          <li onClick={() => navigate("/summary")} style={{ cursor: "pointer" }}>Note</li>
          <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translation</li>
          <li className="history-active">History</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="history-content">
        <h1>📌 History</h1>
        <p>View or download your saved transcripts and notes.</p>

        <div className="history-list">
          {historyData.length === 0 ? (
            <p>Loading history...</p>
          ) : (
            historyData.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-title">{item.title}</div>
                <div className="history-date">{item.date}</div>
                <button onClick={() => handleView(item.id)}>👁 View</button>
                <button onClick={() => handleDownload(item.id)}>📄 Download PDF</button>
              </div>
            ))
          )}
        </div>

        {/* Display the transcript when an item is selected */}
        {loadingTranscript && <p>Loading transcript...</p>}
        {selectedTranscript && selectedTranscript.length > 0 ? (
          selectedTranscript.map((entry, index) => (
            <div key={index} className="transcript-entry">
              {entry.time && <span className="transcript-timestamp">{entry.time}</span>}
              <p className="transcript-text">{entry.STT}</p>
            </div>
          ))
        ) : (
          <p>No transcript available.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
