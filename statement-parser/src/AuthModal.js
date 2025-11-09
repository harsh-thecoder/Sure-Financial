import React, { useState } from 'react';

const AuthModal = ({ onLoginSuccess, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("Please enter both a username and password.");
      return;
    }
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
      alert("Username already exists. Please log in or choose another.");
      return;
    }
    users[username] = { password };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', username);
    onLoginSuccess(username);
  };

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
            <p>Create an account to begin building your financial history.</p>
            <form onSubmit={handleCreateAccount}>
              <input type="text" placeholder="Choose a username" value={username} onChange={(e) => setUsername(e.target.value)} />
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
