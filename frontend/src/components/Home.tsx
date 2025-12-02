import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { issueService } from "../services/issueService";
import Sidebar from "./Sidebar";
import { authService } from "../services/authService";

interface Issue {
  idIssue: number;
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  archiviata?: boolean;
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]); // Per le statistiche totali
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("");

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Carica issues filtrate quando cambia il filtro
  useEffect(() => {
    loadFilteredIssues();
  }, [filterType]);

  // Carica anche tutte le issue per le statistiche totali
  useEffect(() => {
    loadAllIssuesForStats();
  }, []);

  const loadFilteredIssues = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        archiviata: false,
        ordinamento: "data_recente"
      };

      // Aggiungi filtro stato se selezionato
      if (filterType && filterType !== "all") {
        params.stato = filterType;
      }

      const data = await issueService.filterIssuesAdvanced(params);
      setIssues(data);
      setError("");
    } catch (err: any) {
      console.error("Errore caricamento issues:", err);
      setError(err.response?.data?.message || "Errore nel caricamento delle issue");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllIssuesForStats = async () => {
    try {
      const data = await issueService.filterIssuesAdvanced({
        archiviata: false,
        ordinamento: "data_recente"
      });
      setAllIssues(data);
    } catch (err: any) {
      console.error("Errore caricamento statistiche:", err);
    }
  };

  // Calcola statistiche sempre su TUTTE le issue (non filtrate)
  const issueStats = {
    totali: allIssues.length,
    todo: allIssues.filter(i => i.stato.toLowerCase() === 'todo').length,
    inProgress: allIssues.filter(i => {
      const stato = i.stato.toLowerCase();
      return stato === 'inprogress' || stato === 'in_progress';
    }).length,
    done: allIssues.filter(i => i.stato.toLowerCase() === 'done').length,
  };

  const ListIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 12H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 18H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 6H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M3 12H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M3 18H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );

  const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2"/>
      <path d="M12 7V12L15 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const TrendUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H21V13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2"/>
      <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
      <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatStato = (stato: string) => {
    if (stato === "inProgress" || stato === "in_progress") return "In Progress";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
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
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                BugBoard Dashboard
              </h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                Issue Management System
              </div>
            </div>
          </div>
          <div 
            onClick={() => navigate('/profilo')}
            style={{ 
              width: "36px",
              height: "36px",
              backgroundColor: "#e0f2f1",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            <UserIcon />
          </div>
        </header>

        <div style={{ padding: "32px" }}>
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

          <div style={{ 
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <label style={{ 
                  fontSize: "12px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Filtra per stato
                </label>
                {filterType && filterType !== "all" && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#0d9488",
                    backgroundColor: "#d1fae5",
                    padding: "2px 8px",
                    borderRadius: "10px"
                  }}>
                    Filtro attivo
                  </span>
                )}
              </div>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: "10px 40px 10px 16px",
                  border: filterType && filterType !== "all" ? "2px solid #0d9488" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#374151",
                  backgroundColor: filterType && filterType !== "all" ? "#f0fdfa" : "white",
                  cursor: "pointer",
                  outline: "none",
                  minWidth: "200px",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center"
                }}
              >
                <option value="">Tutte le issue</option>
                <option value="Todo">Fare</option>
                <option value="inProgress">In corso</option>
                <option value="Done">Fatto</option>
              </select>
            </div>

            <button
              onClick={() => navigate('/issues/nuova')}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0d9488",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0f766e";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#0d9488";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
              }}
            >
              <span style={{ fontSize: "18px" }}>➕</span> Nuova Issue
            </button>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "32px",
            minHeight: "120px"
          }}>
            {loading && allIssues.length === 0 ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <div style={{ 
                      width: "24px", 
                      height: "24px", 
                      border: "3px solid #f3f4f6",
                      borderTop: "3px solid #0d9488",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }} />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                      Issue Totali
                    </div>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#dbeafe",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <ListIcon />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {issueStats.totali}
                  </div>
                </div>

                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                      Problema da fare
                    </div>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <ClockIcon />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {issueStats.todo}
                  </div>
                </div>

                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                      Problema in corso
                    </div>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <TrendUpIcon />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {issueStats.inProgress}
                  </div>
                </div>

                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "12px"
                  }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                      Problema risolto
                    </div>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#d1fae5",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <CheckCircleIcon />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {issueStats.done}
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              padding: "20px 24px", 
              borderBottom: "2px solid #e5e7eb", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center" 
            }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Issue Recenti
              </h2>
              <button
                onClick={() => navigate('/issues')}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "#0d9488",
                  border: "1px solid #0d9488",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                Visualizza Tutte
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                Caricamento in corso...
              </div>
            ) : issues.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                {filterType && filterType !== "all" 
                  ? "Nessuna issue trovata con questo filtro."
                  : "Nessuna issue trovata. Crea la tua prima issue!"}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb", borderBottom: "2px solid #d1d5db" }}>
                      <th style={{ 
                        padding: "14px 24px", 
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Titolo
                      </th>
                      <th style={{ 
                        padding: "14px 24px", 
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Stato
                      </th>
                      <th style={{ 
                        padding: "14px 24px", 
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Tipo
                      </th>
                      <th style={{ 
                        padding: "14px 24px", 
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Priorità
                      </th>
                      <th style={{ 
                        padding: "14px 24px", 
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}>
                        Data Creazione
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.slice(0, 5).map((issue) => (
                      <tr 
                        key={issue.idIssue} 
                        style={{ 
                          borderBottom: "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        onClick={() => navigate(`/issues/${issue.idIssue}`, { state: { from: "/home" } })}
                      >
                        <td style={{ 
                          padding: "14px 24px", 
                          color: "#0d9488",
                          fontWeight: 500,
                          fontSize: "14px"
                        }}>
                          {issue.titolo}
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ 
                            padding: "4px 12px", 
                            borderRadius: "12px", 
                            fontWeight: 500,
                            fontSize: "13px",
                            ...getStatoStyle(issue.stato) 
                          }}>
                            {formatStato(issue.stato)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ 
                            padding: "4px 12px", 
                            borderRadius: "12px", 
                            fontWeight: 500,
                            fontSize: "13px",
                            ...getTipoStyle(issue.tipo) 
                          }}>
                            {issue.tipo}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ 
                            padding: "4px 12px", 
                            borderRadius: "12px", 
                            fontWeight: 500,
                            fontSize: "13px",
                            textTransform: "lowercase",
                            ...getPrioritaStyle(issue.priorita) 
                          }}>
                            {issue.priorita}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px", color: "#6b7280", fontSize: "14px" }}>
                          {formatDate(issue.dataCreazione)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Home;