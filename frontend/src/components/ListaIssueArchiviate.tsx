import React, { useState, useEffect } from "react";
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
  dataArchiviazione: string;
  archiviata: boolean;
}


function ListaIssueArchiviate() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statoFilter, setStatoFilter] = useState("Tutti gli stati");
  const [tipoFilter, setTipoFilter] = useState("Tutti i tipi");
  const [prioritaFilter, setPrioritaFilter] = useState("Tutte le priorità");
  const [sortOrder, setSortOrder] = useState("Data (più recente)");


  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    loadIssues();
  }, [navigate]);


  const loadIssues = async () => {
    try {
      setLoading(true);
      const data = await issueService.getAllIssues();
      const archived = data.filter((issue: Issue) => issue.archiviata);
      setIssues(archived);
      setFilteredIssues(archived);
    } catch (error) {
      console.error("Errore caricamento issue archiviate:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    let filtered = issues;

    if (searchTerm) {
      filtered = filtered.filter((issue) =>
        issue.titolo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statoFilter !== "Tutti gli stati") {
      filtered = filtered.filter((issue) => issue.stato === statoFilter);
    }

    if (tipoFilter !== "Tutti i tipi") {
      filtered = filtered.filter((issue) => issue.tipo === tipoFilter);
    }

    if (prioritaFilter !== "Tutte le priorità") {
      filtered = filtered.filter((issue) => issue.priorita === prioritaFilter);
    }

    if (sortOrder === "Data (più recente)") {
      filtered.sort((a, b) => new Date(b.dataArchiviazione).getTime() - new Date(a.dataArchiviazione).getTime());
    } else if (sortOrder === "Data (meno recente)") {
      filtered.sort((a, b) => new Date(a.dataArchiviazione).getTime() - new Date(b.dataArchiviazione).getTime());
    }

    setFilteredIssues(filtered);
  }, [searchTerm, statoFilter, tipoFilter, prioritaFilter, sortOrder, issues]);


  const handleReset = () => {
    setSearchTerm("");
    setStatoFilter("Tutti gli stati");
    setTipoFilter("Tutti i tipi");
    setPrioritaFilter("Tutte le priorità");
    setSortOrder("Data (più recente)");
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT");
  };

  // FIX 2: Controlla se ci sono filtri attivi
  const hasActiveFilters = () => {
    return searchTerm !== "" || 
           statoFilter !== "Tutti gli stati" || 
           tipoFilter !== "Tutti i tipi" || 
           prioritaFilter !== "Tutte le priorità";
  };


  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, padding: "32px" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento issue archiviate...</div>
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
              Issue Archiviate
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
              Visualizza e gestisci tutte le issue archiviate
            </p>
          </div>
          <button
            onClick={() => navigate("/issues")}
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
            ← Torna alla lista
          </button>
        </header>

        <div style={{ flex: 1, padding: "32px" }}>
          {/* FIX 2: Indicatore filtri attivi */}
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
              <span>Mostrando {filteredIssues.length} di {issues.length} issue archiviate</span>
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
                  onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                  onBlur={(e) => (e.target.style.borderColor = searchTerm ? "#0d9488" : "#d1d5db")}
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
                    border: statoFilter !== "Tutti gli stati" ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: statoFilter !== "Tutti gli stati" ? "#f0fdfa" : "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option>Tutti gli stati</option>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
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
                    border: tipoFilter !== "Tutti i tipi" ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: tipoFilter !== "Tutti i tipi" ? "#f0fdfa" : "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option>Tutti i tipi</option>
                  <option>Bug</option>
                  <option>Features</option>
                  <option>Question</option>
                  <option>Documentation</option>
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
                    border: prioritaFilter !== "Tutte le priorità" ? "2px solid #0d9488" : "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: prioritaFilter !== "Tutte le priorità" ? "#f0fdfa" : "#f9fafb",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    paddingRight: "36px",
                  }}
                >
                  <option>Tutte le priorità</option>
                  <option>Nessuna</option>
                  <option>Bassa</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Critica</option>
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
                  <option>Data (più recente)</option>
                  <option>Data (meno recente)</option>
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

          {/* FIX 4: Rimossi emoji dalle tabelle */}
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
                    Data Arch.
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 ? (
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
                      Nessuna issue archiviata
                    </td>
                  </tr>
                ) : (
                  filteredIssues.map((issue) => (
                    <tr
                      key={issue.idIssue}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        transition: "background-color 0.15s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => navigate(`/issues/${issue.idIssue}`, { state: { from: "/issues/archiviate" } })}
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
                            padding: "5px 10px",
                            backgroundColor:
                              issue.stato === "Done"
                                ? "#dcfce7"
                                : issue.stato === "inProgress"
                                ? "#fef08a"
                                : "#f3f4f6",
                            color:
                              issue.stato === "Done"
                                ? "#15803d"
                                : issue.stato === "inProgress"
                                ? "#854d0e"
                                : "#6b7280",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {issue.stato === "inProgress" ? "In corso" : issue.stato}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "inline-block",
                          }}
                        >
                          {issue.tipo}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "5px 10px",
                            backgroundColor:
                              issue.priorita === "critical"
                                ? "#fee2e2"
                                : issue.priorita === "high"
                                ? "#fef3c7"
                                : issue.priorita === "medium"
                                ? "#fef3c7"
                                : "#f3f4f6",
                            color:
                              issue.priorita === "critical"
                                ? "#991b1b"
                                : issue.priorita === "high"
                                ? "#b45309"
                                : issue.priorita === "medium"
                                ? "#b45309"
                                : "#6b7280",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            display: "inline-block",
                            textTransform: "capitalize",
                          }}
                        >
                          {issue.priorita}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "13px",
                          color: "#6b7280",
                          textAlign: "center",
                        }}
                      >
                        {formatDate(issue.dataArchiviazione)}
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


export default ListaIssueArchiviate;