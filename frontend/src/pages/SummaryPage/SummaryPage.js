import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import "./SummaryPage.css";

const SummaryPage = () => {
  const printRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    const locationState = window.history.state?.usr || {};
    let filename = locationState.filename || searchParams.get("filename") || localStorage.getItem("filename");
    let storedTranscript = locationState.transcription || JSON.parse(localStorage.getItem("transcription"));

    if (!filename) {
      console.error("⚠️ Filename is missing!");
      return;
    }

    setVideoTitle(filename);
    
    if (storedTranscript) {
      setTranscript(storedTranscript);
      fetchSummary(storedTranscript);
    } else {
      fetch(`http://localhost:5000/get_transcription_by_filename?filename=${encodeURIComponent(filename)}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            throw new Error(`Backend error: ${data.error}`);
          }
          setTranscript(data.transcription || [{ time: "0:00", text: "No transcription available", type: "STT" }]);
          fetchSummary(data.transcription);
        })
        .catch(error => {
          console.error("Error fetching transcription:", error.message);
        });
    }
  }, [searchParams]);

  const fetchSummary = (transcriptData) => {
    setLoading(true);
    fetch("http://127.0.0.1:5000/get_summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcriptData })
    })
      .then(response => response.json())
      .then(data => {
        setSummary(data.summary_huggingface);
        setKeywords(data.keywords_tfidf);
      })
      .catch(error => console.error("Error fetching summary:", error))
      .finally(() => setLoading(false));
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="summary-page">
      <div className="summary-container">
        <div className="summary-sidebar">
          <h2 className="summary-logo">Video Analysis and Note Generation System</h2>
          <ul>
            <li onClick={() => navigate("/main")} style={{ cursor: "pointer" }}>Upload</li>
            <li onClick={() => navigate("/transcription")} style={{ cursor: "pointer" }}>Transcript</li>
            <li className="summary-active">Note</li>
            <li onClick={() => navigate("/translation")} style={{ cursor: "pointer" }}>Translate</li>
            <li onClick={() => navigate("/history")} style={{ cursor: "pointer" }}>History</li>
          </ul>
        </div>
        
        <div className="summary-main-content">
          <div className="summary-header">
            <h1>{videoTitle || "No Video Selected"}</h1>
            <button onClick={handlePrint} className="print-btn">Print</button>
          </div>

          <div className="summary-content" ref={printRef}>
            <h2>Summary</h2>
            {loading ? <p>Loading summary...</p> : <p className="summary-text">{summary}</p>}

            <h2>Keywords</h2>
            {loading ? <p>Loading keywords...</p> : (
              <ul>
                {keywords.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
