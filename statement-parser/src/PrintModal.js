// src/PrintModal.js

import React, { useState } from 'react';

const PrintModal = ({ onClose, onConfirm, initialConfig }) => {
  const [config, setConfig] = useState(initialConfig);

  const handleCheckboxChange = (section) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      [section]: !prevConfig[section],
    }));
  };

  const handleConfirmClick = () => {
    onConfirm(config);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Customize Your Report</h2>
        <p>Select the sections you want to include in the PDF.</p>
        <div className="print-options">
          <label>
            <input
              type="checkbox"
              checked={config.summary}
              onChange={() => handleCheckboxChange('summary')}
            />
            Account Summary
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.analysis}
              onChange={() => handleCheckboxChange('analysis')}
            />
            Spending Analysis Chart
          </label>
          <label>
            <input
              type="checkbox"
              checked={config.transactions}
              onChange={() => handleCheckboxChange('transactions')}
            />
            Transaction History
          </label>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleConfirmClick}>Generate PDF</button>
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
