import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";

interface Issue {
  idIssue: number;
  titolo: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  dataUltimaModifica: string;
  archiviata: boolean;
}

function ListaIssue() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statoFilter, setStatoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [prioritaFilter, setPrioritaFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("data_recente");

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  

 const loadFilteredIssues = useCallback(async () => {
  try {
    setLoading(true);
    
    const params: any = {
      archiviata: false,
      ordinamento: sortOrder
    };

    if (statoFilter) params.stato = statoFilter;
    if (tipoFilter) params.tipo = tipoFilter;
    if (prioritaFilter) params.priorita = prioritaFilter;
    if (searchTerm) params.ricerca = searchTerm;

    const data = await issueService.filterIssuesAdvanced(params);
    setIssues(data);
  } catch (error) {
    console.error("Errore caricamento issue:", error);
    setIssues([]);
  } finally {
    setLoading(false);
  }
}, [searchTerm, statoFilter, tipoFilter, prioritaFilter, sortOrder]);

  const handleReset = () => {
    setSearchTerm("");
    setStatoFilter("");
    setTipoFilter("");
    setPrioritaFilter("");
    setSortOrder("data_recente");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT");
  };

 useEffect(() => {
  loadFilteredIssues();
}, [loadFilteredIssues]);

  const hasActiveFilters = () => {
    return searchTerm !== "" || 
           statoFilter !== "" || 
           tipoFilter !== "" || 
           prioritaFilter !== "";
  };

  // Stili come Home.tsx
  const getStatoStyle = (stato: string) => {
    switch (stato.toLowerCase()) {
      case "todo":
        return { backgroundColor: "#e5e7eb", color: "#374151" };
      case "inprogress":
      case "in_progress":
        return { backgroundColor: "#fed7aa", color: "#9a3412" };
      case "done":
        return { backgroundColor: "#86efac", color: "#166534" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const getTipoStyle = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "documentation":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "feature":
      case "features":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "bug":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "question":
        return { backgroundColor: "#e9d5ff", color: "#6b21a8" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const getPrioritaStyle = (priorita: string) => {
    switch (priorita.toLowerCase()) {
      case "critical":
        return { backgroundColor: "#fecaca", color: "#7f1d1d" };
      case "high":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "medium":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "low":
        return { backgroundColor: "#f3f4f6", color: "#374151" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const formatStato = (stato: string) => {
    if (stato === "inProgress" || stato === "in_progress") return "In Progress";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
  };

  if (loading && issues.length === 0) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, padding: "32px" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento issue...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            padding: "20px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1f2937", margin: 0 }}>
              Issue
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Visualizza e gestisci tutte le tue issue
            </p>
          </div>
          <button
            onClick={() => navigate("/issues/nuova")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#0d9488",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ➕ Nuova Issue
          </button>
        </header>

        <div style={{ flex: 1, padding: "32px" }}>
          {hasActiveFilters() && (
            <div style={{
              backgroundColor: "#d1fae5",
              border: "1px solid #6ee7b7",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#065f46"
            }}>
              <span style={{ fontSize: "16px" }}>🔍</span>
              <strong>Filtri attivi:</strong>
              <span>Mostrando {issues.length} issue{loading && " (aggiornamento...)"}</span>
            </div>
          )}

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1.5fr 1.5fr 1fr auto", gap: "16px", alignItems: "end" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                  🔍 Cerca issue
                </label>
                <input
                  type="text"
                  placeholder="Scrivi il titolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: searchTerm ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: searchTerm ? "#f0fdfa" : "#f9fafb",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                  onBlur={(e) => e.target.style.borderColor = searchTerm ? "#0d9488" : "#d1d5db"}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                  Stato
                </label>
                <select
                  value={statoFilter}
                  onChange={(e) => setStatoFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: statoFilter ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: statoFilter ? "#f0fdfa" : "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option value="">Tutti gli stati</option>
                  <option value="Todo">Todo</option>
                  <option value="inProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                  Tipo
                </label>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: tipoFilter ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: tipoFilter ? "#f0fdfa" : "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option value="">Tutti i tipi</option>
                  <option value="bug">Bug</option>
                  <option value="features">Features</option>
                  <option value="question">Question</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                  Priorità
                </label>
                <select
                  value={prioritaFilter}
                  onChange={(e) => setPrioritaFilter(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: prioritaFilter ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: prioritaFilter ? "#f0fdfa" : "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option value="">Tutte le priorità</option>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>
                  Ordina
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option value="data_recente">Data (più recente)</option>
                  <option value="data_vecchio">Data (più vecchio)</option>
                  <option value="titolo_az">Titolo (A-Z)</option>
                  <option value="titolo_za">Titolo (Z-A)</option>
                  <option value="priorita_alta">Priorità (alta-bassa)</option>
                  <option value="priorita_bassa">Priorità (bassa-alta)</option>
                </select>
              </div>

              <button
                onClick={handleReset}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "2px solid #d1d5db",
                  }}
                >
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Titolo
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Stato
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Tipo
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Priorità
                  </th>
                  <th
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#374151",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Data Creazione
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && issues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px 16px",
                        textAlign: "center",
                        color: "#6b7280",
                        fontSize: "15px",
                      }}
                    >
                      Caricamento...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "48px 16px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: "15px",
                      }}
                    >
                      Nessuna issue trovata
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue.idIssue}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        transition: "background-color 0.15s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => navigate(`/issues/${issue.idIssue}`, { state: { from: "/issues" } })}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#0d9488",
                          cursor: "pointer",
                        }}
                      >
                        {issue.titolo}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 500,
                            display: "inline-block",
                            ...getStatoStyle(issue.stato)
                          }}
                        >
                          {formatStato(issue.stato)}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 500,
                            display: "inline-block",
                            ...getTipoStyle(issue.tipo)
                          }}
                        >
                          {issue.tipo}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 500,
                            textTransform: "lowercase",
                            display: "inline-block",
                            ...getPrioritaStyle(issue.priorita)
                          }}
                        >
                          {issue.priorita}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          color: "#6b7280",
                          textAlign: "center",
                        }}
                      >
                        {formatDate(issue.dataCreazione)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListaIssue;