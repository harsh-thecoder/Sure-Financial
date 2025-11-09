import React, { useState } from 'react';

const AuthModal = ({ onLoginSuccess, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // State for the new email field

  // Upgraded function to handle account creation with email
  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !email.trim()) {
      alert("Please fill in all fields: username, email, and password.");
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
      alert("Username already exists. Please log in or choose another.");
      return;
    }
    // Save the email along with the password
    users[username] = { password, email };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', username);
    onLoginSuccess(username);
  };

  // Login handler remains the same
  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username] && users[username].password === password) {
      localStorage.setItem('currentUser', username);
      onLoginSuccess(username);
    } else {
      alert("Invalid username or password.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <button className="close-btn" onClick={onClose}>&times;</button>
        {isLoginView ? (
          <>
            <h2>Login to Save</h2>
            <p>Log in to save this statement to your profile.</p>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit">Login & Save</button>
            </form>
            <p className="auth-toggle">
              No account? <button onClick={() => setIsLoginView(false)}>Create one</button>
            </p>
          </>
        ) : (
          <>
            <h2>Create Account to Save</h2>
            <p>Create an account to save statements and set reminders.</p>
            <form onSubmit={handleCreateAccount}>
              <input type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
              {/* New Email Input Field */}
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit">Create Account & Save</button>
            </form>
            <p className="auth-toggle">
              Already have an account? <button onClick={() => setIsLoginView(true)}>Log in</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
