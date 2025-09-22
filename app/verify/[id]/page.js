import certs from "@/certs.json";

export default function Verify({ cert }) {
  if (!cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">❌ Fake Certificate</h1>
          <p className="mt-2 text-gray-600">This certificate ID is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ Valid Certificate</h1>
        <div className="space-y-2 text-gray-700">
          <p><b>ID:</b> {cert.id}</p>
          <p><b>Roll No:</b> {cert.rollNo}</p>
          <p><b>Name:</b> {cert.name}</p>
          <p><b>Course:</b> {cert.course}</p>
          <p><b>SGPA:</b> {cert.sgpa}</p>
          <p><b>CGPA:</b> {cert.cgpa}</p>
          <p><b>Result:</b> {cert.result}</p>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const cert = certs.find((c) => c.id === params.id) || null;
  return { props: { cert } };
}
