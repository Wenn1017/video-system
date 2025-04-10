import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { FiLogOut } from "react-icons/fi";
import "./SummaryPage.css";

const SummaryPage = () => {
  const printRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [abstractiveSummary, setAbstractiveSummary] = useState("");
  const [extractiveSummary, setExtractiveSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [videoTitle, setVideoTitle] = useState("");
  const [transcript, setTranscript] = useState([]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("filename");
    localStorage.removeItem("transcription");
    navigate("/");
  };

  useEffect(() => {
    const locationState = window.history.state?.usr || {};
    let filename = locationState.filename || searchParams.get("filename") || localStorage.getItem("filename");
    let storedTranscript = locationState.transcription || JSON.parse(localStorage.getItem("transcription"));

    if (!filename) {
      console.error("⚠️ Filename is missing!");
      return;
    }

    setVideoTitle(filename);

    const summaryCacheKey = `summary_${filename}`;
    const cachedAbstractive = localStorage.getItem(`${summaryCacheKey}_abstractive`);
    const cachedExtractive = localStorage.getItem(`${summaryCacheKey}_extractive`);

    if (cachedAbstractive && cachedExtractive) {
      setAbstractiveSummary(cachedAbstractive);
      setExtractiveSummary(cachedExtractive);
      setLoading(false);
      return;
    }

    const fetchSummary = (transcriptData) => {
      setLoading(true);
      fetch("http://127.0.0.1:5000/get_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptData })
      })
        .then((res) => res.json())
        .then((data) => {
          const abstractive = data.summary_huggingface || "No abstractive summary available.";
          const extractive = data.summary_sumy || "No extractive summary available.";
          setAbstractiveSummary(abstractive);
          setExtractiveSummary(extractive);
          localStorage.setItem(`${summaryCacheKey}_abstractive`, abstractive);
          localStorage.setItem(`${summaryCacheKey}_extractive`, extractive);
        })
        .catch((err) => console.error("Error fetching summaries:", err))
        .finally(() => setLoading(false));
    };

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
        .then((res) => res.json())
        .then((data) => {
          const trans = data.transcription || [{ time: "0:00", text: "No transcription available", type: "STT" }];
          setTranscript(trans);
          fetchSummary(trans);
        })
        .catch((err) => {
          console.error("Error fetching transcription:", err.message);
        });
    }
  }, [searchParams]);

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

        <div className="summary-main-content">
          <div className="summary-header">
            <h1>{videoTitle || "No Video Selected"}</h1>
            <button onClick={handlePrint} className="print-btn">Print</button>
          </div>

          <div className="summary-content" ref={printRef}>
            <h2>Abstractive Summary (Hugging Face)</h2>
            {loading ? <p>Loading abstractive summary...</p> : <p className="summary-text">{abstractiveSummary}</p>}

            <h2>Extractive Summary (Sumy)</h2>
            {loading ? <p>Loading extractive summary...</p> : <p className="summary-text">{extractiveSummary}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
