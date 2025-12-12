import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import Sidebar from "./Sidebar";
import { authService } from "../services/authService";
import styles from "./Home.module.css";

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

const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M8 6H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 12H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 18H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 6H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
    <path d="M3 12H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
    <path d="M3 18H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2"/>
    <path d="M12 7V12L15 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TrendUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 17L9 11L13 15L21 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 7H21V13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
    <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

interface Props {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function Home({ sidebarOpen, setSidebarOpen }: Props) {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>("");

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const loadFilteredIssues = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        archiviata: false,
        ordinamento: "data_recente"
      };

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
  }, [filterType]);

  const loadAllIssuesForStats = useCallback(async () => {
    try {
      const data = await issueService.filterIssuesAdvanced({
        archiviata: false,
        ordinamento: "data_recente"
      });
      setAllIssues(data);
    } catch (err: any) {
      console.error("Errore caricamento statistiche:", err);
    }
  }, []);

  useEffect(() => {
    loadFilteredIssues();
  }, [loadFilteredIssues]);

  useEffect(() => {
    loadAllIssuesForStats();
  }, [loadAllIssuesForStats]);

  const issueStats = {
    totali: allIssues.length,
    todo: allIssues.filter(i => i.stato.toLowerCase() === 'todo').length,
    inProgress: allIssues.filter(i => {
      const stato = i.stato.toLowerCase();
      return stato === 'inprogress' || stato === 'in_progress';
    }).length,
    done: allIssues.filter(i => i.stato.toLowerCase() === 'done').length,
  };

  const getStatoBadgeClass = (stato: string): string => {
    switch (stato.toLowerCase()) {
      case "todo":
        return styles.badgeStatusTodo;
      case "inprogress":
      case "in_progress":
        return styles.badgeStatusInProgress;
      case "done":
        return styles.badgeStatusDone;
      default:
        return styles.badgeStatusTodo;
    }
  };

  const getTipoBadgeClass = (tipo: string): string => {
    switch (tipo.toLowerCase()) {
      case "bug":
        return styles.badgeTypeBug;
      case "feature":
      case "features":
        return styles.badgeTypeFeature;
      case "question":
        return styles.badgeTypeQuestion;
      case "documentation":
        return styles.badgeTypeDocumentation;
      default:
        return styles.badgeTypeFeature;
    }
  };

  const getPrioritaBadgeClass = (priorita: string): string => {
    switch (priorita.toLowerCase()) {
      case "critical":
        return styles.badgePriorityCritical;
      case "high":
        return styles.badgePriorityHigh;
      case "medium":
        return styles.badgePriorityMedium;
      case "low":
        return styles.badgePriorityLow;
      default:
        return styles.badgePriorityNone;
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
    <div className={styles.container}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={styles.menuButton}
            >
              ☰
            </button>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>BugBoard Dashboard</h2>
              <div className={styles.subtitle}>Issue Management System</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/profilo')}
            className={styles.profileButton}
          >
            <UserIcon />
          </button>
        </header>

        <div className={styles.content}>
          {error && (
            <div className={styles.errorMessage}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.filterBar}>
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <label className={styles.filterLabel}>Filtra per stato</label>
                {filterType && filterType !== "all" && (
                  <span className={styles.filterBadge}>Filtro attivo</span>
                )}
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={`${styles.filterSelect} ${filterType && filterType !== "all" ? styles.filterSelectActive : ''}`}
              >
                <option value="">Tutte le issue</option>
                <option value="Todo">Da fare</option>
                <option value="inProgress">In corso</option>
                <option value="Done">Fatto</option>
              </select>
            </div>

            <button
              onClick={() => navigate('/issues/nuova')}
              className={styles.createButton}
            >
              <span style={{ fontSize: "18px" }}>➕</span> Nuova Issue
            </button>
          </div>

          <div className={styles.statsGrid}>
            {loading && allIssues.length === 0 ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={styles.statCard}>
                    <div className={styles.loadingSkeleton}>
                      <div className={styles.spinner} />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statLabel}>Issue Totali</div>
                    <div className={styles.statIconContainer} style={{ backgroundColor: "#dbeafe" }}>
                      <ListIcon />
                    </div>
                  </div>
                  <div className={styles.statValue}>{issueStats.totali}</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statLabel}>Da fare</div>
                    <div className={styles.statIconContainer} style={{ backgroundColor: "#f3f4f6" }}>
                      <ClockIcon />
                    </div>
                  </div>
                  <div className={styles.statValue}>{issueStats.todo}</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statLabel}>In corso</div>
                    <div className={styles.statIconContainer} style={{ backgroundColor: "#fef3c7" }}>
                      <TrendUpIcon />
                    </div>
                  </div>
                  <div className={styles.statValue}>{issueStats.inProgress}</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <div className={styles.statLabel}>Completate</div>
                    <div className={styles.statIconContainer} style={{ backgroundColor: "#d1fae5" }}>
                      <CheckCircleIcon />
                    </div>
                  </div>
                  <div className={styles.statValue}>{issueStats.done}</div>
                </div>
              </>
            )}
          </div>

          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>Issue Recenti</h2>
              <button
                onClick={() => navigate('/issues')}
                className={styles.viewAllButton}
              >
                Visualizza Tutte
              </button>
            </div>

            {loading ? (
              <div className={styles.loadingState}>Caricamento in corso...</div>
            ) : issues.length === 0 ? (
              <div className={styles.emptyState}>
                {filterType && filterType !== "all"
                  ? "Nessuna issue trovata con questo filtro."
                  : "Nessuna issue trovata. Crea la tua prima issue!"}
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.tableHeaderCell}>Titolo</th>
                      <th className={styles.tableHeaderCell}>Stato</th>
                      <th className={styles.tableHeaderCell}>Tipo</th>
                      <th className={styles.tableHeaderCell}>Priorità</th>
                      <th className={styles.tableHeaderCell}>Data Creazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.slice(0, 5).map((issue) => (
                      <tr
                        key={issue.idIssue}
                        className={styles.tableRow}
                        onClick={() => navigate(`/issues/${issue.idIssue}`, { state: { from: "/home" } })}
                      >
                        <td className={`${styles.tableCell} ${styles.tableCellTitle}`}>
                          {issue.titolo}
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.badge} ${getStatoBadgeClass(issue.stato)}`}>
                            {formatStato(issue.stato)}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.badge} ${getTipoBadgeClass(issue.tipo)}`}>
                            {issue.tipo}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <span className={`${styles.badge} ${getPrioritaBadgeClass(issue.priorita)}`}>
                            {issue.priorita}
                          </span>
                        </td>
                        <td className={`${styles.tableCell} ${styles.tableCellDate}`}>
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
