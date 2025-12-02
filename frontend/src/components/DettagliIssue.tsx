import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { issueService } from "../services/issueService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";
import VisualizzatoreAllegati from "./ProprietaVisualizzatoreAllegati";

interface Issue {
  idIssue: number;
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
  dataCreazione: string;
  archiviata: boolean;
  dataArchiviazione: string | null;
  creatore: {
    idUtente: number;
    nome: string;
    cognome: string;
    email: string;
  };
  archiviatore: {
    idUtente: number;
    nome: string;
    cognome: string;
    email: string;
  } | null;
}

interface DatiForm {
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
}

interface Utente {
  id?: number;
  idUtente?: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo?: string;
  role?: string;
}

interface DialogoConferma {
  aperto: boolean;
  titolo: string;
  messaggio: string;
  azione: () => Promise<void>;
}

function DettagliIssue() {
  const naviga = useNavigate();
  const posizioneCorrente = useLocation();
  const { id: idParametro } = useParams<{ id: string }>();
  const [sidebarAperta, setSidebarAperta] = useState(true);
  const [issueCorrente, setIssueCorrente] = useState<Issue | null>(null);
  const [caricamentoInCorso, setCaricamentoInCorso] = useState(true);
  const [messaggioErrore, setMessaggioErrore] = useState("");
  const [messaggioSuccesso, setMessaggioSuccesso] = useState("");
  const [verificaAutenticazioneInCorso, setVerificaAutenticazioneInCorso] = useState(true);
  const [utenteCorrente, setUtenteCorrente] = useState<Utente | null>(null);
  const [mostraConferma, setMostraConferma] = useState<DialogoConferma>({
    aperto: false,
    titolo: "",
    messaggio: "",
    azione: async () => {},
  });

  const ottieniPercorsoRitorno = (): string => {
    if (posizioneCorrente.state?.from === "/issues/archiviate") {
      return "/issues/archiviate";
    }
    if (posizioneCorrente.state?.from === "/issues") {
      return "/issues";
    }
    return "/issues";
  };

  useEffect(() => {
    console.log("=== VERIFICA AUTENTICAZIONE ===");
    try {
      const tokenAutenticazione = authService.getToken();
      const utenteAttuale = authService.getUser();
      console.log("Token presente:", !!tokenAutenticazione);
      console.log("User presente:", !!utenteAttuale);
      if (!tokenAutenticazione || !utenteAttuale) {
        console.error("❌ Non autenticato");
        naviga("/login");
        return;
      }

      const idUtente = utenteAttuale.id || utenteAttuale.idUtente;
      if (!idUtente) {
        console.error("❌ User senza ID");
        naviga("/login");
        return;
      }

      const utenteNormalizzato: Utente = {
        ...utenteAttuale,
        id: idUtente,
      };
      console.log("✅ Autenticazione OK - User ID:", idUtente);
      setUtenteCorrente(utenteNormalizzato);
      setVerificaAutenticazioneInCorso(false);
    } catch (erroreAutenticazione) {
      console.error("❌ Errore autenticazione:", erroreAutenticazione);
      naviga("/login");
    }
  }, [naviga]);

  const caricaIssue = useCallback(async () => {
    try {
      setCaricamentoInCorso(true);
      console.log("📥 Caricamento issue:", idParametro);
      const datiIssue = await issueService.getIssueById(Number(idParametro));
      console.log("✅ Issue caricata:", datiIssue);
      setIssueCorrente(datiIssue);
      setMessaggioErrore("");
    } catch (errore: any) {
      console.error("❌ Errore caricamento:", errore);
      let testoErrore = "Errore nel caricamento dell'issue";
      if (errore.response?.data?.message) {
        testoErrore = errore.response.data.message;
      } else if (errore.message) {
        testoErrore = errore.message;
      }
      setMessaggioErrore(testoErrore);
    } finally {
      setCaricamentoInCorso(false);
    }
  }, [idParametro]);

  useEffect(() => {
    if (verificaAutenticazioneInCorso || !idParametro) return;
    caricaIssue();
  }, [idParametro, verificaAutenticazioneInCorso, caricaIssue]);

  const gestisciArchiviazione = () => {
    if (issueCorrente && issueCorrente.stato !== "Done") {
      setMessaggioErrore("Non è possibile archiviare un'issue che non è stata completata.");
      setTimeout(() => setMessaggioErrore(""), 5000);
      return;
    }

    setMostraConferma({
      aperto: true,
      titolo: "Archivia Issue",
      messaggio: "Sei sicuro di voler archiviare questa issue?",
      azione: async () => {
        if (!utenteCorrente) return;
        try {
          console.log("📦 Archiviazione:", idParametro);
          await issueService.archiveIssue(Number(idParametro), utenteCorrente.id || utenteCorrente.idUtente || 0);
          console.log("✅ Issue archiviata");
          setMostraConferma({ aperto: false, titolo: "", messaggio: "", azione: async () => {} });
          setMessaggioSuccesso("Issue archiviata con successo!");
          await caricaIssue();
          setTimeout(() => setMessaggioSuccesso(""), 3000);
        } catch (errore: any) {
          console.error("❌ Errore archiviazione:", errore);
          let testoErrore = "Errore nell'archiviazione dell'issue";
          if (errore.response?.data?.message) {
            testoErrore = errore.response.data.message;
          } else if (errore.message) {
            testoErrore = errore.message;
          }
          setMessaggioErrore(testoErrore);
          setMostraConferma({ aperto: false, titolo: "", messaggio: "", azione: async () => {} });
          setTimeout(() => setMessaggioErrore(""), 5000);
        }
      },
    });
  };

  const gestisciDisarchiviazione = () => {
    setMostraConferma({
      aperto: true,
      titolo: "Disarchivia Issue",
      messaggio: "Sei sicuro di voler disarchiviare questa issue?",
      azione: async () => {
        try {
          console.log("📤 Disarchiviazione:", idParametro);
          await issueService.unarchiveIssue(Number(idParametro));
          console.log("✅ Issue disarchiviata");
          setMostraConferma({ aperto: false, titolo: "", messaggio: "", azione: async () => {} });
          setMessaggioSuccesso("Issue disarchiviata con successo!");
          await caricaIssue();
          setTimeout(() => setMessaggioSuccesso(""), 3000);
        } catch (errore: any) {
          console.error("❌ Errore disarchiviazione:", errore);
          let testoErrore = "Errore nella disarchiviazione";
          if (errore.response?.data?.message) {
            testoErrore = errore.response.data.message;
          }
          setMessaggioErrore(testoErrore);
          setMostraConferma({ aperto: false, titolo: "", messaggio: "", azione: async () => {} });
        }
      },
    });
  };

  const gestisciEliminazione = () => {
    setMostraConferma({
      aperto: true,
      titolo: "Elimina Issue",
      messaggio: "Sei sicuro di voler eliminare questa issue? Questa azione non può essere annullata.",
      azione: async () => {
        try {
          console.log("🗑️ Eliminazione:", idParametro);
          await issueService.deleteIssue(Number(idParametro));
          console.log("✅ Issue eliminata");
          const percorsoRitorno = ottieniPercorsoRitorno();
          naviga(percorsoRitorno);
        } catch (errore: any) {
          console.error("❌ Errore eliminazione:", errore);
          let testoErrore = "Errore nell'eliminazione";
          if (errore.response?.data?.message) {
            testoErrore = errore.response.data.message;
          }
          setMessaggioErrore(testoErrore);
          setMostraConferma({ aperto: false, titolo: "", messaggio: "", azione: async () => {} });
        }
      },
    });
  };

  const gestisciConfermaAzione = async () => {
    await mostraConferma.azione();
  };

  const formattaData = (stringaData: string | null | undefined): string => {
    if (!stringaData) return "-";
    try {
      const oggettoData = new Date(stringaData);
      return oggettoData.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const ottieniEtichettaStato = (codiceStato: string): string => {
    const mappaStati: { [chiave: string]: string } = {
      Todo: "To Do",
      inProgress: "In Progress",
      Done: "Done",
    };
    return mappaStati[codiceStato] || codiceStato;
  };

  const puoCambiareStato = (): boolean => {
    return issueCorrente?.stato !== "Done" && !issueCorrente?.archiviata;
  };

  const issueArchiviata = issueCorrente?.archiviata || false;
  const puoModificare = !issueArchiviata;
  const utenteEAmministratore = utenteCorrente?.ruolo === "Amministratore" || utenteCorrente?.role === "admin";

  if (verificaAutenticazioneInCorso) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento...</div>
        </div>
      </div>
    );
  }

  if (caricamentoInCorso) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#6b7280" }}>Caricamento issue...</div>
        </div>
      </div>
    );
  }

  if (!issueCorrente) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
        <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "18px", color: "#dc2626" }}>Issue non trovata</div>
        </div>
      </div>
    );
  }

  const percorsoRitorno = ottieniPercorsoRitorno();
  const etichettaRitorno = percorsoRitorno === "/issues/archiviate" ? "← Torna alle Archiviate" : "← Torna alla lista";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{ 
          backgroundColor: "white", 
          borderBottom: "1px solid #e5e7eb", 
          padding: "16px 20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button 
              onClick={() => naviga(percorsoRitorno)} 
              style={{ 
                padding: "8px 12px", 
                backgroundColor: "transparent", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "18px", 
                color: "#374151" 
              }}
            >
              {etichettaRitorno}
            </button>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                Dettagli Issue
              </h2>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                Visualizza i dettagli dell'issue
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {utenteEAmministratore && !issueArchiviata && (
              <button 
                onClick={gestisciArchiviazione} 
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
            {utenteEAmministratore && issueArchiviata && (
              <button 
                onClick={gestisciDisarchiviazione} 
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
            {utenteEAmministratore && (
              <button 
                onClick={gestisciEliminazione} 
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
        <div style={{ padding: "24px 16px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
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
              ⚠️ {messaggioErrore}
            </div>
          )}
          
          {messaggioSuccesso && (
            <div style={{ 
              color: "#065f46", 
              backgroundColor: "#d1fae5", 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "24px", 
              fontSize: "14px", 
              border: "1px solid #6ee7b7" 
            }}>
              ✅ {messaggioSuccesso}
            </div>
          )}

          {issueArchiviata && (
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

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: window.innerWidth > 1024 ? "minmax(0, 2fr) minmax(280px, 1fr)" : "1fr",
            gap: "20px" 
          }}>
            {/* Colonna Sinistra */}
            <div style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              padding: "24px", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
            }}>
              {/* Titolo */}
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
                <div style={{ fontSize: "24px", fontWeight: 600, color: "#1f2937" }}>
                  {issueCorrente.titolo}
                </div>
              </div>

              {/* Descrizione */}
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
                <div style={{ 
                  fontSize: "15px", 
                  color: "#4b5563", 
                  lineHeight: 1.6, 
                  whiteSpace: "pre-wrap" 
                }}>
                  {issueCorrente.descrizione}
                </div>
              </div>

            </div>

            {/* Colonna Destra */}
            <div style={{ 
              backgroundColor: "white", 
              borderRadius: "12px", 
              padding: "20px", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)", 
              height: "fit-content" 
            }}>
              <h3 style={{ 
                fontSize: "16px", 
                fontWeight: 600, 
                color: "#1f2937", 
                margin: "0 0 20px 0" 
              }}>
                Informazioni
              </h3>

              {/* Stato */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "8px" 
                }}>
                  Stato
                </label>
                <span style={{ 
                  padding: "6px 12px", 
                  backgroundColor: issueCorrente.stato === "Done" ? "#d1fae5" : issueCorrente.stato === "inProgress" ? "#fef3c7" : "#e5e7eb",
                  color: issueCorrente.stato === "Done" ? "#065f46" : issueCorrente.stato === "inProgress" ? "#92400e" : "#374151",
                  borderRadius: "6px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  display: "inline-block" 
                }}>
                  {ottieniEtichettaStato(issueCorrente.stato)}
                </span>
              </div>

              {/* Tipo */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "8px" 
                }}>
                  Tipo
                </label>
                <span style={{ 
                  padding: "6px 12px", 
                  backgroundColor: "#dbeafe", 
                  color: "#1e40af", 
                  borderRadius: "6px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  display: "inline-block" 
                }}>
                  {issueCorrente.tipo}
                </span>
              </div>

              {/* Priorità */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "8px" 
                }}>
                  Priorità
                </label>
                <span style={{ 
                  padding: "6px 12px", 
                  backgroundColor: issueCorrente.priorita === "critical" ? "#fecaca" : issueCorrente.priorita === "high" ? "#fed7aa" : issueCorrente.priorita === "medium" ? "#fef3c7" : "#f3f4f6",
                  color: issueCorrente.priorita === "critical" ? "#7f1d1d" : issueCorrente.priorita === "high" ? "#9a3412" : issueCorrente.priorita === "medium" ? "#92400e" : "#374151",
                  borderRadius: "6px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  display: "inline-block", 
                  textTransform: "capitalize" 
                }}>
                  {issueCorrente.priorita}
                </span>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

              {/* ID Issue */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "4px" 
                }}>
                  ID Issue
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937", fontFamily: "monospace" }}>
                  #{issueCorrente.idIssue}
                </div>
              </div>

              {/* Creatore */}
              {issueCorrente.creatore && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    fontSize: "13px", 
                    fontWeight: 600, 
                    color: "#6b7280", 
                    marginBottom: "4px" 
                  }}>
                    Creato da
                  </div>
                  <div style={{ fontSize: "14px", color: "#1f2937" }}>
                    {issueCorrente.creatore.nome} {issueCorrente.creatore.cognome}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {issueCorrente.creatore.email}
                  </div>
                </div>
              )}

              {/* Data Creazione */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ 
                  fontSize: "13px", 
                  fontWeight: 600, 
                  color: "#6b7280", 
                  marginBottom: "4px" 
                }}>
                  Data Creazione
                </div>
                <div style={{ fontSize: "14px", color: "#1f2937" }}>
                  {formattaData(issueCorrente.dataCreazione)}
                </div>
              </div>

              {/* Dati Archiviazione */}
              {issueArchiviata && (
                <>
                  <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />
                  {issueCorrente.dataArchiviazione && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: 600, 
                        color: "#6b7280", 
                        marginBottom: "4px" 
                      }}>
                        Data Archiviazione
                      </div>
                      <div style={{ fontSize: "14px", color: "#92400e" }}>
                        {formattaData(issueCorrente.dataArchiviazione)}
                      </div>
                    </div>
                  )}
                  {issueCorrente.archiviatore && (
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: 600, 
                        color: "#6b7280", 
                        marginBottom: "4px" 
                      }}>
                        Archiviato da
                      </div>
                      <div style={{ fontSize: "14px", color: "#92400e" }}>
                        {issueCorrente.archiviatore.nome} {issueCorrente.archiviatore.cognome}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {issueCorrente.archiviatore.email}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sezione Allegati */}
          <div style={{ marginTop: "20px" }}>
            <VisualizzatoreAllegati idIssue={Number(idParametro)} puoModificare={puoModificare} />
          </div>
        </div>
      </div>

      {/* Modal di Conferma */}
      {mostraConferma.aperto && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: "rgba(0, 0, 0, 0.5)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          zIndex: 1000 
        }}>
          <div style={{ 
            backgroundColor: "white", 
            borderRadius: "12px", 
            padding: "32px", 
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)", 
            maxWidth: "400px", 
            textAlign: "center" 
          }}>
            <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937", marginTop: 0 }}>
              {mostraConferma.titolo}
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px", marginTop: "12px" }}>
              {mostraConferma.messaggio}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button 
                onClick={gestisciConfermaAzione} 
                style={{ 
                  padding: "10px 24px", 
                  backgroundColor: "#10b981", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                Conferma
              </button>
              <button 
                onClick={() => {
                  setMostraConferma({ aperto: false, titolo: "", messaggio: "", azione: async () => {} });
                }} 
                style={{ 
                  padding: "10px 24px", 
                  backgroundColor: "#dc2626", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  fontSize: "14px", 
                  fontWeight: 600, 
                  cursor: "pointer" 
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DettagliIssue;