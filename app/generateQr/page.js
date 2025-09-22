"use client";
import { useState } from "react";
import QRCode from "qrcode";

export default function GenerateQR() {
  const [certId, setCertId] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const handleGenerate = async () => {
    if (!certId) return;
    const url = `http://localhost:3000/verify/${certId}`;
    const qr = await QRCode.toDataURL(url);
    setQrUrl(qr);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🎓 Certificate QR Generator
        </h1>
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Generate QR Code
        </button>

        {qrUrl && (
          <div className="mt-6">
            <img src={qrUrl} alt="QR Code" className="mx-auto border p-2 rounded-lg" />
            <p className="mt-2 text-sm text-gray-600">
              Scan this QR to verify certificate <b>{certId}</b>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
