import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { FiLogOut } from "react-icons/fi";
import "./HistoryPage.css";
import HistoryTable from './HistoryTable';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [selectedTranscript, setSelectedTranscript] = useState(null); 
  const [selectedSummary, setSelectedSummary] = useState(null); // State to store selected summary
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [activeTab, setActiveTab] = useState("STT");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("User not authenticated. Please log in.");
      return;
    }

    const formData = new FormData();
    formData.append("token", token);
    fetch("http://127.0.0.1:5000/get_all_transcriptions", {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token })
    })
    .then((response) => {return response.json()})
    .then((data) => {
      const formattedData = data.map((item) => ({
        id: item._id, 
        title: item.filename, 
        text: item.transcription_text,
        summary: item.summary,
        date: new Date(item.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }), 
      }));
      setHistoryData(formattedData);
      console.log(formattedData);
    })
    .catch((error) => console.error("Error fetching history:", error));
  }, []);

  // Fetch transcript details when View is clicked

  const handleView = (id) => {
    const transcript = historyData.find((item) => item.id === id)?.text;
    const summary = historyData.find((item) => item.id === id)?.summary;
  
    if (Array.isArray(transcript)) {
      setSelectedTranscript(transcript);
    } else if (typeof transcript === "string") {
      setSelectedTranscript([{ time: "", STT: transcript }]); 
    } else {
      setSelectedTranscript([]);
    }
    if (summary) {
      setSelectedSummary(summary); 
    } else {
      setSelectedSummary(null);
    }
  };

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
  
    // Calculate the width of the title text
    const titleWidth = doc.getTextWidth(fileTitle);

    // Calculate the x position to center the title (middle of the page)
    const pageWidth = doc.internal.pageSize.width;
    const xPosition = (pageWidth - titleWidth) / 2;

    // Split the title text if it's too long to fit in the page width
    const formattedTitle = doc.splitTextToSize(fileTitle, 180);
    doc.text(formattedTitle, xPosition, 10);
  
    doc.setFont("helvetica", "normal");
  
    let y = 20; // Initial Y position
    const pageHeight = doc.internal.pageSize.height; // Page height
    const marginBottom = 15; // Increased bottom margin for better spacing
    const lineHeight = 12; // Increased line height for better readability
  
    let transcript = selectedItem.text;
  
    if (typeof transcript === "string") {
      transcript = [{ time: "", STT: transcript }];
    }
  
    // Add STT text to PDF
    doc.setFont("helvetica");
    doc.text("STT Transcript:", 10, y);
    y += lineHeight + 5; // Add spacing after the title
  
    if (Array.isArray(transcript)) {
      transcript.forEach((entry) => {
        const timeText = entry.time ? `${entry.time} - ` : ""; // Include timestamp if available
        const text = entry.STT || entry.text || "No transcription available"; // Ensure valid text
  
        const formattedText = doc.splitTextToSize(`${timeText}${text}`, 180); // Wrap text
  
        formattedText.forEach((line) => {
          if (y + lineHeight > pageHeight - marginBottom) {
            doc.addPage(); // Add a new page if space runs out
            y = 20; // Reset Y position on new page
          }
  
          doc.text(line, 10, y);
          y += lineHeight; // Move to next line with equal spacing
        });
      });
    }
  
    // Draw a line to separate STT and OCR sections
    const lineY = y + 5; // Position for the line after STT section
    doc.setDrawColor(0, 0, 0); // Set color for the line (black)
    doc.setLineWidth(0.5); // Set line width
    doc.line(10, lineY, 200, lineY); // Draw the line (startX, startY, endX, endY)
  
    y = lineY + 15; // Adjust y position after the line and before OCR
  
    // Add OCR text to PDF if available
    doc.setFont("helvetica");
    doc.text("OCR Transcript:", 10, y);
    y += lineHeight + 5; // Add spacing after the title
  
    if (Array.isArray(transcript)) {
      transcript.forEach((entry) => {
        const timeText = entry.time ? `${entry.time} - ` : ""; // Include timestamp if available
        const text = entry.OCR || entry.text || "No transcription available"; // Ensure valid text
  
        const formattedText = doc.splitTextToSize(`${timeText}${text}`, 180); // Wrap text
  
        formattedText.forEach((line) => {
          if (y + lineHeight > pageHeight - marginBottom) {
            doc.addPage(); // Add a new page if space runs out
            y = 20; // Reset Y position on new page
          }
  
          doc.text(line, 10, y);
          y += lineHeight; // Move to next line with equal spacing
        });
      });
    }
  
    // Draw a line to separate OCR and Summary sections
    const lineZ = y + 5; // Position for the line after OCR section
    doc.setDrawColor(0, 0, 0); // Set color for the line (black)
    doc.setLineWidth(0.5); // Set line width
    doc.line(10, lineZ, 200, lineZ); // Draw the line (startX, startY, endX, endY)
  
    y = lineZ + 15; // Adjust y position after the line and before the Summary
  
    // Add Summary text to PDF if available
    const summary = selectedItem.summary || selectedSummary;
  
    if (summary) {
      doc.setFont("helvetica");
      doc.text("Summary:", 10, y);
      y += lineHeight + 5; // Add spacing after the title
  
      // Add Hugging Face summary if available
      if (summary.huggingface) {
        doc.text("Hugging Face Summary:", 10, y);
        y += lineHeight;
        const formattedHuggingFace = doc.splitTextToSize(summary.huggingface || "No Hugging Face summary available.", 180);
        formattedHuggingFace.forEach((line) => {
          if (y + lineHeight > pageHeight - marginBottom) {
            doc.addPage(); // Add a new page if space runs out
            y = 20; // Reset Y position on new page
          }
          doc.text(line, 10, y);
          y += lineHeight;
        });
      }
      
      y += lineHeight;
  
      // Add Sumy summary if available
      if (summary.sumy) {
        doc.text("Sumy Summary:", 10, y);
        y += lineHeight;
        const formattedSumy = doc.splitTextToSize(summary.sumy || "No Sumy summary available.", 180); 
        formattedSumy.forEach((line) => {
          if (y + lineHeight > pageHeight - marginBottom) {
            doc.addPage(); // Add a new page if space runs out
            y = 20; // Reset Y position on new page
          }
          doc.text(line, 10, y);
          y += lineHeight;
        });
      }
    }
  
    // Save the document as PDF
    doc.save(`${fileTitle.replace(/\s+/g, "_")}.pdf`);
  };
  
  
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token"); // get JWT token
    if (!window.confirm(`Are you sure you want to delete "${id}"?`)) return;

    console.log("ID to delete:", id);  // Debugging line

    if (!id) {
        alert("ID is missing!");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5000/delete_transcription", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id })  // Send the ID in the request body
        });

        const data = await response.json();

        if (data.success) {
            alert(data.success);
            setHistoryData((prev) => prev.filter((item) => item.id !== id));
        } else {
            alert(data.error || "Deletion failed!");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("An error occurred during deletion.");
    }
};


  
  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("filename");
    localStorage.removeItem("transcription");
    navigate("/");
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
          <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translate</li>
          <li className="history-active">History</li>
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
      <div className="history-content">
        <h1>📌 History</h1>
        <p>View or download your saved transcripts and notes.</p>

        <HistoryTable
          historyData={historyData}
          handleView={handleView}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
        />

        <div className="transcript-tabs">
          <button 
            className={activeTab === "STT" ? "tab active" : "tab"}
            onClick={() => setActiveTab("STT")}
          >
            STT Transcript
          </button>
          <button 
            className={activeTab === "OCR" ? "tab active" : "tab"}
            onClick={() => setActiveTab("OCR")}
          >
            OCR Transcript
          </button>
          <button 
            className={activeTab === "SUMMARY" ? "tab active" : "tab"}
            onClick={() => setActiveTab("SUMMARY")}
          >
            Summary
          </button>
        </div>

        {/* Display the transcript when an item is selected */}
        {loadingTranscript && <p>Loading transcript...</p>}
        {activeTab === "SUMMARY" ? (
          selectedSummary && (
            <div className="transcript-entry">
              <h3>Hugging Face Summary:</h3>
              <p>{selectedSummary.huggingface || "No Hugging Face summary available."}</p>
              <h3>Sumy Summary:</h3>
              <p>{selectedSummary.sumy || "No Sumy summary available."}</p>
            </div>
          )
        ) : (
          selectedTranscript && selectedTranscript.length > 0 && selectedTranscript.map((entry, index) => (
            <div key={index} className="transcript-entry">
              <div className="transcript-timestamp">
                {entry.time}
              </div>
              <div className="transcript-text">
                {activeTab === "STT" && entry.STT ? entry.STT : null}
                {activeTab === "OCR" && entry.OCR ? entry.OCR : null}
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default HistoryPage;