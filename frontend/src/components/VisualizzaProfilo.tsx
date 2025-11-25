import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import API_BASE_URL from "../config";
import axios from "axios";

export default function VisualizzaProfilo() {
  const [user, setUser] = useState<{ email: string; ruolo: string }>({ email: "", ruolo: "" });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<{ type: string; text: string }>({ type: "", text: "" });

  useEffect(() => {
    const u = authService.getUser();
    if (u) {
      setUser({ email: u.email, ruolo: u.ruolo });
      setForm({ email: u.email, password: "" });
    }
  }, []);

  const isAdmin = authService.isAdmin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    try {
      await axios.put(
        `${API_BASE_URL}/utenza/modifica`,
        { email: form.email, password: form.password },
        { headers: { Authorization: `Bearer ${authService.getToken()}` } }
      );
      setMessage({ type: "success", text: "Dati aggiornati con successo!" });
      setEdit(false);
      // aggiorna lo user localmente
      setUser(prev => ({ ...prev, email: form.email }));
      const updatedUser = { ...authService.getUser(), email: form.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setMessage({ type: "error", text: err.response?.data?.message || "Errore nell'aggiornamento." });
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "64px auto", background: "#fff", borderRadius: 12, padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Profilo utente</h2>
      <div style={{ marginBottom: 20 }}>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Ruolo:</strong> {user.ruolo}</div>
      </div>

      {isAdmin && !edit && (
        <button onClick={() => setEdit(true)} style={{ marginBottom: 20, background: "#0d9488", color: "#fff", fontWeight: 600, borderRadius: 8, padding: "8px 16px" }}>
          Modifica dati
        </button>
      )}

      {edit && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Nuova email:</label>
            <input
              type="email"
              name="email"
              value={form.email}
              required
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Nuova password: (opzionale)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>
          {message.text && (
            <div style={{ color: message.type === "success" ? "#16a34a" : "#e11d48", marginBottom: 12, fontWeight: 600 }}>
              {message.text}
            </div>
          )}
          <button type="submit" style={{ background: "#0d9488", color: "#fff", fontWeight: 600, borderRadius: 8, padding: "8px 24px", marginRight: 10 }}>
            Salva
          </button>
          <button type="button" onClick={() => setEdit(false)} style={{ borderRadius: 8, background: "#eee", fontWeight: 600, padding: "8px 24px" }}>
            Annulla
          </button>
        </form>
      )}
    </div>
  );
}
