import React, { useState } from "react";
import "./App.css";
import "./pages/navbar.css";
import Navbar from "./pages/navbar"; // Correct import for Navbar component

import PdfReader from "./pages/PdfReader"; // Correct path to PdfReader

// Define the CertificateDownloadButton here
const CertificateDownloadButton = () => {
  const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);

  // Logic for enabling download (for example, when progress is 100%)
  const handleDownload = () => {
    // Implement certificate generation or download logic here
    console.log("Downloading certificate...");
  };

  return (
    <button
      className={`download-button ${
        isDownloadEnabled ? "enabled" : "disabled"
      }`}
      onClick={handleDownload}
      disabled={!isDownloadEnabled}
    ></button>
  );
};

function App() {
  return (
    <div>
      <Navbar />
      <PdfReader />
      <CertificateDownloadButton />
    </div>
  );
}

export default App;
