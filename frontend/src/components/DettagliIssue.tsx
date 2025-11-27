import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Mock services (sostituisci con i tuoi veri servizi)
const mockAuthService = {
  getUser: () => ({ idUtente: 1, nome: "Mario", cognome: "Rossi", ruolo: "Amministratore" }),
  isAdmin: () => true
};

const mockIssueService = {
  getIssueById: async (id) => ({
    idIssue: id,
    titolo: "Bug nel login",
    descrizione: "Gli utenti non riescono ad accedere",
    stato: "inProgress",
    tipo: "bug",
    priorita: "high",
    dataCreazione: "2025-01-15T10:30:00",
    dataUltimaModifica: "2025-01-20T14:45:00",
    dataRisoluzione: null,
    archiviata: false,
    dataArchiviazione: null,
    creatore: { idUtente: 2, nome: "Luigi", cognome: "Verdi", email: "luigi@example.com" },
    archiviatore: null
  }),
  updateIssue: async (id, data) => ({ success: true }),
  archiveIssue: async (id, userId) => ({ success: true }),
  unarchiveIssue: async (id) => ({ success: true }),
  deleteIssue: async (id) => ({ success: true })
};

function DettagliIssue() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState("");
  
  const [titolo, setTitolo] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [stato, setStato] = useState("");
  const [tipo, setTipo] = useState("");
  const [priorita, setPriorita] = useState("");
  
  const user = mockAuthService.getUser();
  const isAdmin = mockAuthService.isAdmin();

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const data = await mockIssueService.getIssueById(Number(id));
      setIssue(data);
      setTitolo(data.titolo);
      setDescrizione(data.descrizione);
      setStato(data.stato);
      setTipo(data.tipo);
      setPriorita(data.priorita);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Errore nel caricamento dell'issue");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await mockIssueService.updateIssue(Number(id), {
        titolo,
        descrizione,
        stato,
        tipo,
        priorita
      });
      await loadIssue();
      setEditMode(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Errore nel salvataggio");
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Sei sicuro di voler archiviare questa issue?")) return;
    try {
      await mockIssueService.archiveIssue(Number(id), user.idUtente);
      await loadIssue();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Errore nell'archiviazione");
    }
  };

  const handleUnarchive = async () => {
    if (!window.confirm("Sei sicuro di voler disarchiviare questa issue?")) return;
    try {
      await mockIssueService.unarchiveIssue(Number(id));
      await loadIssue();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Errore nella disarchiviazione");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questa issue?")) return;
    try {
      await mockIssueService.deleteIssue(Number(id));
      navigate("/issues");
    } catch (err) {
      setError(err.response?.data?.message || "Errore nell'eliminazione");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatoLabel = (s) => {
    if (s === "Todo") return "To Do";
    if (s === "inProgress") return "In Progress";
    if (s === "Done") return "Done";
    return s;
  };

  const getNextStato = (currentStato) => {
    if (currentStato === "Todo") return "inProgress";
    if (currentStato === "inProgress") return "Done";
    return currentStato;
  };

  const canChangeStato = () => {
    return stato !== "Done" && !issue?.archiviata;
  };

  const handleAdvanceStato = () => {
    if (canChangeStato()) {
      setStato(getNextStato(stato));
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento...</div>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#dc2626" }}>Issue non trovata</div>
        </div>
      </div>
    );
  }

  const isArchived = issue.archiviata;
  const canEdit = !isArchived;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => navigate("/issues")}
              style={{
                padding: "8px 12px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#374151"
              }}
            >
              ← Torna alla lista
            </button>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Dettagli Issue
              </h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                Visualizza e modifica i dettagli dell'issue
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {canEdit && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#0d9488",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                ✏️ Modifica
              </button>
            )}
            
            {isAdmin && !isArchived && (
              <button
                onClick={handleArchive}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                📦 Archivia
              </button>
            )}
            
            {isAdmin && isArchived && (
              <button
                onClick={handleUnarchive}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                📤 Disarchivia
              </button>
            )}
            
            {isAdmin && (
              <button
                onClick={handleDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                🗑️ Elimina
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          {error && (
            <div style={{
              color: "#dc2626",
              backgroundColor: "#fee2e2",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
              border: "1px solid #fecaca"
            }}>
              {error}
            </div>
          )}

          {isArchived && (
            <div style={{
              color: "#92400e",
              backgroundColor: "#fef3c7",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px",
              fontSize: "14px",
              border: "1px solid #fde68a"
            }}>
              ⚠️ Questa issue è archiviata e non può essere modificata
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            {/* Colonna Sinistra */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              {/* Titolo */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Titolo *
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={titolo}
                    onChange={(e) => setTitolo(e.target.value)}
                    maxLength={200}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px"
                    }}
                  />
                ) : (
                  <div style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937" }}>
                    {issue.titolo}
                  </div>
                )}
                {editMode && (
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", textAlign: "right" }}>
                    {titolo.length}/200
                  </div>
                )}
              </div>

              {/* Descrizione */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Descrizione *
                </label>
                {editMode ? (
                  <>
                    <textarea
                      value={descrizione}
                      onChange={(e) => setDescrizione(e.target.value)}
                      maxLength={5000}
                      rows={8}
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        resize: "vertical"
                      }}
                    />
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px", textAlign: "right" }}>
                      {descrizione.length}/5000
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: "15px", color: "#4b5563", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {issue.descrizione}
                  </div>
                )}
              </div>

              {/* Pulsanti Modifica */}
              {editMode && (
                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#0d9488",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    💾 Salva Modifiche
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setTitolo(issue.titolo);
                      setDescrizione(issue.descrizione);
                      setStato(issue.stato);
                      setTipo(issue.tipo);
                      setPriorita(issue.priorita);
                    }}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    ✖ Annulla
                  </button>
                </div>
              )}
            </div>

            {/* Colonna Destra */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              height: "fit-content"
            }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", marginBottom: "20px" }}>
                Informazioni
              </h3>

              {/* Stato */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                  Stato
                </label>
                {editMode && canChangeStato() ? (
                  <button
                    onClick={handleAdvanceStato}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      border: "1px solid #93c5fd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    {getStatoLabel(stato)} → {getStatoLabel(getNextStato(stato))}
                  </button>
                ) : (
                  <span style={{
                    padding: "6px 12px",
                    backgroundColor: stato === "Done" ? "#d1fae5" : stato === "inProgress" ? "#fef3c7" : "#e5e7eb",
                    color: stato === "Done" ? "#065f46" : stato === "inProgress" ? "#92400e" : "#374151",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "inline-block"
                  }}>
                    {getStatoLabel(stato)}
                  </span>
                )}
              </div>

              {/* Tipo */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                  Tipo
                </label>
                {editMode ? (
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="bug">Bug</option>
                    <option value="features">Feature</option>
                    <option value="question">Question</option>
                    <option value="documentation">Documentation</option>
                  </select>
                ) : (
                  <span style={{
                    padding: "6px 12px",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "inline-block"
                  }}>
                    {tipo}
                  </span>
                )}
              </div>

              {/* Priorità */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                  Priorità
                </label>
                {editMode ? (
                  <select
                    value={priorita}
                    onChange={(e) => setPriorita(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                ) : (
                  <span style={{
                    padding: "6px 12px",
                    backgroundColor: priorita === "critical" ? "#fecaca" : priorita === "high" ? "#fed7aa" : priorita === "medium" ? "#fef3c7" : "#f3f4f6",
                    color: priorita === "critical" ? "#7f1d1d" : priorita === "high" ? "#9a3412" : priorita === "medium" ? "#92400e" : "#374151",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    display: "inline-block",
                    textTransform: "capitalize"
                  }}>
                    {priorita}
                  </span>
                )}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

              {/* ID Issue */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                  ID Issue
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937", fontFamily: "monospace" }}>
                  #{issue.idIssue}
                </div>
              </div>

              {/* Creatore */}
              {issue.creatore && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                    Creato da
                  </div>
                  <div style={{ fontSize: "14px", color: "#1f2937" }}>
                    {issue.creatore.nome} {issue.creatore.cognome}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {issue.creatore.email}
                  </div>
                </div>
              )}

              {/* Data Creazione */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                  Data Creazione
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937" }}>
                  {formatDate(issue.dataCreazione)}
                </div>
              </div>

              {/* Data Ultima Modifica */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                  Ultima Modifica
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937" }}>
                  {formatDate(issue.dataUltimaModifica)}
                </div>
              </div>

              {/* Data Risoluzione */}
              {issue.dataRisoluzione && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                    Data Risoluzione
                  </div>
                  <div style={{ fontSize: "14px", color: "#10b981" }}>
                    {formatDate(issue.dataRisoluzione)}
                  </div>
                </div>
              )}

              {/* Dati Archiviazione - SOLO SE ARCHIVIATA */}
              {isArchived && (
                <>
                  <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />
                  
                  {issue.dataArchiviazione && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                        Data Archiviazione
                      </div>
                      <div style={{ fontSize: "14px", color: "#92400e" }}>
                        {formatDate(issue.dataArchiviazione)}
                      </div>
                    </div>
                  )}

                  {issue.archiviatore && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#6b7280", marginBottom: "4px" }}>
                        Archiviato da
                      </div>
                      <div style={{ fontSize: "14px", color: "#92400e" }}>
                        {issue.archiviatore.nome} {issue.archiviatore.cognome}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {issue.archiviatore.email}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DettagliIssue;