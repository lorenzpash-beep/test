import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, Image as ImageIcon } from 'lucide-react';

export const FileUpload = ({ onUploadSuccess }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      onUploadSuccess(data);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>1. Upload Homebrew</h2>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
        <div className="upload-box" style={{ flex: 1, border: '2px dashed #444', padding: '1rem', textAlign: 'center' }}>
          <FileText size={48} color={pdfFile ? '#c9ad6a' : '#666'} />
          <p>{pdfFile ? pdfFile.name : 'Select PDF'}</p>
          <input type="file" accept="application/pdf" onChange={handlePdfChange} style={{ display: 'none' }} id="pdf-input" />
          <button onClick={() => document.getElementById('pdf-input').click()} style={{ background: '#444' }}>Browse</button>
        </div>
        <div className="upload-box" style={{ flex: 1, border: '2px dashed #444', padding: '1rem', textAlign: 'center' }}>
          <ImageIcon size={48} color={imageFile ? '#c9ad6a' : '#666'} />
          <p>{imageFile ? imageFile.name : 'Optional Image'}</p>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="image-input" />
          <button onClick={() => document.getElementById('image-input').click()} style={{ background: '#444' }}>Browse</button>
        </div>
      </div>
      <button onClick={handleUpload} disabled={!pdfFile || loading} style={{ width: '100%' }}>
        {loading ? 'Processing...' : 'Analyze Content'}
      </button>
    </div>
  );
};
