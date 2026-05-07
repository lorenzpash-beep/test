import React, { useState } from 'react';
import './App.css';
import { FileUpload } from './components/FileUpload';
import { TypeSelector } from './components/TypeSelector';
import { LivePreview } from './components/LivePreview';
import { Library } from './components/Library';

function App() {
  const [step, setStep] = useState('upload'); // upload, preview, library
  const [uploadData, setUploadData] = useState(null);
  const [type, setType] = useState('creature');

  const handleUploadSuccess = (data) => {
    setUploadData(data);
    setType(data.type !== 'unknown' ? data.type : 'creature');
    setStep('preview');
  };

  const handleGenerateSuccess = (url) => {
    setStep('library');
  };

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>D&D 5e Homebrew PDFer</h1>
        <p style={{ opacity: 0.7 }}>Turn your homebrew into official-looking sourcebook pages.</p>
      </header>

      {step === 'upload' && (
        <>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <div style={{ textAlign: 'center' }}>
            <button onClick={() => setStep('library')} style={{ background: 'transparent', color: '#c9ad6a', border: '1px solid #c9ad6a' }}>
              View My Library
            </button>
          </div>
        </>
      )}

      {step === 'preview' && uploadData && (
        <>
          <TypeSelector type={type} setType={setType} />
          <LivePreview
            type={type}
            text={uploadData.text}
            imagePath={uploadData.imagePath}
            extractedData={uploadData.extractedData}
            onGenerate={handleGenerateSuccess}
          />
          <button onClick={() => setStep('upload')} style={{ background: '#333', marginTop: '1rem' }}>Back</button>
        </>
      )}

      {step === 'library' && (
        <Library onNew={() => setStep('upload')} />
      )}
    </div>
  );
}

export default App;
