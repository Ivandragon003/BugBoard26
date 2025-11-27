import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import API_BASE_URL from "../config";
import axios from "axios";
import Sidebar from "./Sidebar";

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
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
    }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "20px",
              color: "#374151"
            }}
          >
            ☰
          </button>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              Profilo Utente
            </h2>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
              Visualizza e gestisci le informazioni del tuo account
            </div>
          </div>
        </header>

        <div style={{ padding: "32px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
          <div style={{ 
            background: "#fff", 
            borderRadius: 12, 
            padding: 32, 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb"
          }}>
            {!edit && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "16px",
                    marginBottom: "24px",
                    paddingBottom: "24px",
                    borderBottom: "1px solid #e5e7eb"
                  }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: "#e0f2f1",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px"
                    }}>
                      👤
                    </div>
                    <div>
                      <div style={{ fontSize: "18px", fontWeight: 600, color: "#1f2937" }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                        Ruolo: <span style={{ 
                          fontWeight: 600, 
                          color: isAdmin ? "#0d9488" : "#6b7280" 
                        }}>
                          {user.ruolo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ 
                      padding: "12px 16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        Email
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937" }}>
                        {user.email}
                      </div>
                    </div>

                    <div style={{ 
                      padding: "12px 16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        Ruolo
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937" }}>
                        {user.ruolo}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setEdit(true)} 
                  style={{ 
                    width: "100%",
                    background: "#0d9488", 
                    color: "#fff", 
                    border: "none",
                    fontWeight: 600, 
                    borderRadius: 8, 
                    padding: "12px 16px",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0f766e"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0d9488"}
                >
                  🔑 Modifica Password
                </button>
              </>
            )}

            {edit && (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "20px" }}>
                  Modifica Profilo
                </h3>

                {/* EMAIL NON MODIFICABILE */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ 
                    display: "block", 
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Email (non modificabile)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    readOnly
                    disabled
                    style={{ 
                      width: "100%", 
                      padding: "10px 14px", 
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                      backgroundColor: "#f9fafb",
                      color: "#6b7280",
                      cursor: "not-allowed"
                    }}
                  />
                  <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                    ℹ️ L'email non può essere modificata
                  </div>
                </div>

                {/* NUOVA PASSWORD */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ 
                    display: "block", 
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Nuova password <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Inserisci la nuova password (min. 6 caratteri)"
                    style={{ 
                      width: "100%", 
                      padding: "10px 14px", 
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* CONFERMA PASSWORD */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ 
                    display: "block", 
                    fontSize: "13px", 
                    fontWeight: 500, 
                    color: "#374151",
                    marginBottom: "6px"
                  }}>
                    Conferma password <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Reinserisci la password"
                    style={{ 
                      width: "100%", 
                      padding: "10px 14px", 
                      border: `1px solid ${form.password && form.confirmPassword && form.password !== form.confirmPassword ? "#ef4444" : "#d1d5db"}`,
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box"
                    }}
                  />
                  {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                    <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      ❌ Le password non coincidono
                    </div>
                  )}
                  {form.password && form.confirmPassword && form.password === form.confirmPassword && (
                    <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      ✅ Le password coincidono
                    </div>
                  )}
                </div>

                {message.text && (
                  <div style={{ 
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginBottom: 16,
                    color: message.type === "success" ? "#16a34a" : "#e11d48",
                    backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                    border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                    fontWeight: 600,
                    fontSize: "14px"
                  }}>
                    {message.text}
                  </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    type="submit" 
                    disabled={!form.password || !form.confirmPassword || form.password !== form.confirmPassword}
                    style={{ 
                      flex: 1,
                      background: (!form.password || !form.confirmPassword || form.password !== form.confirmPassword) ? "#9ca3af" : "#0d9488", 
                      color: "#fff", 
                      border: "none",
                      fontWeight: 600, 
                      borderRadius: 8, 
                      padding: "10px 24px",
                      fontSize: "14px",
                      cursor: (!form.password || !form.confirmPassword || form.password !== form.confirmPassword) ? "not-allowed" : "pointer",
                      opacity: (!form.password || !form.confirmPassword || form.password !== form.confirmPassword) ? 0.6 : 1
                    }}
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
                    style={{ 
                      flex: 1,
                      borderRadius: 8, 
                      background: "#f3f4f6", 
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      fontWeight: 600, 
                      padding: "10px 24px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
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
