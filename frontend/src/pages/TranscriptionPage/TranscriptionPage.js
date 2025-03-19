// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { jsPDF } from "jspdf";
// import "./TranscriptionPage.css"; // Import the CSS file

// const TranscriptionPage = () => {
//   const [videoTitle, setVideoTitle] = useState("Uploaded Video Title");
//   const [transcription, setTranscription] = useState("Your transcription text will appear here...");
//   const [videoUrl, setVideoUrl] = useState(null);
//   const videoRef = useRef(null);
//   const navigate = useNavigate();

//   // Handles video file upload
//   const handleVideoUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setVideoUrl(url);
//       setVideoTitle(file.name);
//     }
//   };

//   // Handles exporting transcription as Word document
//   const handleExportWord = () => {
//     const blob = new Blob([transcription], { type: "application/msword" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${videoTitle}.doc`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Export transcript as PDF
//   const exportToPDF = () => {
//     const doc = new jsPDF();
//     doc.setFont("helvetica", "bold");
//     doc.text("Video Transcript", 10, 10);
//     doc.setFont("helvetica", "normal");
  
//     let y = 20;
//     const transcriptData = transcription.split("\n"); // Assuming transcription is a plain text string
  
//     transcriptData.forEach((line) => {
//       doc.text(line, 10, y, { maxWidth: 180 });
//       y += 10;
//     });
  
//     doc.save(`${videoTitle}.pdf`);
//   };  

//   return (
//     <div className="transcription-page">
//       <div className="transcription-container">
//         {/* Sidebar */}
//         <div className="transcription-sidebar">
//           <h2 className="transcription-logo">Video Analysis and Note Generation System</h2>
//           <ul>
//             <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
//             <li className="transcription-active">Transcription</li>
//             <li>Notes</li>
//             <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translation</li>
//             <li>History</li>
//           </ul>
//         </div>

//         {/* Main Content */}
//         <div className="transcription-main-content">
//           <div className="transcription-header">
//             <h3 className="transcription-video-title">{videoTitle}</h3>
//             <div className="transcription-export-buttons">
//               <button className="transcription-btn" onClick={handleExportWord}>Export Word</button>
//             </div>
//           </div>

//           {/* Video Upload */}
//           <input type="file" accept="video/*" onChange={handleVideoUpload} />

//           {/* Video Player */}
//           {videoUrl && (
//             <video ref={videoRef} src={videoUrl} controls style={{ width: "100%", maxWidth: "800px" }} />
//           )}

//           {/* Transcription Box */}
//           <div className="transcription-box">
//             <textarea
//               className="transcription-text"
//               value={transcription}
//               onChange={(e) => setTranscription(e.target.value)}
//               placeholder="Your transcription text..."
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TranscriptionPage;

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./TranscriptionPage.css"; // Import the CSS file

const TranscriptionPage = () => {
  // const [videoTitle, setVideoTitle] = useState("Uploaded Video Title");
  // const [transcription, setTranscription] = useState("Your transcription text will appear here...");
  // const [videoUrl, setVideoUrl] = useState(null);
  const printRef = useRef(null);
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  // Sample transcript data (Replace this with actual data)
  const transcript = [
    { time: "0:00", text: "Thank you. I'm honored to be with you today..." },
    { time: "1:16", text: "Except that when I popped out, they decided at the last minute..." },
    { time: "2:26", text: "So I decided to drop out and trust that it would all work out..." },
  ];

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
            <h1>Steve Jobs Speech</h1>
              <button onClick={handlePrint} className="print-btn">Print</button>
          </div>

        <div className="transcript-content" ref={printRef}>
        {transcript.map((entry, index) => (
          <div key={index} className="transcript-entry">
            <span className="timestamp">{entry.time}</span>
            <p className="text">{entry.text}</p>
          </div>
        ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default TranscriptionPage;