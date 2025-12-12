import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import axios from "axios";
import { authService } from "../services/authService";
import API_BASE_URL from "../config";
import Sidebar from "./Sidebar";
import styles from "./CreaUtenza.module.css";

// ✅ Tipizzazione
type Ruolo = "Utente" | "Amministratore";

interface FormData {
  nome: string;
  cognome: string;
  password: string;
  ruolo: Ruolo;
}

interface MessageState {
  type: "success" | "error" | "";
  text: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// ✅ Utility per generare password sicure
const generatePassword = (length: number = 12): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
  return Array.from(
    { length }, 
    () => chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
};

// ✅ Utility per normalizzare stringhe (rimuove accenti, spazi e apostrofi)
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/'/g, "")  // Rimuove apostrofi
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// ✅ Componente di accesso negato separato
const AccessDenied: React.FC = () => (
  <div className={styles.accessDeniedContainer}>
    <div className={styles.accessDeniedCard}>
      <div className={styles.accessDeniedIcon}>🚫</div>
      <div className={styles.accessDeniedTitle}>Accesso Negato</div>
      <div className={styles.accessDeniedText}>
        Solo gli amministratori possono creare nuovi utenti!
      </div>
    </div>
  </div>
);

interface Props {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function CreaUtenza({ sidebarOpen, setSidebarOpen }: Props) {
  const navigate = useNavigate();
  
  // ✅ 1️⃣ PRIMA: TUTTI GLI HOOKS IN CIMA
//  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [form, setForm] = useState<FormData>({
    nome: "",
    cognome: "",
    password: generatePassword(),
    ruolo: "Utente"
  });
  const [message, setMessage] = useState<MessageState>({ type: "", text: "" });

  // ✅ Email autogenerata con useMemo
  const generatedEmail = useMemo(() => {
    if (!form.nome || !form.cognome) return "";
    
    const nomeClean = normalizeString(form.nome);
    const cognomeClean = normalizeString(form.cognome);
    
    return `${nomeClean}.${cognomeClean}@bugboard.it`;
  }, [form.nome, form.cognome]);

  // ✅ Validazione nome/cognome (solo lettere, spazi e apostrofi)
  const validateNomeCognome = (value: string): boolean => {
    const pattern = /^[A-Za-zÀ-ÿ\s']+$/;
    return pattern.test(value);
  };

  // ✅ Validazione form
  const isFormValid = generatedEmail && form.password && form.nome && form.cognome;

  // ✅ 2️⃣ POI: CONTROLLO ACCESSO (DOPO TUTTI GLI HOOKS)
  if (!authService.isAdmin()) {
    return <AccessDenied />;
  }

  // ✅ Handler generico per form con validazione real-time
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validazione real-time per nome e cognome
    if ((name === "nome" || name === "cognome") && value !== "") {
      if (!validateNomeCognome(value)) {
        return; // Blocca l'input se contiene caratteri non validi
      }
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Rigenera password
  const handleRegeneratePassword = () => {
    setForm(prev => ({ ...prev, password: generatePassword() }));
  };

  // ✅ Submit con gestione errori tipizzata
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!generatedEmail) {
      setMessage({ 
        type: "error", 
        text: "Nome e cognome sono necessari per generare l'email" 
      });
      return;
    }

    try {
      const dataToSend = {
        nome: form.nome.trim(),
        cognome: form.cognome.trim(),
        email: generatedEmail,
        password: form.password,
        ruolo: form.ruolo
      };

      await axios.post(`${API_BASE_URL}/utenza/crea`, dataToSend, {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      
      setMessage({ type: "success", text: "Utente creato con successo!" });
      
      // ✅ Reset form
      setForm({
        nome: "",
        cognome: "",
        password: generatePassword(),
        ruolo: "Utente"
      });
      
      // ✅ Redirect dopo successo
      setTimeout(() => navigate("/home"), 1500);
      
    } catch (err) {
      // ✅ Gestione errori tipizzata
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ApiErrorResponse;
        const errorMessage = apiError?.message || 
                            apiError?.error || 
                            "Errore nella creazione dell'utente";
        setMessage({ type: "error", text: errorMessage });
      } else if (err instanceof Error) {
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "Errore sconosciuto" });
      }
      
      console.error("Errore creazione utente:", err);
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
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div>
            <h2 className={styles.title}>Crea nuovo utente</h2>
            <div className={styles.subtitle}>
              Aggiungi un nuovo utente al sistema
            </div>
          </div>
        </header>

        <div className={styles.formWrapper}>
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit}>
              {/* Nome */}
              <div className={styles.formGroup}>
                <label htmlFor="nome" className={styles.label}>
                  Nome <span className={styles.required}>*</span>
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Inserisci il nome"
                  autoComplete="given-name"
                  pattern="[A-Za-zÀ-ÿ\s']+"
                  title="Solo lettere, spazi e apostrofi"
                />
                <small className={styles.hint}>
                  Solo lettere, spazi e apostrofi
                </small>
              </div>

              {/* Cognome */}
              <div className={styles.formGroup}>
                <label htmlFor="cognome" className={styles.label}>
                  Cognome <span className={styles.required}>*</span>
                </label>
                <input
                  id="cognome"
                  name="cognome"
                  type="text"
                  value={form.cognome}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Inserisci il cognome"
                  autoComplete="family-name"
                  pattern="[A-Za-zÀ-ÿ\s']+"
                  title="Solo lettere, spazi e apostrofi"
                />
                <small className={styles.hint}>
                  Solo lettere, spazi e apostrofi
                </small>
              </div>

              {/* Email autogenerata */}
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email (autogenerata)
                </label>
                <input
                  id="email"
                  type="text"
                  value={generatedEmail}
                  readOnly
                  disabled
                  placeholder="Inserisci nome e cognome per generare l'email"
                  className={`${styles.input} ${styles.inputDisabled}`}
                />
              </div>

              {/* Password autogenerata */}
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password (autogenerata)
                </label>
                <div className={styles.passwordGroup}>
                  <input
                    id="password"
                    type="text"
                    value={form.password}
                    readOnly
                    className={styles.passwordInput}
                  />
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className={styles.regenerateButton}
                    aria-label="Rigenera password"
                  >
                    🔄 Rigenera
                  </button>
                </div>
                <div className={styles.passwordWarning}>
                  ⚠️ Salva questa password e comunicala all'utente
                </div>
              </div>

              {/* Ruolo */}
              <div className={styles.formGroup}>
                <label htmlFor="ruolo" className={styles.label}>
                  Ruolo <span className={styles.required}>*</span>
                </label>
                <select 
                  id="ruolo"
                  name="ruolo" 
                  value={form.ruolo} 
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="Utente">Utente</option>
                  <option value="Amministratore">Amministratore</option>
                </select>
              </div>

              {/* Messaggi */}
              {message.text && (
                <div 
                  className={`${styles.message} ${
                    message.type === "success" ? styles.messageSuccess : styles.messageError
                  }`}
                  role={message.type === "success" ? "status" : "alert"}
                >
                  <span className={styles.messageIcon}>
                    {message.type === "success" ? "✅" : "⚠️"}
                  </span>
                  <span>{message.text}</span>
                </div>
              )}

              {/* Submit */}
              <button 
                type="submit" 
                disabled={!isFormValid}
                className={styles.submitButton}
              >
                Crea utente
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}