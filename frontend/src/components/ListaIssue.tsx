import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";
import styles from "./ListaIssue.module.css";

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

interface Props {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

function ListaIssue({ sidebarOpen, setSidebarOpen }: Props) {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statoFilter, setStatoFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [prioritaFilter, setPrioritaFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("data_recente");

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // ⚠️ AGGIUNTO: Debounce del termine di ricerca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 800); // Attendi 500ms dopo l'ultimo carattere digitato

    return () => clearTimeout(timer); // Pulisce il timer precedente
  }, [searchTerm]);

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
      if (debouncedSearchTerm) params.ricerca = debouncedSearchTerm; // ← Usa debounced

      const data = await issueService.filterIssuesAdvanced(params);
      setIssues(data);
    } catch (error) {
      console.error("Errore caricamento issue:", error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, statoFilter, tipoFilter, prioritaFilter, sortOrder]); // ← dipende da debouncedSearchTerm

  useEffect(() => {
    loadFilteredIssues();
  }, [loadFilteredIssues]);

  const handleReset = () => {
    setSearchTerm("");
    setDebouncedSearchTerm(""); // ← Reset anche debounced
    setStatoFilter("");
    setTipoFilter("");
    setPrioritaFilter("");
    setSortOrder("data_recente");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT");
  };

  const hasActiveFilters = () => {
    return searchTerm !== "" || 
           statoFilter !== "" || 
           tipoFilter !== "" || 
           prioritaFilter !== "";
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

  const formatStato = (stato: string) => {
    if (stato === "inProgress" || stato === "in_progress") return "In Progress";
    return stato.charAt(0).toUpperCase() + stato.slice(1);
  };

  if (loading && issues.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={styles.loadingContent}>
          <div className={styles.loadingText}>Caricamento issue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Issue</h1>
            <p className={styles.subtitle}>
              Visualizza e gestisci tutte le tue issue
            </p>
          </div>
          <button
            onClick={() => navigate("/issues/nuova")}
            className={styles.createButton}
          >
            <span style={{ fontSize: "18px" }}>➕</span> Nuova Issue
          </button>
        </header>

        <div className={styles.content}>
          {hasActiveFilters() && (
            <div className={styles.activeFiltersNotice}>
              <span style={{ fontSize: "16px" }}>🔍</span>
              <strong>Filtri attivi:</strong>
              <span>Mostrando {issues.length} issue{loading && " (aggiornamento...)"}</span>
            </div>
          )}

          <div className={styles.filterBar}>
            <div className={styles.filterGrid}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>
                  🔍 Cerca issue
                  {/* ⚠️ AGGIUNTO: Indicatore ricerca in corso */}
                  {searchTerm !== debouncedSearchTerm && (
                    <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>
                      (ricerca...)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Scrivi il titolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${styles.searchInput} ${searchTerm ? styles.searchInputActive : ''}`}
                />
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Stato</label>
                <select
                  value={statoFilter}
                  onChange={(e) => setStatoFilter(e.target.value)}
                  className={`${styles.filterSelect} ${statoFilter ? styles.filterSelectActive : ''}`}
                >
                  <option value="">Tutti gli stati</option>
                  <option value="Todo">Todo</option>
                  <option value="inProgress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Tipo</label>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className={`${styles.filterSelect} ${tipoFilter ? styles.filterSelectActive : ''}`}
                >
                  <option value="">Tutti i tipi</option>
                  <option value="bug">Bug</option>
                  <option value="features">Features</option>
                  <option value="question">Question</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Priorità</label>
                <select
                  value={prioritaFilter}
                  onChange={(e) => setPrioritaFilter(e.target.value)}
                  className={`${styles.filterSelect} ${prioritaFilter ? styles.filterSelectActive : ''}`}
                >
                  <option value="">Tutte le priorità</option>
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Ordina</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={styles.filterSelect}
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
                className={styles.resetButton}
              >
                Reset
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th className={styles.tableHeaderCell}>Titolo</th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Stato
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Tipo
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Priorità
                  </th>
                  <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                    Data Creazione
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && issues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.loadingState}>
                      Caricamento...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      Nessuna issue trovata
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr
                      key={issue.idIssue}
                      className={styles.tableRow}
                      onClick={() => navigate(`/issues/${issue.idIssue}`, { state: { from: "/issues" } })}
                    >
                      <td className={`${styles.tableCell} ${styles.tableCellTitle}`}>
                        {issue.titolo}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${getStatoBadgeClass(issue.stato)}`}>
                          {formatStato(issue.stato)}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${getTipoBadgeClass(issue.tipo)}`}>
                          {issue.tipo}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${getPrioritaBadgeClass(issue.priorita)}`}>
                          {issue.priorita}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellDate}`}>
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
