"use client";

import { useState } from "react";

export default function VerifyPage() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
    setReport("");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/ocr", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.report) setReport(data.report);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1>OCR Certificate Verification</h1>
      <input type="file" onChange={handleUpload} accept="image/*" />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Processing..." : "Verify Certificate"}
      </button>
      {report && (
        <pre style={{ whiteSpace: "pre-wrap", background: "#f0f0f0", padding: "10px", marginTop: "10px" }}>
          {report}
        </pre>
      )}
    </div>
  );
}
