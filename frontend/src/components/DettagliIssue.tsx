import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { issueService } from "../services/issueService";
import { allegatoService } from "../services/allegatoService";

// Tipi
interface Utenza {
  idUtente: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: "Amministratore" | "Utente";
  stato: boolean;
  creatore?: Utenza | null;
}

interface Allegato {
  idAllegato: number;
  nomeFile: string;
  percorso: string;
  dataCaricamento: string;
  caricatore: Utenza;
}

interface IssueType {
  idIssue: number;
  titolo: string;
  descrizione: string;
  stato: string;
  tipo: string;
  priorita: string;
  archiviata: boolean;
  dataCreazione: string;
  dataUltimaModifica: string;
  dataArchiviazione?: string | null;
  dataRisoluzione?: string | null;
  creatore: Utenza;
  archiviatore?: Utenza | null;
  allegati?: Allegato[];
}

const DettagliIssue: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<IssueType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caricamentoAllegato, setCaricamentoAllegato] = useState(false);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchIssue = async () => {
      try {
        const data = await issueService.getIssueById(Number(id));
        setIssue(data);
      } catch (error) {
        console.error("Errore nel caricamento issue", error);
      }
    };

    fetchIssue();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questa issue?")) return;
    try {
      await issueService.deleteIssue(Number(id));
      navigate("/issues");
    } catch (error) {
      console.error("Errore eliminazione issue", error);
    }
  };

  const handleArchive = async () => {
    try {
      const user = authService.getUser();
      if (!user) return;
      await issueService.archiveIssue(Number(id), user.idUtente);
      const updated = await issueService.getIssueById(Number(id));
      setIssue(updated);
    } catch (error) {
      console.error("Errore archiviazione", error);
    }
  };

  const handleUnarchive = async () => {
    try {
      await issueService.unarchiveIssue(Number(id));
      const updated = await issueService.getIssueById(Number(id));
      setIssue(updated);
    } catch (error) {
      console.error("Errore disarchiviazione", error);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    try {
      setCaricamentoAllegato(true);
      const user = authService.getUser();
      if (!user) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("idIssue", String(id));
      formData.append("idCaricatore", String(user.idUtente));

      await allegatoService.upload(formData);

      const updated = await issueService.getIssueById(Number(id));
      setIssue(updated);
      setFile(null);
    } catch (error) {
      console.error("Errore upload allegato", error);
    } finally {
      setCaricamentoAllegato(false);
    }
  };

  if (!issue) return <p>Caricamento...</p>;

  return (
    <div className="container mt-4">
      <h2>Dettagli Issue</h2>
      <hr />

      <h3>{issue.titolo}</h3>
      <p>{issue.descrizione}</p>

      <p><strong>Stato:</strong> {issue.stato}</p>
      <p><strong>Tipo:</strong> {issue.tipo}</p>
      <p><strong>Priorità:</strong> {issue.priorita}</p>
      <p><strong>Creata da:</strong> {issue.creatore.nome} {issue.creatore.cognome}</p>
      <p><strong>Data creazione:</strong> {issue.dataCreazione}</p>

      {issue.archiviata && (
        <p className="text-danger"><strong>Archiviata il:</strong> {issue.dataArchiviazione}</p>
      )}

      {/* --- AZIONI --- */}
      <div className="d-flex gap-2 mt-3">
        {!issue.archiviata && (
          <button className="btn btn-warning" onClick={handleArchive}>Archivia</button>
        )}

        {issue.archiviata && (
          <button className="btn btn-secondary" onClick={handleUnarchive}>Disarchivia</button>
        )}

        <button className="btn btn-danger" onClick={handleDelete}>Elimina</button>
      </div>

      <hr />

      {/* --- GESTIONE ALLEGATI --- */}
      <h4>Allegati</h4>

      <ul>
        {issue.allegati?.map(a => (
          <li key={a.idAllegato}>
            <a href={a.percorso} target="_blank" rel="noreferrer">{a.nomeFile}</a>
            <span> — Caricato da {a.caricatore.nome} il {a.dataCaricamento}</span>
          </li>
        ))}
      </ul>

      {/* Upload */}
      <div className="mt-3">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button
          className="btn btn-primary ms-2"
          disabled={!file || caricamentoAllegato}
          onClick={handleFileUpload}
        >
          {caricamentoAllegato ? "Caricamento..." : "Carica allegato"}
        </button>
      </div>
    </div>
  );
};

export default DettagliIssue;
