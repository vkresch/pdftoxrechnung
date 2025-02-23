import React, { useState } from "react";

function FileUpload() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
      } else {
        alert("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={isLoading}>
        {isLoading ? "Processing..." : "Upload and Convert"}
      </button>
      {resultUrl && (
        <div>
          <a href={resultUrl} download="invoice.xml">
            Download XML
          </a>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
