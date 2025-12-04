import React, { useState } from "react";
import { authService } from "../services/authService";
import axios from "axios";
import API_BASE_URL from "../config";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function CreaUtenza() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const [form, setForm] = useState({
    nome: "",
    cognome: "",
    password: generatePassword(),
    ruolo: "Utente"
  });
  
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  if (!authService.isAdmin()) {
    return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        minHeight: "100vh",
        padding: 32, 
        textAlign: "center", 
        backgroundColor: "#f5f7fa"
      }}>
        <div style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          maxWidth: "500px"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚫</div>
          <div style={{ color: "#e11d48", fontWeight: 600, fontSize: "18px", marginBottom: "8px" }}>
            Accesso Negato
          </div>
          <div style={{ color: "#6b7280", fontSize: "14px" }}>
            Solo gli amministratori possono creare un nuovo utente!
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "nome" || name === "cognome") {
      const nome = name === "nome" ? value : form.nome;
      const cognome = name === "cognome" ? value : form.cognome;
      if (nome && cognome) {
        const email = `${nome.toLowerCase()}.${cognome.toLowerCase()}@bugboard.it`;
        setGeneratedEmail(email);
      } else {
        setGeneratedEmail("");
      }
    }
  };

  const handleRegeneratePassword = () => {
    const newPassword = generatePassword();
    setForm(prev => ({ ...prev, password: newPassword }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!generatedEmail) {
      setMessage({ type: "error", text: "Nome e cognome sono necessari per generare l'email" });
      return;
    }

    try {
      const dataToSend = {
        nome: form.nome,
        cognome: form.cognome,
        email: generatedEmail,
        password: form.password,
        ruolo: form.ruolo
      };

      await axios.post(`${API_BASE_URL}/utenza/crea`, dataToSend, {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      
      setMessage({ type: "success", text: "Utente creato con successo!" });
      
      setForm({
        nome: "",
        cognome: "",
        password: generatePassword(),
        ruolo: "Utente"
      });
      setGeneratedEmail("");
      
      setTimeout(() => navigate("/home"), 1500);
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          "Errore nella creazione dell'utente";
      
      setMessage({
        type: "error",
        text: errorMessage
      });
      
      console.error("Errore completo:", err.response?.data);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
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
              Crea nuovo utente
            </h2>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
              Aggiungi un nuovo utente al sistema
            </div>
          </div>
        </header>

        <div style={{ padding: "32px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  Nome <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  name="nome"
                  type="text"
                  value={form.nome}
                  required
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  Cognome <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  name="cognome"
                  type="text"
                  value={form.cognome}
                  required
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  Email (autogenerata)
                </label>
                <input
                  type="text"
                  value={generatedEmail}
                  readOnly
                  disabled
                  placeholder="Inserisci nome e cognome per generare l'email"
                  style={{ 
                    width: "100%", 
                    padding: 10, 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 6, 
                    fontSize: 14,
                    backgroundColor: "#f9fafb",
                    color: "#374151",
                    cursor: "not-allowed"
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  Password (autogenerata)
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={form.password}
                    readOnly
                    style={{ 
                      flex: 1,
                      padding: "10px 12px", 
                      border: "1px solid #0d9488", 
                      borderRadius: 6, 
                      fontSize: 14,
                      backgroundColor: "#f0fdfa",
                      color: "#0d9488",
                      fontWeight: 600,
                      fontFamily: "monospace"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#0d9488",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    🔄 Rigenera
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  ⚠️ Salva questa password e comunicala all'utente
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
                  Ruolo <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select 
                  name="ruolo" 
                  value={form.ruolo} 
                  onChange={handleChange} 
                  style={{ width: "100%", padding: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 }}
                >
                  <option value="Utente">Utente</option>
                  <option value="Amministratore">Amministratore</option>
                </select>
              </div>

              {message.text && (
                <div style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  borderRadius: 8,
                  color: message.type === "success" ? "#16a34a" : "#dc2626",
                  backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`,
                  fontWeight: 600,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span style={{ fontSize: 18 }}>
                    {message.type === "success" ? "✅" : "⚠️"}
                  </span>
                  <span>{message.text}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={!generatedEmail || !form.password}
                style={{ 
                  width: "100%", 
                  padding: "10px 20px", 
                  backgroundColor: (!generatedEmail || !form.password) ? "#9ca3af" : "#0d9488", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 8, 
                  fontWeight: 600, 
                  cursor: (!generatedEmail || !form.password) ? "not-allowed" : "pointer", 
                  fontSize: 14,
                  opacity: (!generatedEmail || !form.password) ? 0.6 : 1
                }}
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
