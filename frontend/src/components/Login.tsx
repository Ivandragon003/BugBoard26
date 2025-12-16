import React, { useState } from 'react';
import { authService } from '../services/authService';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
  const validateForm = (): string | null => {
    if (!email.trim()) return 'Email richiesta';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Formato email non valido';
    }
    if (!password) return 'Password richiesta';
    if (password.length < 6) return 'Password troppo corta (min 6 caratteri)';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

   
    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setIsError(true);
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password);
      setMessage('Login riuscito!');
      setIsError(false);
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);
    } catch (error: any) {
      console.error('Errore login:', error);
      
    
      let errorMsg = 'Errore imprevisto';
      
      if (error.response) {
       
        const backendMessage = error.response.data?.message;
        const statusCode = error.response.status;
        
        if (backendMessage === 'Account disattivato') {
          errorMsg = '⚠️ Account disattivato. Contatta un amministratore.';
        } else if (backendMessage) {
          errorMsg = backendMessage;
        } else if (statusCode === 401) {
          errorMsg = 'Credenziali non valide';
        } else if (statusCode === 500) {
          errorMsg = 'Errore del server. Riprova più tardi.';
        } else if (statusCode >= 400 && statusCode < 500) {
          errorMsg = 'Richiesta non valida';
        }
      } else if (error.request) {

        errorMsg = '🔌 Errore di connessione. Verifica la rete.';
      }
      
      setMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>BB</div>
          <h1 className={styles.title}>BugBoard</h1>
          <p className={styles.subtitle}>Issue Management System</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci email"
              required
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroupLast}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ''}`}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>

          {message && (
            <div
              className={`${styles.message} ${isError ? styles.messageError : styles.messageSuccess}`}
              role={isError ? 'alert' : 'status'}
            >
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;