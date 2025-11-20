import React, { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  // Simula un login riuscito
  setMessage("Login riuscito! (modalità demo)");
  setIsError(false);

  // Simula navigazione verso la home
  setTimeout(() => {
    window.location.href = "/home"; // oppure navigate("/home") con React Router
  }, 500);
};



  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo e Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#0d9488',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            BB
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            BugBoard
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>
            Issue Management System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Inserisci username"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Inserisci password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#0d9488'}
              onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#0d9488',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginBottom: '16px'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0f766e'}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.backgroundColor = '#0d9488'}
          >
            Accedi
          </button>

          {/* Messaggio di feedback */}
          {message && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
              color: isError ? '#991b1b' : '#166534',
              border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`
            }}>
              {message}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#6b7280',
            margin: 0
          }}>
            Non hai un account?{' '}
            <a href="#" style={{
              color: '#0d9488',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Registrati
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;