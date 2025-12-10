import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import API_BASE_URL from "../config";
import axios from "axios";
import Sidebar from "./Sidebar";
import styles from "./VisualizzaProfilo.module.css";

export default function VisualizzaProfilo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{ email: string; ruolo: string }>({ email: "", ruolo: "" });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });

  useEffect(() => {
    const u = authService.getUser();
    if (u) {
      setUser({ email: u.email, ruolo: u.ruolo });
      setForm({ email: u.email, password: "", confirmPassword: "" });
    }
  }, []);

  const isAdmin = authService.isAdmin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permetti solo la modifica della password e conferma password
    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    
    // Validazione: password non vuota
    if (!form.password.trim()) {
      setMessage({ type: "error", text: "Inserisci una nuova password per modificare il profilo." });
      return;
    }
    
    // Validazione: le password devono coincidere
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Le password non coincidono. Riprova." });
      return;
    }

    // Validazione: lunghezza minima password
    if (form.password.length < 6) {
      setMessage({ type: "error", text: "La password deve essere di almeno 6 caratteri." });
      return;
    }
    
    try {
      // Invia solo la password, l'email rimane invariata
      await axios.put(
        `${API_BASE_URL}/utenza/modifica`,
        { email: user.email, password: form.password },
        { headers: { Authorization: `Bearer ${authService.getToken()}` } }
      );
      setMessage({ type: "success", text: "Password aggiornata con successo!" });
      setEdit(false);
      setForm({ email: user.email, password: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Errore nell'aggiornamento." });
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={styles.menuButton}
          >
            ☰
          </button>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Profilo Utente</h2>
            <div className={styles.subtitle}>
              Visualizza e gestisci le informazioni del tuo account
            </div>
          </div>
        </header>

        <div className={styles.contentWrapper}>
          <div className={styles.card}>
            {!edit && (
              <>
                <div className={styles.viewContent}>
                  <div className={styles.profileHeader}>
                    <div className={styles.avatar}>👤</div>
                    <div className={styles.profileInfo}>
                      <div className={styles.profileEmail}>{user.email}</div>
                      <div className={styles.profileRole}>
                        Ruolo:{" "}
                        <span className={`${styles.roleValue} ${isAdmin ? styles.roleAdmin : ''}`}>
                          {user.ruolo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Email</div>
                      <div className={styles.infoValue}>{user.email}</div>
                    </div>

                    <div className={styles.infoItem}>
                      <div className={styles.infoLabel}>Ruolo</div>
                      <div className={styles.infoValue}>{user.ruolo}</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setEdit(true)} 
                  className={styles.editButton}
                >
                  🔑 Modifica Password
                </button>
              </>
            )}

            {edit && (
              <form onSubmit={handleSubmit}>
                <h3 className={styles.formTitle}>Modifica Profilo</h3>

                {/* EMAIL NON MODIFICABILE */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email (non modificabile)
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={user.email}
                    readOnly
                    disabled
                    className={`${styles.input} ${styles.inputDisabled}`}
                  />
                  <div className={`${styles.helperText} ${styles.helperInfo}`}>
                    ℹ️ L'email non può essere modificata
                  </div>
                </div>

                {/* NUOVA PASSWORD */}
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Nuova password <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Inserisci la nuova password (min. 6 caratteri)"
                    className={styles.input}
                  />
                </div>

                {/* CONFERMA PASSWORD */}
                <div className={styles.formGroupLast}>
                  <label htmlFor="confirmPassword" className={styles.label}>
                    Conferma password <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Reinserisci la password"
                    className={`${styles.input} ${
                      form.password && 
                      form.confirmPassword && 
                      form.password !== form.confirmPassword 
                        ? styles.inputError 
                        : ''
                    }`}
                  />
                  {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <div className={`${styles.helperText} ${styles.helperError}`}>
                      ❌ Le password non coincidono
                    </div>
                  )}
                  {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                    <div className={`${styles.helperText} ${styles.helperSuccess}`}>
                      ✅ Le password coincidono
                    </div>
                  )}
                </div>

                {message.text && (
                  <div className={`${styles.message} ${
                    message.type === "success" ? styles.messageSuccess : styles.messageError
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    disabled={!form.password || !form.confirmPassword || form.password !== form.confirmPassword}
                    className={styles.submitButton}
                  >
                    💾 Salva
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEdit(false);
                      setMessage({ type: "", text: "" });
                      setForm({ email: user.email, password: "", confirmPassword: "" });
                    }} 
                    className={styles.cancelButton}
                  >
                    ❌ Annulla
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
