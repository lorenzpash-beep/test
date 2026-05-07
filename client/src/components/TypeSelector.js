import React from 'react';

export const TypeSelector = ({ type, setType }) => {
  const types = ['creature', 'item', 'race', 'class', 'weapon'];

  return (
    <div className="card">
      <h2>2. Confirm Content Type</h2>
      <p>We detected this as a <strong>{type}</strong>. Is this correct?</p>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {types.map(t => (
          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
        ))}
      </select>
    </div>
  );
};
