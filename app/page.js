"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login"); // redirect to login
  }, [router]);

  return null; // nothing on root, just redirect
}
import Image from "next/image";
import ImageUploader from "./components/ImageUploader";
// import CertificateVerifier from "./components/CertificateVerifier";

// export default function Home() {
//   return (
//     <>
//     <CertificateVerifier/>
//     </>
//   );
// }

// app/page.js

// app/page.js