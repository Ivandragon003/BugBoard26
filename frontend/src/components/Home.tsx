import React, { useState, useEffect } from "react";
import { issueService } from "../services/issueService";

interface Issue {
  idIssue: number;
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  dataUltimaModifica: string;
}

function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [hoveredItem, setHoveredItem] = useState<string>("");

  useEffect(() => {
    const loadIssues = async () => {
      try {
        setLoading(true);
        const data = await issueService.getAllIssues();
        setIssues(data);
        setError("");
      } catch (err: any) {
        console.error("Errore caricamento issues:", err);
        setError(err.response?.data?.message || "Errore nel caricamento delle issue");
      } finally {
        setLoading(false);
      }
    };
    loadIssues();
  }, []);

  const issueStats = {
    totali: issues.length,
    todo: issues.filter(i => i.stato.toLowerCase() === 'todo').length,
    inProgress: issues.filter(i => i.stato.toLowerCase() === 'inprogress' || i.stato.toLowerCase() === 'in_progress').length,
    done: issues.filter(i => i.stato.toLowerCase() === 'done').length,
  };

  // Componenti SVG Icons
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

  const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="15" rx="2" stroke="#6B7280" strokeWidth="2"/>
      <path d="M3 10H21" stroke="#6B7280" strokeWidth="2"/>
      <path d="M8 3V7" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 3V7" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
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
    if (stato === "inProgress") return "In Progress";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
  };

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa", 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
    }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? "200px" : "0",
        backgroundColor: "#0d9488",
        transition: "width 0.3s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>
        {/* Linea verticale di separazione sul bordo destro */}
        <div style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "2px",
          backgroundColor: "rgba(255,255,255,0.3)"
        }} />
        
        <div style={{ padding: "20px", color: "white" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "10px",
            marginBottom: "20px",
            paddingBottom: "20px",
            borderBottom: "2px solid rgba(255,255,255,0.25)"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              backgroundColor: "white",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#0d9488",
              fontSize: "14px"
            }}>
              BB
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>BugBoard</div>
              <div style={{ fontSize: "11px", opacity: 0.8 }}>Dashboard</div>
            </div>
          </div>
          
          <nav>
            <a 
              href="/home" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: "white", 
                textDecoration: "none",
                borderRadius: "6px",
                backgroundColor: hoveredItem === "dashboard" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)",
                marginBottom: "6px",
                fontSize: "13px",
                transition: "background-color 0.2s",
                position: "relative"
              }}
              onMouseEnter={() => setHoveredItem("dashboard")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {hoveredItem === "dashboard" && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "white",
                  borderRadius: "0 3px 3px 0"
                }} />
              )}
              <span style={{ fontSize: "16px" }}>📊</span> Dashboard
            </a>
            <a 
              href="/issues" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: "rgba(255,255,255,0.7)", 
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: hoveredItem === "lista" ? "rgba(255,255,255,0.1)" : "transparent",
                transition: "all 0.2s",
                position: "relative"
              }}
              onMouseEnter={() => setHoveredItem("lista")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {hoveredItem === "lista" && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "white",
                  borderRadius: "0 3px 3px 0"
                }} />
              )}
              <span style={{ fontSize: "16px" }}>📋</span> Lista Issue
            </a>
            <a 
              href="/issues/nuova" 
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px", 
                color: "rgba(255,255,255,0.7)", 
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                backgroundColor: hoveredItem === "nuova" ? "rgba(255,255,255,0.1)" : "transparent",
                transition: "all 0.2s",
                position: "relative"
              }}
              onMouseEnter={() => setHoveredItem("nuova")}
              onMouseLeave={() => setHoveredItem("")}
            >
              {hoveredItem === "nuova" && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "4px",
                  backgroundColor: "white",
                  borderRadius: "0 3px 3px 0"
                }} />
              )}
              <span style={{ fontSize: "16px" }}>➕</span> Nuova Issue
            </a>
          </nav>
        </div>
        
        {/* Spacer per spingere profilo/logout in basso */}
        <div style={{ flex: 1 }} />
        
        <div style={{ 
          padding: "20px", 
          borderTop: "2px solid rgba(255,255,255,0.25)",
          color: "white"
        }}>
          <a 
            href="/profilo" 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: "13px",
              marginBottom: "6px",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: hoveredItem === "profilo" ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "all 0.2s",
              position: "relative"
            }}
            onMouseEnter={() => setHoveredItem("profilo")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {hoveredItem === "profilo" && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>👤</span> Profilo
          </a>
          <a 
            href="/logout" 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontSize: "13px",
              padding: "8px 12px",
              borderRadius: "6px",
              backgroundColor: hoveredItem === "logout" ? "rgba(255,255,255,0.1)" : "transparent",
              transition: "all 0.2s",
              position: "relative"
            }}
            onMouseEnter={() => setHoveredItem("logout")}
            onMouseLeave={() => setHoveredItem("")}
          >
            {hoveredItem === "logout" && (
              <div style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "4px",
                backgroundColor: "white",
                borderRadius: "0 3px 3px 0"
              }} />
            )}
            <span style={{ fontSize: "16px" }}>🚪</span> Logout
          </a>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <a 
              href="/issues/nuova"
              style={{
                padding: "8px 16px",
                backgroundColor: "#0d9488",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              + Nuova Issue
            </a>
            <div style={{ 
              width: "36px",
              height: "36px",
              backgroundColor: "#e0f2f1",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}>
              <UserIcon />
            </div>
          </div>
        </header>

        {/* Main Content */}
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

          {/* Dropdown Filter */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ 
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#374151"
            }}>
              <CalendarIcon />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#374151",
                  paddingRight: "20px"
                }}
              >
                <option value="all">Tutte le issue</option>
                <option value="todo">Todo</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>▼</span>
            </div>
          </div>

          {/* Cards Statistiche */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "32px"
          }}>
            {/* Card Issue Totali */}
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

            {/* Card Issue Todo */}
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
                  Issue Todo
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

            {/* Card Issue In Progress */}
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
                  Issue In Progress
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

            {/* Card Issue Done */}
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
                  Issue Done
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
          </div>

          {/* Tabella Issue Recenti */}
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
            overflow: "hidden",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ 
              padding: "20px 24px", 
              borderBottom: "1px solid #e5e7eb", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center" 
            }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Issue Recenti
              </h2>
              <a 
                href="/issues"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "white",
                  color: "#0d9488",
                  textDecoration: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: "1px solid #0d9488"
                }}
              >
                Visualizza Tutte
              </a>
            </div>

            {loading ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                Caricamento in corso...
              </div>
            ) : issues.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                Nessuna issue trovata. Crea la tua prima issue!
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f9fafb" }}>
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
                    {issues.map((issue) => (
                      <tr 
                        key={issue.idIssue} 
                        style={{ 
                          borderTop: "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        onClick={() => window.location.href = `/issues/${issue.idIssue}`}
                      >
                        <td style={{ 
                          padding: "14px 24px", 
                          color: "#1f2937",
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
    </div>
  );
}

export default Home;
