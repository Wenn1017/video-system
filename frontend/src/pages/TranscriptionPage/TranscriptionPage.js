import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { FiLogOut } from "react-icons/fi";

import "./TranscriptionPage.css"; // Import CSS file

const TranscriptionPage = () => {
  const [videoTitle, setVideoTitle] = useState(""); // Ensure videoTitle is a string
  const [transcript, setTranscriptions] = useState([]); // Ensure transcript is an array
  const printRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("STT");
  
  // Get filename from URL parameters or localStorage
  useEffect(() => {
    const locationState = window.history.state?.usr || {};
    let filename = locationState.filename || searchParams.get("filename") || localStorage.getItem("filename");
    let storedTranscript = locationState.transcription || JSON.parse(localStorage.getItem("transcription"));

    if (!filename) {
      console.error("⚠️ Filename is missing!");
      return;
    }
    
    console.log("Retrieved filename:", filename);
    console.log("Retrieved transcript:", storedTranscript);

    setVideoTitle(filename);
    
    if (storedTranscript) {
      setTranscriptions(storedTranscript); 
    } else {
      fetch(`http://localhost:5000/get_transcription_by_filename?filename=${encodeURIComponent(filename)}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`  // Ensure token exists
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(`Backend error: ${data.error}`);
          }
    
          console.log("Fetched transcript data:", data);
          setVideoTitle(filename);
    
          // Store the transcription text properly
          setTranscriptions(data.transcription || [{ time: "0:00", text: "No transcription available", type: "STT" }]);
        })
        .catch(error => {
          console.error("Error fetching transcription:", error.message);
        });
      }
  }, [searchParams]);
  
  // Print Function
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title styling
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(videoTitle); // Calculate the title width
    const pageWidth = doc.internal.pageSize.width; // Get page width
    const margin = 10; // Define margin
    const titleX = (pageWidth - titleWidth) / 2; // Center the title horizontally
    
    // Add title to the PDF
    doc.text(videoTitle, titleX, 10);
  
    // Normal text styling
    doc.setFont("helvetica", "normal");
    
    let y = 20; // Initial Y position for the transcript
    const pageHeight = doc.internal.pageSize.height; // Page height
    const marginBottom = 10; // Space at the bottom of the page
    const lineHeight = 10; // Line spacing
    const textWidth = pageWidth - 2 * margin; // Text width with margins
  
    // Add STT text to PDF
    doc.text("STT Transcript:", margin, y);
    y += lineHeight; // Add line height for spacing
    
    // Add STT content
    transcript.forEach((entry, index) => {
      const text = entry.STT || "No STT available"; // Ensure correct key
      const formattedText = doc.splitTextToSize(`${entry.time} - ${text}`, textWidth); // Wrap text within margins
      
      // Check if text will exceed page height
      formattedText.forEach((line) => {
        if (y + lineHeight > pageHeight - marginBottom) {
          doc.addPage(); // Add new page if text exceeds the page height
          y = 20; // Reset Y position to top of new page
        }
        doc.text(line, margin, y); // Ensure text stays within margin
        y += lineHeight; // Move to next line dynamically
      });
    });
  
    // Draw a line to separate STT and OCR sections
    const lineY = y + 5; // Position for the line after STT section
    doc.setDrawColor(0, 0, 0); // Set color for the line (black)
    doc.setLineWidth(0.5); // Set line width
    doc.line(margin, lineY, pageWidth - margin, lineY); // Draw the line (startX, startY, endX, endY)
  
    y = lineY + 10; // Adjust y position after the line and before OCR
  
    // Add OCR text to PDF if available
    doc.text("OCR Transcript:", margin, y);
    y += lineHeight; // Add line height for spacing
  
    // Add OCR content
    transcript.forEach((entry, index) => {
      const text = entry.OCR || "No OCR available"; // Ensure correct key
      const formattedText = doc.splitTextToSize(`${entry.time} - ${text}`, textWidth); // Wrap text within margins
      
      // Check if text will exceed page height
      formattedText.forEach((line) => {
        if (y + lineHeight > pageHeight - marginBottom) {
          doc.addPage(); // Add new page if text exceeds the page height
          y = 20; // Reset Y position to top of new page
        }
        doc.text(line, margin, y); // Ensure OCR text stays within margin
        y += lineHeight; // Move to next line dynamically
      });
    });
  
    doc.save(`${videoTitle.replace(/\s+/g, "_")}.pdf`);
  };
  

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("filename");
    localStorage.removeItem("transcription");
    navigate("/");
  };

  return (
    <div className="transcription-page">
      <div className="transcription-container">
        {/* Sidebar */}
        <div className="transcription-sidebar">
          <h2 className="transcription-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
            <li className="transcription-active">Transcript</li>
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
        <div className="transcription-main-content">
          <div className="transcript-header">
          <h1>{videoTitle || "No Video Selected"}</h1>
            <button onClick={handlePrint} className="transcript-print-btn">Print</button>
            <button onClick={handleDownloadPDF} className="transcript-pdf-btn">Download PDF</button>
          </div>
        
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
          </div>
          
          <div className="transcript-content" ref={printRef}>
            {transcript.map((entry, index) => (
              <div key={index} className="transcript-entry">
                <div className="transcript-timestamp">
                  {entry.time}
                </div>
                <div className="transcript-text">
                  {activeTab === "STT" ? entry.STT || "No STT available" : entry.OCR || "No OCR available"}
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  </div>
  );
};

export default TranscriptionPage;