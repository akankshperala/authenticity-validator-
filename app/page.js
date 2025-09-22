"use client";

import { useState } from "react";

export default function OCRForm() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const handleUpload = (e) => setFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/ocr", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setText(data.text);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />
      <button onClick={handleSubmit}>Extract Text</button>
      <pre>{text}</pre>
    </div>
  );
}
