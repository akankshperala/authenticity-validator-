"use client";
import { useState, useEffect } from "react";

export default function InstitutionDashboardPage() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [certificates, setCertificates] = useState([]);

  // Fetch all certificates from the backend
  const fetchCertificates = async () => {
    try {
      const res = await fetch("/api/certificates"); // Assuming a new endpoint for fetching
      if (!res.ok) {
        throw new Error("Failed to fetch certificates.");
      }
      const data = await res.json();
      console.log(data.certificates.certificates);
      
      setCertificates(data.certificates);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage(`Error: ${error.message}`);
    }
  };

  // Fetch data on initial component load
  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("certificateData", file);

    try {
      const res = await fetch("/api/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      setMessage(data.message);
      setFile(null);
      e.target.reset();

      // Refresh the table with the new data
      await fetchCertificates();
      
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-xl p-8 rounded-lg w-full max-w-4xl space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Institution Dashboard
            </h2>
            <p className="text-gray-500 mt-2">
              Bulk upload certificate records for verification.
            </p>
        </div>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoading ? "Uploading..." : "Upload Records"}
          </button>
        </form>
        
        {message && (
          <p
            className={`text-center text-sm font-semibold ${
              message.startsWith("Error:") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        {certificates.length > 0 && (
          <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Uploaded Certificates
              </h3>
              <div className="overflow-x-auto rounded-lg shadow-sm">
                  <table className="min-w-full bg-white border-collapse">
                      <thead className="bg-gray-200">
                          <tr>
                              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Roll No</th>
                              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Course</th>
                              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">SGPA</th>
                              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">CGPA</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {certificates.map((cert, index) => (
                              <tr key={index}>
                                  <td className="py-3 px-4 text-sm text-gray-700">{cert.name}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{cert.rollNo}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{cert.course}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{cert.sgpa}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{cert.cgpa}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}