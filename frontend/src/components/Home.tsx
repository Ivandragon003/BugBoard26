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
  const naviga = useNavigate();
  const posizioneCorrente = useLocation();
  const [sidebarAperta, setSidebarAperta] = useState(true);
  const [issueFiltrate, setIssueFiltrate] = useState<Issue[]>([]);
  const [tutteLeIssue, setTutteLeIssue] = useState<Issue[]>([]);
  const [messaggioErrore, setMessaggioErrore] = useState<string>("");
  const [caricamentoInCorso, setCaricamentoInCorso] = useState<boolean>(true);
  const [tipoFiltro, setTipoFiltro] = useState<string>("");

  useEffect(() => {
    const tokenAutenticazione = authService.getToken();
    if (!tokenAutenticazione) {
      naviga("/login");
      return;
    }
  }, [naviga]);

  useEffect(() => {
    caricaIssueFiltrate();
  }, [tipoFiltro]);

  useEffect(() => {
    caricaTutteLeIssuePerStatistiche();
  }, []);

  const caricaIssueFiltrate = async () => {
    try {
      setCaricamentoInCorso(true);
      
      const parametriFiltro: any = {
        archiviata: false,
        ordinamento: "data_recente"
      };

      if (tipoFiltro && tipoFiltro !== "all") {
        parametriFiltro.stato = tipoFiltro;
      }

      const datiIssue = await issueService.filterIssuesAdvanced(parametriFiltro);
      setIssueFiltrate(datiIssue);
      setMessaggioErrore("");
    } catch (errore: any) {
      console.error("Errore caricamento issues:", errore);
      setMessaggioErrore(errore.response?.data?.message || "Errore nel caricamento delle issue");
      setIssueFiltrate([]);
    } finally {
      setCaricamentoInCorso(false);
    }
  };

  const caricaTutteLeIssuePerStatistiche = async () => {
    try {
      const datiIssue = await issueService.filterIssuesAdvanced({
        archiviata: false,
        ordinamento: "data_recente"
      });
      setTutteLeIssue(datiIssue);
    } catch (errore: any) {
      console.error("Errore caricamento statistiche:", errore);
    }
  };

  const statisticheIssue = {
    totali: tutteLeIssue.length,
    daFare: tutteLeIssue.filter(issue => issue.stato === 'Todo').length,
    inCorso: tutteLeIssue.filter(issue => issue.stato === 'inProgress').length,
    completate: tutteLeIssue.filter(issue => issue.stato === 'Done').length,
  };

  const IconaLista = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 12H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M8 18H21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 6H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M3 12H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M3 18H3.01" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );

  const IconaOrologio = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2"/>
      <path d="M12 7V12L15 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const IconaTendenzaCrescente = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 17L9 11L13 15L21 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 7H21V13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const IconaSpuntaCircolare = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2"/>
      <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const IconaUtente = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
      <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const ottieniStileStato = (codiceStato: string) => {
    switch (codiceStato) {
      case "Todo":
        return { backgroundColor: "#e5e7eb", color: "#374151" };
      case "inProgress":
        return { backgroundColor: "#fed7aa", color: "#9a3412" };
      case "Done":
        return { backgroundColor: "#86efac", color: "#166534" };
      default:
        return { backgroundColor: "#e5e7eb", color: "#374151" };
    }
  };

  const ottieniStileTipo = (codiceTipo: string) => {
    switch (codiceTipo.toLowerCase()) {
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

  const ottieniStilePriorita = (codicePriorita: string) => {
    switch (codicePriorita.toLowerCase()) {
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

  const formattaData = (stringaData: string) => {
    if (!stringaData) return "N/A";
    const oggettoData = new Date(stringaData);
    return oggettoData.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formattaStato = (codiceStato: string) => {
    const mappaStati: { [chiave: string]: string } = {
      "Todo": "To Do",
      "inProgress": "In Progress",
      "Done": "Done"
    };
    return mappaStati[codiceStato] || codiceStato;
  };

  const gestisciHoverRigaIniziale = (eventoMouse: React.MouseEvent<HTMLTableRowElement>) => {
    eventoMouse.currentTarget.style.backgroundColor = "#f9fafb";
  };

  const gestisciHoverRigaFinale = (eventoMouse: React.MouseEvent<HTMLTableRowElement>) => {
    eventoMouse.currentTarget.style.backgroundColor = "transparent";
  };

  const gestisciCliccaRiga = (idIssue: number) => {
    naviga(`/issues/${idIssue}`, { state: { from: "/home" } });
  };

  const gestisciHoverBottoneIniziale = (eventoMouse: React.MouseEvent<HTMLButtonElement>) => {
    eventoMouse.currentTarget.style.backgroundColor = "#0f766e";
    eventoMouse.currentTarget.style.transform = "translateY(-1px)";
    eventoMouse.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  };

  const gestisciHoverBottoneFinale = (eventoMouse: React.MouseEvent<HTMLButtonElement>) => {
    eventoMouse.currentTarget.style.backgroundColor = "#0d9488";
    eventoMouse.currentTarget.style.transform = "translateY(0)";
    eventoMouse.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
  };

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh", 
      backgroundColor: "#f5f7fa", 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' 
    }}>
      <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />

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
              onClick={() => setSidebarAperta(!sidebarAperta)}
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
            onClick={() => naviga('/profilo')}
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
            <IconaUtente />
          </div>
        </header>

        <div style={{ padding: "32px" }}>
          {messaggioErrore && (
            <div style={{ 
              color: "#dc2626", 
              backgroundColor: "#fee2e2",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "24px", 
              fontSize: "14px",
              border: "1px solid #fecaca"
            }}>
              {messaggioErrore}
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
                {tipoFiltro && tipoFiltro !== "all" && (
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
                value={tipoFiltro}
                onChange={(eventoSelezione) => setTipoFiltro(eventoSelezione.target.value)}
                style={{
                  padding: "10px 40px 10px 16px",
                  border: tipoFiltro && tipoFiltro !== "all" ? "2px solid #0d9488" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#374151",
                  backgroundColor: tipoFiltro && tipoFiltro !== "all" ? "#f0fdfa" : "white",
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
                <option value="Todo"> Da fare</option>
                <option value="inProgress">In corso</option>
                <option value="Done">Fatto</option>
              </select>
            </div>

            <button
              onClick={() => naviga('/issues/nuova')}
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
              onMouseEnter={gestisciHoverBottoneIniziale}
              onMouseLeave={gestisciHoverBottoneFinale}
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
            {caricamentoInCorso && tutteLeIssue.length === 0 ? (
              <>
                {[1, 2, 3, 4].map(indiceCarta => (
                  <div key={indiceCarta} style={{
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
                      <IconaLista />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {statisticheIssue.totali}
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
                      <IconaOrologio />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {statisticheIssue.daFare}
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
                      <IconaTendenzaCrescente />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {statisticheIssue.inCorso}
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
                      <IconaSpuntaCircolare />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937" }}>
                    {statisticheIssue.completate}
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
                onClick={() => naviga('/issues')}
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

            {caricamentoInCorso ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                Caricamento in corso...
              </div>
            ) : issueFiltrate.length === 0 ? (
              <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
                {tipoFiltro && tipoFiltro !== "all" 
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
                    {issueFiltrate.slice(0, 5).map((issueSingola) => (
                      <tr 
                        key={issueSingola.idIssue} 
                        style={{ 
                          borderBottom: "1px solid #e5e7eb",
                          cursor: "pointer",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={gestisciHoverRigaIniziale}
                        onMouseLeave={gestisciHoverRigaFinale}
                        onClick={() => gestisciCliccaRiga(issueSingola.idIssue)}
                      >
                        <td style={{ 
                          padding: "14px 24px", 
                          color: "#0d9488",
                          fontWeight: 500,
                          fontSize: "14px"
                        }}>
                          {issueSingola.titolo}
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ 
                            padding: "4px 12px", 
                            borderRadius: "12px", 
                            fontWeight: 500,
                            fontSize: "13px",
                            ...ottieniStileStato(issueSingola.stato) 
                          }}>
                            {formattaStato(issueSingola.stato)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ 
                            padding: "4px 12px", 
                            borderRadius: "12px", 
                            fontWeight: 500,
                            fontSize: "13px",
                            ...ottieniStileTipo(issueSingola.tipo) 
                          }}>
                            {issueSingola.tipo}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px" }}>
                          <span style={{ 
                            padding: "4px 12px", 
                            borderRadius: "12px", 
                            fontWeight: 500,
                            fontSize: "13px",
                            textTransform: "lowercase",
                            ...ottieniStilePriorita(issueSingola.priorita) 
                          }}>
                            {issueSingola.priorita}
                          </span>
                        </td>
                        <td style={{ padding: "14px 24px", color: "#6b7280", fontSize: "14px" }}>
                          {formattaData(issueSingola.dataCreazione)}
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