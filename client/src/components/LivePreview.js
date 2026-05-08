import React, { useState } from 'react';

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
  .preview-section { font-family: 'Lora', serif; font-variant: small-caps; border-bottom: 1px solid #58180d; color: #58180d; font-weight: bold; margin-top: 10px; }
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
      const result = await window.electron.generatePDF({
        name: data.name,
        type,
        data,
        imagePath
      });
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

  const updateArrayField = (field, index, subfield, value) => {
      const newArray = [...(data[field] || [])];
      newArray[index] = { ...newArray[index], [subfield]: value };
      setData({ ...data, [field]: newArray });
  };

  return (
    <div className="card">
      <style>{previewStyles}</style>
      <h2>3. Review & Edit Details</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ maxHeight: '700px', overflowY: 'auto', paddingRight: '10px' }}>
            <label>Name</label>
            <input type="text" value={data.name || ''} onChange={(e) => updateField('name', e.target.value)} />

            {type === 'creature' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <div><label>AC</label><input type="text" value={data.ac || ''} onChange={(e) => updateField('ac', e.target.value)} /></div>
                        <div><label>HP</label><input type="text" value={data.hp || ''} onChange={(e) => updateField('hp', e.target.value)} /></div>
                        <div><label>Speed</label><input type="text" value={data.speed || ''} onChange={(e) => updateField('speed', e.target.value)} /></div>
                    </div>

                    <h3>Traits</h3>
                    {(data.traits || []).map((t, i) => (
                        <div key={i} className="card" style={{ padding: '10px', marginBottom: '10px' }}>
                            <input type="text" value={t.name} onChange={(e) => updateArrayField('traits', i, 'name', e.target.value)} placeholder="Trait Name" />
                            <textarea rows="2" value={t.description} onChange={(e) => updateArrayField('traits', i, 'description', e.target.value)} placeholder="Description" />
                        </div>
                    ))}
                    <button onClick={() => updateField('traits', [...(data.traits || []), { name: 'New Trait', description: '' }])} style={{ padding: '5px', fontSize: '12px' }}>+ Add Trait</button>

                    <h3>Actions</h3>
                    {(data.actions || []).map((a, i) => (
                        <div key={i} className="card" style={{ padding: '10px', marginBottom: '10px' }}>
                            <input type="text" value={a.name} onChange={(e) => updateArrayField('actions', i, 'name', e.target.value)} placeholder="Action Name" />
                            <textarea rows="2" value={a.description} onChange={(e) => updateArrayField('actions', i, 'description', e.target.value)} placeholder="Description" />
                        </div>
                    ))}
                    <button onClick={() => updateField('actions', [...(data.actions || []), { name: 'New Action', description: '' }])} style={{ padding: '5px', fontSize: '12px' }}>+ Add Action</button>
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

            <label style={{ marginTop: '1rem', display: 'block' }}>Background Description</label>
            <textarea rows="5" value={data.description || ''} onChange={(e) => updateField('description', e.target.value)} />
        </div>

        <div>
            <div className="preview-container">
                <h4 style={{ color: '#666', fontSize: '10px', textTransform: 'uppercase', marginBottom: '10px' }}>Final Layout Preview</h4>
                <div className={type === 'creature' ? 'preview-stat-block' : ''}>
                    {imagePath && <img src={`app-data://${imagePath}`} className="preview-art" alt="art" />}
                    <h1 className="preview-heading" style={type === 'creature' ? { border: 'none', margin: 0 } : {}}>{data.name}</h1>
                    <p style={{ fontStyle: 'italic', fontSize: '12px', margin: '0 0 10px 0' }}>{type}</p>
                    {type === 'creature' && (
                        <>
                            <hr style={{ borderColor: '#58180d' }} />
                            <div className="preview-prop"><h4>Armor Class</h4><p>{data.ac}</p></div><br/>
                            <div className="preview-prop"><h4>Hit Points</h4><p>{data.hp}</p></div><br/>
                            <div className="preview-prop"><h4>Speed</h4><p>{data.speed}</p></div>
                            <hr style={{ borderColor: '#58180d' }} />
                            {(data.traits || []).map((t, i) => (
                                <div key={i} style={{ fontSize: '13px', marginBottom: '5px' }}><strong>{t.name}.</strong> {t.description}</div>
                            ))}
                            <div className="preview-section">Actions</div>
                            {(data.actions || []).map((a, i) => (
                                <div key={i} style={{ fontSize: '13px', marginBottom: '5px' }}><strong>{a.name}.</strong> {a.description}</div>
                            ))}
                        </>
                    )}
                    <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap', marginTop: '10px' }}>{data.description}</p>
                </div>
            </div>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', marginTop: '1.5rem' }}>
        {loading ? 'Generating High-Res PDF...' : 'Generate Official Layout'}
      </button>
    </div>
  );
};
