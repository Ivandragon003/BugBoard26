import React, { useState } from 'react';
import { authService } from '../services/authService';

function RecuperaPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailInviata, setEmailInviata] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      await authService.recuperaPassword(email);
      setEmailInviata(true);
    } catch (error: unknown) {
      console.error('Errore recupero password:', error);
      const err = error as { response?: { data?: { message?: string }; status?: number } };
      
      let errorMsg = 'Errore durante il recupero password';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.status === 404) {
        errorMsg = 'Email non trovata';
      } else if (err.response?.status === 500) {
        errorMsg = 'Errore del server. Riprova più tardi.';
      } else if (!navigator.onLine) {
        errorMsg = 'Nessuna connessione internet';
      }
      
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTornaAlLogin = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
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
            🔑
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
            Recupera Password
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Inserisci la tua email per ricevere una nuova password temporanea
          </p>
        </div>

        {!emailInviata ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
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
                placeholder="Inserisci la tua email"
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
              {isLoading ? 'Invio in corso...' : 'Invia email di recupero'}
            </button>

            {message && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
                color: isError ? '#991b1b' : '#166534',
                border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
                marginBottom: '16px'
              }}>
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={handleTornaAlLogin}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#0d9488',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid #0d9488',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Torna al login
            </button>
          </form>
        ) : (
          <div>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Email inviata con successo!</p>
              <p style={{ margin: 0, fontSize: '13px' }}>
                Controlla la tua casella di posta per la password temporanea.
              </p>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>🧪</div>
              <strong style={{ display: 'block', marginBottom: '8px', textAlign: 'center' }}>
                Ambiente di Test
              </strong>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', textAlign: 'center' }}>
                Questa applicazione utilizza Mailtrap per l'invio delle email in modalità test.
              </p>
              <a
                href="https://mailtrap.io/inboxes/3225695"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '10px 20px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                📧 Visualizza email su Mailtrap →
              </a>
            </div>

            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
              marginBottom: '24px'
            }}>
              <strong>💡 Suggerimento:</strong> Ti consigliamo di cambiare la password temporanea dopo il primo accesso.
            </div>

            <button
              type="button"
              onClick={handleTornaAlLogin}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: '#0d9488',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Torna al login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecuperaPassword;