import React, { useState } from "react";
import FileUpload from "./components/FileUpload";

function App() {
  return (
    <div className="App">
      <h1>Convert PDF to XRechnung</h1>
      <FileUpload />
    </div>
  );
}

export default App;
