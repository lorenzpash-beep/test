import React, { useState, useEffect } from 'react';
import { Download, Trash2, FilePlus } from 'lucide-react';

export const Library = ({ onNew }) => {
  const [creations, setCreations] = useState([]);

  useEffect(() => {
    fetchCreations();
  }, []);

  const fetchCreations = async () => {
    try {
      const data = await window.electron.getCreations();
      setCreations(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await window.electron.deleteCreation(id);
      fetchCreations();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleOpen = (url) => {
      window.electron.openPDF(url);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>My Library</h1>
        <button onClick={onNew}><FilePlus size={18} style={{ marginRight: '0.5rem' }} /> Create New</button>
      </div>
      <div className="grid">
        {creations.map(c => (
          <div key={c.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '200px', overflow: 'hidden', background: '#333' }}>
                {c.thumbnail_path && (
                    <img src={c.thumbnail_path} alt="thumbnail" style={{ width: '100%', height: 'auto' }} />
                )}
            </div>
            <div style={{ padding: '1rem' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{c.name}</h3>
                <p style={{ fontStyle: 'italic', fontSize: '0.8rem', opacity: 0.7 }}>{c.type} • {new Date(c.date).toLocaleDateString()}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={() => handleOpen(c.result_pdf_path)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Download size={16} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: '#333' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
            </div>
          </div>
        ))}
      </div>
      {creations.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>No creations yet.</p>}
    </div>
  );
};
