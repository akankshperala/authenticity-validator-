// app/dashboard/page.js
"use client";
import CertificateVerifier from "../certificateVerifier";

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <CertificateVerifier />
    </div>
  );
}
