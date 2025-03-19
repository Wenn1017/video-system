import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewPage = () => {
  const { id } = useParams();
  const [content, setContent] = useState(null);

  useEffect(() => {
    // Fetch transcript & notes from backend (Replace with actual API)
    fetch(`http://localhost:5000/transcript/${id}`)
      .then((res) => res.json())
      .then((data) => setContent(data))
      .catch((err) => console.error("Error fetching transcript:", err));
  }, [id]);

  return (
    <div className="view-page">
      <h1>{content ? content.title : "Loading..."}</h1>
      <p><strong>Date:</strong> {content ? content.date : "Loading..."}</p>
      <h2>Transcript:</h2>
      <p>{content ? content.transcript : "Loading transcript..."}</p>
      <h2>Notes:</h2>
      <p>{content ? content.notes : "Loading notes..."}</p>
    </div>
  );
};

export default ViewPage;