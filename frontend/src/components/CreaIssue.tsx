import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";
import axios from "axios";
import API_BASE_URL from "../config";

function CreaIssue() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [stato] = useState("Todo");
  const [tipo, setTipo] = useState("bug");
  const [priorita, setPriorita] = useState("none");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [idAssegnatario, setIdAssegnatario] = useState<number | null>(null);

  const user = authService.getUser();
  const isAdmin = user?.ruolo === "Amministratore" || user?.role === "admin";

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/utenza/lista`, {
        headers: { Authorization: `Bearer ${authService.getToken()}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Errore caricamento utenti:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const dataToSend = {
        titolo,
        descrizione,
        stato,
        tipo,
        priorita,
        idAssegnatario: idAssegnatario || undefined
      };

      console.log("📤 Creazione issue:", dataToSend);
      const nuovaIssue = await issueService.createIssue(dataToSend);
      console.log("✅ Issue creata:", nuovaIssue);

      if (files.length > 0) {
        console.log(`📎 Upload di ${files.length} allegati...`);
        for (const file of files) {
          try {
            await allegatoService.uploadAllegato(file, nuovaIssue.idIssue);
            console.log(`✅ Allegato caricato: ${file.name}`);
          } catch (uploadErr) {
            console.error(`❌ Errore upload ${file.name}:`, uploadErr);
          }
        }
      }

      setSuccess("Issue creata con successo!");
      setTimeout(() => {
        navigate("/issues");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Errore creazione issue:", err);
      setError(err.response?.data?.message || "Errore nella creazione dell'issue");
    } finally {
      setLoading(false);
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
              Nuova Issue
            </h2>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
              Crea una nuova segnalazione
            </div>
          </div>
        </header>

        <div style={{ padding: "32px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Titolo *
                </label>
                <input
                  type="text"
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  required
                  maxLength={200}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    color: "#4b5563",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", textAlign: "right" }}>
                  {titolo.length}/200
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Descrizione *
                </label>
                <textarea
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  required
                  maxLength={5000}
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontFamily: "inherit",
                    color: "#4b5563",
                    lineHeight: 1.6,
                    resize: "vertical",
                    boxSizing: "border-box",
                    outline: "none"
                  }}
                />
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", textAlign: "right" }}>
                  {descrizione.length}/5000
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Tipo *
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="bug">Bug</option>
                    <option value="features">Feature</option>
                    <option value="question">Question</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Priorità *
                  </label>
                  <select
                    value={priorita}
                    onChange={(e) => setPriorita(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {isAdmin && (
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "8px"
                  }}>
                    Assegna a (facoltativo)
                  </label>
                  <select
                    value={idAssegnatario || ""}
                    onChange={(e) => setIdAssegnatario(e.target.value ? Number(e.target.value) : null)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="">Non assegnare</option>
                    {users.map((u) => (
                      <option key={u.idUtente || u.id} value={u.idUtente || u.id}>
                        {u.nome} {u.cognome} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  Allega file (facoltativo)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#0d9488";
                    e.currentTarget.style.backgroundColor = "#f0fdfa";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    if (e.dataTransfer.files) {
                      const newFiles = Array.from(e.dataTransfer.files);
                      setFiles((prev) => [...prev, ...newFiles]);
                    }
                  }}
                  style={{
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        setFiles((prev) => [...prev, ...newFiles]);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="file-input" style={{ cursor: "pointer", display: "block" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>⬆️</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>
                      Trascina file qui o clicca
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Formati supportati: JPEG, PNG, GIF, WebP - Max 5MB
                    </div>
                  </label>
                </div>
                {files.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                      File selezionati:
                    </div>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          backgroundColor: "#f3f4f6",
                          borderRadius: "6px",
                          marginBottom: "6px",
                          fontSize: "12px"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: "#1f2937" }}>{file.name}</div>
                          <div style={{ color: "#6b7280" }}>{(file.size / 1024).toFixed(2)} KB</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #fca5a5",
                            borderRadius: "4px",
                            cursor: "pointer",
                            color: "#dc2626",
                            fontSize: "16px",
                            lineHeight: "1",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div style={{
                  color: "#dc2626",
                  backgroundColor: "#fee2e2",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  border: "1px solid #fecaca"
                }}>
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div style={{
                  color: "#065f46",
                  backgroundColor: "#d1fae5",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  border: "1px solid #6ee7b7"
                }}>
                  ✅ {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  backgroundColor: loading ? "#9ca3af" : "#0d9488",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? "Creazione in corso..." : "Crea Issue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreaIssue;
