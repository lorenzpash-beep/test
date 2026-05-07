import React, { useState } from 'react';

// Simplified CSS that mimics the official style for preview
const previewStyles = `
  .preview-container {
    background: #fdf1dc;
    color: #000;
    padding: 20px;
    border-radius: 4px;
    font-family: 'Open Sans', sans-serif;
    min-height: 400px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
  }
  .preview-heading { font-family: 'Lora', serif; color: #58180d; border-bottom: 2px solid #c9ad6a; margin-bottom: 10px; }
  .preview-stat-block { border: 1px solid #ddd; padding: 10px; background: #fdf1dc; max-width: 100%; }
  .preview-art { float: right; width: 100px; height: auto; border-radius: 4px; margin-left: 10px; }
  .preview-prop h4 { display: inline; color: #58180d; font-weight: bold; }
  .preview-prop p { display: inline; margin-left: 5px; }
`;

export const LivePreview = ({ type, text, imagePath, extractedData, onGenerate }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(extractedData || {
    name: 'New ' + type,
    description: text.substring(0, 500) + '...'
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, type, data, imagePath }),
      });
      const result = await response.json();
      onGenerate(result.pdfUrl);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="card">
      <style>{previewStyles}</style>
      <h2>3. Review & Edit Details</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            <label>Name</label>
            <input type="text" value={data.name || ''} onChange={(e) => updateField('name', e.target.value)} />

            {type === 'creature' && (
                <>
                    <label>Armor Class</label>
                    <input type="text" value={data.ac || ''} onChange={(e) => updateField('ac', e.target.value)} />
                    <label>Hit Points</label>
                    <input type="text" value={data.hp || ''} onChange={(e) => updateField('hp', e.target.value)} />
                    <label>Speed</label>
                    <input type="text" value={data.speed || ''} onChange={(e) => updateField('speed', e.target.value)} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(ab => (
                            <div key={ab}>
                                <label>{ab.toUpperCase()}</label>
                                <input type="text" value={data[ab] || ''} onChange={(e) => updateField(ab, e.target.value)} />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {type === 'item' && (
                <>
                    <label>Type</label>
                    <input type="text" value={data.type || ''} onChange={(e) => updateField('type', e.target.value)} />
                    <label>Rarity</label>
                    <input type="text" value={data.rarity || ''} onChange={(e) => updateField('rarity', e.target.value)} />
                </>
            )}

            <label>Description / Text</label>
            <textarea rows="10" value={data.description || ''} onChange={(e) => updateField('description', e.target.value)} />
        </div>

        <div>
            <div className="preview-container">
                <h4 style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', marginBottom: '10px' }}>Final Layout Preview</h4>
                {type === 'creature' ? (
                    <div className="preview-stat-block">
                        {imagePath && <img src={`http://localhost:3001/${imagePath}`} className="preview-art" alt="art" />}
                        <h1 className="preview-heading" style={{ border: 'none', margin: 0 }}>{data.name}</h1>
                        <p style={{ fontStyle: 'italic', fontSize: '12px', margin: '0 0 10px 0' }}>{type}</p>
                        <hr style={{ borderColor: '#58180d' }} />
                        <div className="preview-prop"><h4>Armor Class</h4><p>{data.ac}</p></div><br/>
                        <div className="preview-prop"><h4>Hit Points</h4><p>{data.hp}</p></div><br/>
                        <div className="preview-prop"><h4>Speed</h4><p>{data.speed}</p></div>
                        <hr style={{ borderColor: '#58180d' }} />
                        <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{data.description}</p>
                    </div>
                ) : (
                    <div>
                        {imagePath && <img src={`http://localhost:3001/${imagePath}`} className="preview-art" alt="art" />}
                        <h1 className="preview-heading">{data.name}</h1>
                        {type === 'item' && <p style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{data.type}, {data.rarity}</p>}
                        <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{data.description}</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
        {loading ? 'Generating High-Res PDF...' : 'Generate Official Layout'}
      </button>
    </div>
  );
};
