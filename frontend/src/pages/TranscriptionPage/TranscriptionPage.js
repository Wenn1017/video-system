import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./TranscriptionPage.css"; // Import CSS file

const TranscriptionPage = () => {
  const [videoTitle, setVideoTitle] = useState(""); // Ensure videoTitle is a string
  const [transcript, setTranscriptions] = useState([]); // Ensure transcript is an array
  const printRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
    doc.setFont("helvetica", "bold");
    doc.text(videoTitle, 10, 10);

    doc.setFont("helvetica", "normal");

    let y = 20; // Initial Y position
    const pageHeight = doc.internal.pageSize.height; // Page height
    const marginBottom = 10; // Space at the bottom of the page
    const lineHeight = 10; // Line spacing

    transcript.forEach((entry, index) => {
      const text = entry.text || entry.STT || "No transcription available"; // Ensure correct key
      const formattedText = doc.splitTextToSize(`${entry.time} - ${text}`, 180); // Wrap text within 180 width
      // Check if text will exceed page height
      if (y + formattedText.length * lineHeight > pageHeight - marginBottom) {
        doc.addPage(); // Add new page
        y = 20; // Reset Y position
      }

      doc.text(formattedText, 10, y);
      y += formattedText.length * lineHeight; // Move to next line dynamically

      // doc.text(`${entry.time} - ${entry.STT}`, 10, 20 + index * 10);
    });

    doc.save(`${videoTitle.replace(/\s+/g, "_")}.pdf`);
  };

  // // Sample transcript data (Replace this with actual data)
  // const transcript = [
  //   { time: "0:00", text: "Thank you. I'm honored to be with you today..." },
  //   { time: "1:16", text: "Except that when I popped out, they decided at the last minute..." },
  //   { time: "2:26", text: "So I decided to drop out and trust that it would all work out..." },
  // ];

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
        </div>
        
        {/* Main Content */}
        <div className="transcription-main-content">
          <div className="transcript-header">
          <h1>{videoTitle || "No Video Selected"}</h1>
            <button onClick={handlePrint} className="transcript-print-btn">Print</button>
            <button onClick={handleDownloadPDF} className="transcript-pdf-btn">Download PDF</button>
          </div>

        <div className="transcript-content" ref={printRef}>
        {transcript.map((entry, index) => (
          <div key={index} className="transcript-entry">
            <span className="transcript-timestamp">{entry.time}</span>
            <p className="transcript-text">{entry.STT}</p>
          </div>
        ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default TranscriptionPage;