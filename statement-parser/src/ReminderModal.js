// src/ReminderModal.js

import React from 'react';

const ReminderModal = ({ onClose, statementData, userEmail }) => {
  if (!statementData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content reminder-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h3>Email Reminder Set!</h3>
        <div className="email-simulation">
          <p><strong>To:</strong> {userEmail}</p>
          <p><strong>Subject:</strong> Upcoming Payment Reminder</p>
          <hr />
          <h4>Hi there,</h4>
          <p>This is a friendly reminder that your payment for your <strong>{statementData.card_provider}</strong> credit card is due soon.</p>
          <ul>
            <li><strong>Due Date:</strong> {statementData.payment_due_date}</li>
            <li><strong>Total Balance:</strong> ${statementData.total_balance.toFixed(2)}</li>
            <li><strong>Minimum Payment:</strong> ${statementData.minimum_payment.toFixed(2)}</li>
          </ul>
          <p>Paying on time helps you avoid late fees and protects your credit score. You can log in to your provider's website to make a payment.</p>
          <p>Thank you for using our service!</p>
        </div>
        <button className="btn-primary" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
};

export default ReminderModal;
