import React, { useState } from 'react';
import { authService } from '../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      setMessage('Login riuscito!');
      setIsError(false);
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Credenziali non valide o errore di rete';
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '420px'
      }}>
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
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            BugBoard
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Issue Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Inserisci email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
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
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: isLoading ? '#9ca3af' : '#0d9488',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>

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

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Password dimenticata?{' '}
            <a href="/recupera-password" style={{ color: '#0d9488', textDecoration: 'none', fontWeight: '500' }}>
              Recuperala
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;