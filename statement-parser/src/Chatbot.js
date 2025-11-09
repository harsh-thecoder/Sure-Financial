import React, { useState, useEffect, useRef } from 'react';

// This function simulates the AI's logic with new advisory capabilities
const getAIResponse = (query, data) => {
  const q = query.toLowerCase();

  // --- Basic Financial Questions (Existing) ---
  if (q.includes('hello') || q.includes('hi')) {
    return "Hi! I'm your AI Financial Assistant. Ask me for advice or details about your statement.";
  }
  if (q.includes('total balance') || q.includes('how much do i owe')) {
    return `Your total balance is $${data.total_balance.toFixed(2)}.`;
  }
  if (q.includes('due date')) {
    return `Your payment is due on ${data.payment_due_date}.`;
  }

  // --- New, More Advanced AI Responses ---
  // 1. How to improve financial profile/credit score
  if (q.includes('improve my profile') || q.includes('improve my credit')) {
    const utilization = (data.total_balance / data.credit_limit) * 100;
    let advice = "Of course. Here are some general tips to improve your financial profile based on this statement:\n";
    advice += `\n- Pay On Time: Always pay at least the minimum amount by the due date (${data.payment_due_date}) to avoid late fees and negative marks on your credit report.`;
    if (utilization > 30) {
      advice += `\n- Lower Credit Utilization: Your credit utilization is currently around ${utilization.toFixed(0)}%. Lenders prefer to see this below 30%. Paying down your balance can significantly improve your credit score.`;
    } else {
      advice += `\n- Maintain Low Credit Utilization: Your credit utilization is excellent at around ${utilization.toFixed(0)}%. Keeping it below 30% is great for your credit score.`;
    }
    advice += "\n- Review Your Spending: Regularly check your transactions for accuracy and to understand your spending habits. This can help you find areas to save.";
    return advice;
  }

  // 2. Calculate and explain credit utilization
  if (q.includes('credit utilization')) {
    const utilization = (data.total_balance / data.credit_limit) * 100;
    let explanation = `Your credit utilization is ${utilization.toFixed(0)}%. This is calculated by dividing your total balance ($${data.total_balance.toFixed(2)}) by your credit limit ($${data.credit_limit.toFixed(2)}).\n\n`;
    if (utilization < 10) {
      explanation += "This is excellent! A very low utilization rate is viewed positively by lenders.";
    } else if (utilization < 30) {
      explanation += "This is great. Keeping your utilization below 30% is a key factor for a healthy credit score.";
    } else {
      explanation += "This is a bit high. Lenders generally prefer to see utilization below 30%. Focusing on paying down your balance would be beneficial for your credit score.";
    }
    return explanation;
  }

  // 3. Check if last month's balance was paid
  if (q.includes('did i pay my last bill') || q.includes('last statement balance')) {
    if (data.payments_credits >= data.last_statement_balance) {
      return `Yes, it looks like you did. Your payments and credits of $${data.payments_credits.toFixed(2)} covered your last statement balance of $${data.last_statement_balance.toFixed(2)}. Great job!`;
    } else {
      return `It appears you paid $${data.payments_credits.toFixed(2)}, which was less than your last statement balance of $${data.last_statement_balance.toFixed(2)}. The remaining amount was carried over to this statement.`;
    }
  }

  // 4. Suggest ways to save money
  if (q.includes('how can i save') || q.includes('save money')) {
    const topExpenses = data.transactions.filter(tx => tx.amount < 0).sort((a, b) => a.amount - b.amount).slice(0, 2);
    return `A good way to start saving is by looking at your top spending areas. This month, your biggest expenses were:\n\n1. "${topExpenses[0].description}" ($${Math.abs(topExpenses[0].amount).toFixed(2)})\n2. "${topExpenses[1].description}" ($${Math.abs(topExpenses[1].amount).toFixed(2)})\n\nCould you reduce spending in these categories?`;
  }
  
  // 5. Identify spending trends (up or down)
  if (q.includes('spending trend') || q.includes('spending more or less')) {
      const currentSpending = data.total_balance - data.last_statement_balance + data.payments_credits;
      if (currentSpending > data.last_statement_balance) {
          return `Your spending this period seems to be higher than the last. Reviewing your transaction list might help identify where the increase is coming from.`;
      } else {
          return `It looks like your spending was lower this period compared to your previous statement balance. Keep up the great work!`;
      }
  }
  
  // 6. Summarize a specific category (CORRECTED AND IMPROVED)
  if (q.includes('spending on') || q.includes('spend on') || q.includes('summary for')) {
    const categoryMatch = q.match(/(?:on|for)\s+([\w\s&]+)$/);
    if (categoryMatch && categoryMatch[1]) {
      const category = categoryMatch[1].trim();
      const categoryTxs = data.transactions.filter(tx => tx.category && tx.category.toLowerCase().includes(category));
      if (categoryTxs.length > 0) {
        const total = categoryTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        const largestPurchase = categoryTxs.reduce((largest, current) => Math.abs(current.amount) > Math.abs(largest.amount) ? current : largest, { amount: 0, description: 'N/A' });
        return `You had ${categoryTxs.length} transactions in the "${category}" category, totalling $${total.toFixed(2)}. Your largest purchase was for "${largestPurchase.description}".`;
      } else {
        return `I couldn't find any spending for the category "${category}" in this statement.`;
      }
    }
  }

  // --- Fallback Response ---
  return "I'm not quite sure how to answer that. Try asking things like 'How can I improve my profile?', 'What is my credit utilization?', or 'Suggest ways to save money'.";
};

const Chatbot = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! Ask me for financial advice or questions about your statement.", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const newMessages = [...messages, { text, sender: 'user' }];
    setMessages(newMessages);
    setInputValue('');
    setTimeout(() => {
      const botResponse = getAIResponse(text, data);
      setMessages([...newMessages, { text: botResponse, sender: 'bot' }]);
    }, 600);
  };
  
  const handleSuggestionClick = (suggestion) => {
      handleSendMessage(suggestion);
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!data) return null;

  return (
    <>
      {!isOpen && (
        <div className="chat-bubble" onClick={toggleChat}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="white" className="bi bi-chat-dots-fill" viewBox="0 0 16 16">
            <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </div>
      )}

      {isOpen && (
        <div className="chatbot-container floating">
          <div className="chat-header">
            <h3>AI Financial Assistant</h3>
            <button className="close-chat-btn" onClick={toggleChat}>&times;</button>
          </div>
          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}-message`}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="suggestion-chips">
            <button onClick={() => handleSuggestionClick("How can I improve my profile?")}>Improve Profile?</button>
            <button onClick={() => handleSuggestionClick("What is my credit utilization?")}>Credit Utilization?</button>
            <button onClick={() => handleSuggestionClick("How can I save money?")}>Ways to Save?</button>
          </div>
          <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for financial advice..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
