import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";
import { authService } from "../services/authService";
import Sidebar from "./Sidebar";

function CreaIssue() {
  const naviga = useNavigate();
  const [sidebarAperta, setSidebarAperta] = useState(true);
  const [titoloIssue, setTitoloIssue] = useState("");
  const [descrizioneIssue, setDescrizioneIssue] = useState("");
  const [statoIssue] = useState("Todo");
  const [tipoIssue, setTipoIssue] = useState("bug");
  const [prioritaIssue, setPrioritaIssue] = useState("none");
  const [fileAllegati, setFileAllegati] = useState<File[]>([]);
  const [messaggioErrore, setMessaggioErrore] = useState("");
  const [messaggioSuccesso, setMessaggioSuccesso] = useState("");
  const [caricamentoInCorso, setCaricamentoInCorso] = useState(false);

  const utenteCorrente = authService.getUser();
  const utenteEAmministratore = utenteCorrente?.ruolo === "Amministratore" || utenteCorrente?.role === "admin";

  const gestisciInvioForm = async (eventoForm: React.FormEvent) => {
    eventoForm.preventDefault();
    setMessaggioErrore("");
    setMessaggioSuccesso("");
    setCaricamentoInCorso(true);

    try {
      const utente = authService.getUser();
      if (!utente || !utente.id) {
        setMessaggioErrore("Utente non autenticato");
        setCaricamentoInCorso(false);
        return;
      }

      const datiDaInviare = {
        titolo: titoloIssue,
        descrizione: descrizioneIssue,
        stato: statoIssue,
        tipo: tipoIssue,
        priorita: prioritaIssue,
        idCreatore: utente.id
      };
      const issueCreata = await issueService.createIssue(datiDaInviare);

      if (fileAllegati.length > 0) {
        for (const fileSingolo of fileAllegati) {
          try {
            await allegatoService.uploadAllegato(fileSingolo, issueCreata.idIssue);
          } catch (erroreUpload) {
            console.error(`Errore upload ${fileSingolo.name}:`, erroreUpload);
          }
        }
      }

      setMessaggioSuccesso("Issue creata con successo!");
      setTimeout(() => {
        naviga("/issues");
      }, 1500);
    } catch (errore: any) {
      console.error("❌ Errore creazione issue:", errore);
      setMessaggioErrore(errore.response?.data?.message || "Errore nella creazione dell'issue");
    } finally {
      setCaricamentoInCorso(false);
    }
  };

  const gestisciTrascina = (eventoTrascina: React.DragEvent<HTMLDivElement>) => {
    eventoTrascina.preventDefault();
    eventoTrascina.currentTarget.style.borderColor = "#0d9488";
    eventoTrascina.currentTarget.style.backgroundColor = "#f0fdfa";
  };

  const gestisciEsceDaAreaTrascina = (eventoTrascina: React.DragEvent<HTMLDivElement>) => {
    eventoTrascina.currentTarget.style.borderColor = "#d1d5db";
    eventoTrascina.currentTarget.style.backgroundColor = "#f9fafb";
  };

  const gestisciRilascioFile = (eventoRilascio: React.DragEvent<HTMLDivElement>) => {
    eventoRilascio.preventDefault();
    eventoRilascio.currentTarget.style.borderColor = "#d1d5db";
    eventoRilascio.currentTarget.style.backgroundColor = "#f9fafb";
    if (eventoRilascio.dataTransfer.files) {
      const nuoviFile = Array.from(eventoRilascio.dataTransfer.files);
      setFileAllegati((fileEsistenti) => [...fileEsistenti, ...nuoviFile]);
    }
  };

  const gestisciSelezioneFile = (eventoInput: React.ChangeEvent<HTMLInputElement>) => {
    if (eventoInput.target.files) {
      const nuoviFile = Array.from(eventoInput.target.files);
      setFileAllegati((fileEsistenti) => [...fileEsistenti, ...nuoviFile]);
    }
  };

  const rimuoviFile = (indiceFile: number) => {
    setFileAllegati((fileEsistenti) => fileEsistenti.filter((_, indice) => indice !== indiceFile));
  };

  const formattaDimensioneFile = (dimensioneInBytes: number): string => {
    return (dimensioneInBytes / 1024).toFixed(2);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />
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
            <form onSubmit={gestisciInvioForm}>
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
                  value={titoloIssue}
                  onChange={(evento) => setTitoloIssue(evento.target.value)}
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
                  {titoloIssue.length}/200
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
                  value={descrizioneIssue}
                  onChange={(evento) => setDescrizioneIssue(evento.target.value)}
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
                  {descrizioneIssue.length}/5000
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
                    value={tipoIssue}
                    onChange={(evento) => setTipoIssue(evento.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="bug">bug</option>
                    <option value="features">features</option>
                    <option value="question">question</option>
                    <option value="documentation">documentation</option>
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
                    value={prioritaIssue}
                    onChange={(evento) => setPrioritaIssue(evento.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  >
                    <option value="none">none</option>
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="critical">critical</option>
                  </select>
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
                  Allega file (facoltativo)
                </label>
                <div
                  onDragOver={gestisciTrascina}
                  onDragLeave={gestisciEsceDaAreaTrascina}
                  onDrop={gestisciRilascioFile}
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
                    id="input-selezione-file"
                    multiple
                    onChange={gestisciSelezioneFile}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="input-selezione-file" style={{ cursor: "pointer", display: "block" }}>
                    <div style={{ fontSize: "24px", marginBottom: "8px" }}>⬆️</div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937", marginBottom: "4px" }}>
                      Trascina file qui o clicca
                    </div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      Formati supportati: JPEG, PNG, GIF, WebP - Max 5MB
                    </div>
                  </label>
                </div>
                {fileAllegati.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                      File selezionati:
                    </div>
                    {fileAllegati.map((fileSingolo, indice) => (
                      <div
                        key={indice}
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
                          <div style={{ fontWeight: 600, color: "#1f2937" }}>{fileSingolo.name}</div>
                          <div style={{ color: "#6b7280" }}>{formattaDimensioneFile(fileSingolo.size)} KB</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => rimuoviFile(indice)}
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

              {messaggioErrore && (
                <div style={{
                  color: "#dc2626",
                  backgroundColor: "#fee2e2",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
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
                  marginBottom: "16px",
                  fontSize: "14px",
                  border: "1px solid #6ee7b7"
                }}>
                  ✅ {messaggioSuccesso}
                </div>
              )}

              <button
                type="submit"
                disabled={caricamentoInCorso}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  backgroundColor: caricamentoInCorso ? "#9ca3af" : "#0d9488",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: caricamentoInCorso ? "not-allowed" : "pointer",
                  opacity: caricamentoInCorso ? 0.6 : 1
                }}
              >
                {caricamentoInCorso ? "Creazione in corso..." : "Crea Issue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreaIssue;