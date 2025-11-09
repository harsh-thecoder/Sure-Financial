import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './App.css';
import SpendingChart from './SpendingChart';
import Chatbot from './Chatbot';
import PrintModal from './PrintModal';
import AuthModal from './AuthModal';
import ReminderModal from './ReminderModal'; // The new reminder modal

// Expanded hardcoded data with more details, including a transaction list
const detailedHardcodedData = {
  card_provider: "Major Bank Inc.",
  card_variant: "Platinum Rewards",
  last_4_digits: "1234",
  billing_cycle: "Oct 26, 2025 - Nov 25, 2025",
  payment_due_date: "Dec 20, 2025",
  total_balance: 2156.34,
  minimum_payment: 75.00,
  credit_limit: 10000.00,
  available_credit: 7843.66,
  last_statement_balance: 1542.78,
  payments_credits: 1600.00,
  rewards_summary: {
    previous_balance: 8520,
    earned: 2156,
    redeemed: 0,
    total_points: 10676,
  },
  transactions: [
    { date: "10-28", description: "Coffee Shop Downtown", amount: -8.55, category: "Food & Drink" },
    { date: "10-29", description: "Online Subscription Service", amount: -15.00, category: "Bills & Utilities" },
    { date: "11-02", description: "Grocery Store", amount: -124.30, category: "Groceries" },
    { date: "11-05", description: "Gas Station", amount: -55.60, category: "Transportation" },
    { date: "11-10", description: "Restaurant Dinner", amount: -85.25, category: "Food & Drink" },
    { date: "11-12", description: "PAYMENT RECEIVED - THANK YOU", amount: 1600.00, category: "Payment" },
    { date: "11-15", description: "Bookstore Purchase", amount: -45.76, category: "Shopping" },
    { date: "11-18", description: "Movie Tickets", amount: -32.00, category: "Entertainment" },
    { date: "11-22", description: "Utility Bill Payment", amount: -120.10, category: "Bills & Utilities" },
  ],
};

function App() {
  // Core App State
  const [statementData, setStatementData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printConfig, setPrintConfig] = useState({ summary: true, analysis: true, transactions: true });

  // Authentication and History State
  const [currentUser, setCurrentUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // New state for the reminder modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  useEffect(() => {
    if (currentUser) {
      const history = JSON.parse(localStorage.getItem(`history_${currentUser}`)) || [];
      setUserHistory(history);
    } else {
      setUserHistory([]);
    }
  }, [currentUser]);

  // --- Auth and Data Handlers ---
  const handleSaveClick = () => {
    if (currentUser) {
      saveStatementToHistory();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const onLoginSuccess = (username) => {
    setCurrentUser(username);
    setIsAuthModalOpen(false);
    setTimeout(() => {
      saveStatementToHistory(username);
    }, 100);
  };
  
  const saveStatementToHistory = (username = currentUser) => {
    if (!statementData || !username) return;
    const history = JSON.parse(localStorage.getItem(`history_${username}`)) || [];
    const newHistoryEntry = { date: new Date().toLocaleString(), data: statementData, id: Date.now() };
    const updatedHistory = [...history, newHistoryEntry];
    localStorage.setItem(`history_${username}`, JSON.stringify(updatedHistory));
    setUserHistory(updatedHistory);
    alert(`Statement saved to ${username}'s profile!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };
  
  const handleLoadStatement = (statementId) => {
    const statementToLoad = userHistory.find(entry => entry.id === statementId);
    if (statementToLoad) {
      setStatementData(statementToLoad.data);
      setFileName(`History from ${statementToLoad.date}`);
    }
  };
  
  // --- UI and Feature Handlers ---
  const toggleTheme = () => setTheme(current => (current === 'light' ? 'dark' : 'light'));

  const handleFileChange = (event) => {
     const file = event.target.files[0];
     if (file && file.type === "application/pdf") {
       setFileName(file.name);
       setIsLoading(true);
       setStatementData(null);
       setTimeout(() => {
         setStatementData(detailedHardcodedData);
         setIsLoading(false);
       }, 1500);
     } else {
       alert("Please select a PDF file.");
     }
  };
  
  const handleUploadClick = () => document.getElementById('fileUpload').click();
  
  const handleExport = () => {
    if (!statementData || !statementData.transactions) return;
    const csv = Papa.unparse(statementData.transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrintClick = () => setIsPrintModalOpen(true);

  const handleConfirmPrint = (config) => {
    setPrintConfig(config);
    setIsPrintModalOpen(false);
    setTimeout(() => window.print(), 100);
  };

  const handleSetReminder = () => {
    if (!statementData) return;
    setIsReminderModalOpen(true);
  };

  const filteredTransactions = statementData?.transactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`app-container ${theme}`}>
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={onLoginSuccess} />}
      {isPrintModalOpen && <PrintModal onClose={() => setIsPrintModalOpen(false)} onConfirm={handleConfirmPrint} initialConfig={printConfig} />}
     {isReminderModalOpen && <ReminderModal onClose={() => setIsReminderModalOpen(false)} statementData={statementData} userEmail={JSON.parse(localStorage.getItem('users'))[currentUser]?.email || 'you@example.com'} />}


      <div className="app-header">
        <div className="header-top">
          <div className="profile-info">
            {currentUser ? (
              <h2>Welcome, {currentUser}</h2>
            ) : (
              <h2>Financial Dashboard</h2>
            )}
          </div>
          <div className="header-controls">
            <div className="theme-switcher">
              <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
              <label className="switch">
                <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
                <span className="slider round"></span>
              </label>
            </div>
            {currentUser && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
          </div>
        </div>

        {currentUser && userHistory.length > 0 && (
          <div className="history-section">
            <h3>Your Profile History</h3>
            <div className="history-list">
              {userHistory.map(entry => (
                <div key={entry.id} className="history-item">
                  <span>Statement from {entry.date}</span>
                  <button className="load-btn" onClick={() => handleLoadStatement(entry.id)}>Load</button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p>Upload a new PDF statement to get started.</p>
        <div className="upload-area" onClick={handleUploadClick}>
            <div className="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
                  <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z"/>
                </svg>
            </div>
            <p className="upload-text">Click to upload a statement</p>
            {fileName && <p className="file-name">{fileName}</p>}
        </div>
        <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf" />

        {isLoading && <div className="loading-spinner"></div>}

        {statementData && (
          <div className="results-card" id="printable-area">
             <div className="section-header no-print">
                <h2>Extracted Information</h2>
                <div className="results-actions">
                    <button className="action-btn" onClick={handleSaveClick}>Save to Profile</button>
                    <button className="action-btn reminder-btn" onClick={handleSetReminder}>Set Email Reminder</button>
                    <button className="action-btn" onClick={handlePrintClick}>Print PDF</button>
                </div>
            </div>

            <div className={!printConfig.summary ? 'print-hidden' : ''}>
              <h2>Account Summary</h2>
              <div className="results-grid">
                <div className="data-point"><strong>Provider</strong><span>{statementData.card_provider}</span></div>
                <div className="data-point"><strong>Card Number</strong><span>**** **** **** {statementData.last_4_digits}</span></div>
                <div className="data-point"><strong>Billing Cycle</strong><span>{statementData.billing_cycle}</span></div>
                <div className="data-point"><strong>Due Date</strong><span>{statementData.payment_due_date}</span></div>
                <div className="data-point"><strong>Credit Limit</strong><span>${statementData.credit_limit.toFixed(2)}</span></div>
                <div className="data-point"><strong>Available Credit</strong><span>${statementData.available_credit.toFixed(2)}</span></div>
                <div className="data-point total-balance"><strong>Total Balance</strong><span>${statementData.total_balance.toFixed(2)}</span></div>
                <div className="data-point"><strong>Minimum Payment</strong><span>${statementData.minimum_payment.toFixed(2)}</span></div>
              </div>
            </div>
            
            <div className="no-print">
              {/* <h2 className="no-print">AI Financial Assistant</h2> */}
              <Chatbot data={statementData} />
            </div>

            <div className={!printConfig.analysis ? 'print-hidden' : ''}>
                <div className="section-divider"></div>
                <h2>Spending Analysis</h2>
                <SpendingChart transactions={statementData.transactions} />
            </div>

            <div className={!printConfig.transactions ? 'print-hidden' : ''}>
                <div className="section-divider"></div>
                <div className="section-header">
                    <h2>Transaction History</h2>
                    <div className="transaction-controls no-print">
                      <input type="text" placeholder="Search transactions..." className="search-input" onChange={(e) => setSearchTerm(e.target.value)} />
                      <button className="export-btn" onClick={handleExport}>Export as CSV</button>
                    </div>
                </div>
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx, index) => (
                      <tr key={index}>
                        <td>{tx.date}</td>
                        <td>{tx.description}</td>
                        <td className={tx.amount > 0 ? 'credit-amount' : 'debit-amount'}>{tx.amount < 0 ? `-` : ''}${Math.abs(tx.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
