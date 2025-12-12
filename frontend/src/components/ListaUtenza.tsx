import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../services/authService';
import axios from 'axios';
import API_BASE_URL from '../config';
import styles from './ListaUtenza.module.css';

interface Utente {
  idUtente: number;
  id?: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
  stato: boolean;
}

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`
});

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
    <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function ListaUtenza() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
  const saved = localStorage.getItem('sidebarOpen');
  if (saved !== null) {
    return saved === 'true';
  }
  return window.innerWidth > 768;
});

useEffect(() => {
  localStorage.setItem('sidebarOpen', String(sidebarOpen));
}, [sidebarOpen]);

  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [utentePerCambioStato, setUtentePerCambioStato] = useState<Utente | null>(null);
  // ✅ MODIFICA: Solo ruolo nell'editForm
  const [editForm, setEditForm] = useState({ ruolo: '' });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    if (!authService.isAdmin()) {
      navigate('/home');
      return;
    }
    
    caricaUtenti();
  }, [navigate]);

  const caricaUtenti = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/utenza/lista`, {
        headers: getAuthHeader()
      });
      setUtenti(response.data);
      setError('');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Errore nel caricamento degli utenti';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const visualizzaProfiloUtente = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setShowModal(true);
  };

  const apriModalModifica = (utente: Utente) => {
    setUtenteSelezionato(utente);
    // ✅ MODIFICA: Solo ruolo
    setEditForm({
      ruolo: utente.ruolo
    });
    setShowEditModal(true);
  };

  const apriModalConferma = (utente: Utente) => {
    setUtentePerCambioStato(utente);
    setShowConfirmModal(true);
  };

  const handleModificaUtente = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!utenteSelezionato) return;

    try {
      // ✅ MODIFICA: Invia solo il ruolo al backend
      await axios.put(
        `${API_BASE_URL}/utenza/${utenteSelezionato.idUtente}`,
        { ruolo: editForm.ruolo },
        { headers: getAuthHeader() }
      );
      
      setSuccessMessage('Ruolo utente modificato con successo');
      setShowEditModal(false);
      setError('');
      caricaUtenti();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante la modifica');
      setTimeout(() => setError(''), 5000);
    }
  };

  const confermaToggleStato = async () => {
    if (!utentePerCambioStato) return;
    
    const nuovoStato = !utentePerCambioStato.stato;

    try {
      await axios.patch(
        `${API_BASE_URL}/utenza/${utentePerCambioStato.idUtente}/stato`,
        { stato: nuovoStato },
        { headers: getAuthHeader() }
      );
      
      setSuccessMessage(`Utente ${nuovoStato ? 'attivato' : 'disattivato'} con successo`);
      setError('');
      setShowConfirmModal(false);
      setUtentePerCambioStato(null);
      caricaUtenti();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante il cambio di stato');
      setShowConfirmModal(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <h2 className={styles.title}>Gestione Utenti</h2>
              <div className={styles.subtitle}>
                Amministrazione utenti e assegnazioni
              </div>
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
            <div className={styles.errorMessage}>⚠️ {error}</div>
          )}

          {successMessage && (
            <div className={styles.successMessage}>✅ {successMessage}</div>
          )}

          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>
                Utenti Registrati ({utenti.length})
              </h2>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead className={styles.tableHead}>
                  <tr>
                    <th className={styles.tableHeaderCell}>Nome Completo</th>
                    <th className={styles.tableHeaderCell}>Email</th>
                    <th className={styles.tableHeaderCell}>Ruolo</th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellCenter}`}>
                      Stato
                    </th>
                    <th className={`${styles.tableHeaderCell} ${styles.tableHeaderCellRight}`}>
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {utenti.map((utente) => (
                    <tr
                      key={utente.idUtente}
                      className={`${styles.tableRow} ${!utente.stato ? styles.tableRowInactive : ''}`}
                    >
                      <td className={`${styles.tableCell} ${styles.tableCellName}`}>
                        {utente.nome} {utente.cognome}
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellEmail}`}>
                        {utente.email}
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.badge} ${utente.ruolo === 'Amministratore' ? styles.badgeRoleAdmin : styles.badgeRoleUser}`}>
                          {utente.ruolo}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                        <span className={`${styles.badge} ${utente.stato ? styles.badgeStatusActive : styles.badgeStatusInactive}`}>
                          {utente.stato ? '✓ Attivo' : '✗ Disattivato'}
                        </span>
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellActions}`}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => apriModalConferma(utente)}
                            className={`${styles.buttonToggle} ${utente.stato ? styles.buttonToggleActive : styles.buttonToggleInactive}`}
                          >
                            {utente.stato ? '🔴 Disattiva' : '🟢 Attiva'}
                          </button>
                          
                          <button
                            onClick={() => visualizzaProfiloUtente(utente)}
                            className={styles.buttonView}
                          >
                            Visualizza
                          </button>
                          
                          <button
                            onClick={() => apriModalModifica(utente)}
                            className={styles.buttonEdit}
                          >
                            Modifica Ruolo
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Visualizza Profilo */}
      {showModal && utenteSelezionato && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Profilo: {utenteSelezionato.nome} {utenteSelezionato.cognome}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={styles.modalClose}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.profileInfo}>
                <div className={styles.profileGrid}>
                  <div className={styles.profileField}>
                    <p className={styles.profileLabel}>Nome Completo</p>
                    <p className={styles.profileValue}>
                      {utenteSelezionato.nome} {utenteSelezionato.cognome}
                    </p>
                  </div>
                  <div className={styles.profileField}>
                    <p className={styles.profileLabel}>Email</p>
                    <p className={styles.profileValue}>{utenteSelezionato.email}</p>
                  </div>
                  <div className={styles.profileField}>
                    <p className={styles.profileLabel}>Ruolo</p>
                    <p className={styles.profileValue}>{utenteSelezionato.ruolo}</p>
                  </div>
                  <div className={styles.profileField}>
                    <p className={styles.profileLabel}>Stato</p>
                    <p className={styles.profileValue}>
                      {utenteSelezionato.stato ? '✓ Attivo' : '✗ Disattivato'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowModal(false)}
                  className={styles.buttonSecondary}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODIFICA: Modal Modifica Ruolo - Solo ruolo modificabile */}
      {showEditModal && utenteSelezionato && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalContentSmall}`}>
            <div className={styles.modalHeader}>
              <h3 className={`${styles.modalTitle} ${styles.modalTitleSmall}`}>
                Modifica Ruolo Utente
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className={styles.modalClose}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleModificaUtente}>
              <div className={styles.modalBody}>
                {/* ✅ MODIFICA: Info utente in sola lettura */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Utente</label>
                  <div className={styles.formReadOnly}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                      {utenteSelezionato.nome} {utenteSelezionato.cognome}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {utenteSelezionato.email}
                    </div>
                  </div>
                </div>

                {/* ✅ MODIFICA: Solo il ruolo è modificabile */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ruolo *</label>
                  <select
                    value={editForm.ruolo}
                    onChange={(e) => setEditForm({ ruolo: e.target.value })}
                    className={styles.formSelect}
                    required
                  >
                    <option value="Utente">Utente</option>
                    <option value="Amministratore">Amministratore</option>
                  </select>
                </div>

                <div className={styles.formNote}>
                  <p className={styles.formNoteText}>
                    <strong>Nota:</strong> Nome, cognome, email e password non possono essere modificati da qui
                  </p>
                </div>

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={styles.buttonCancel}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className={styles.buttonPrimary}
                  >
                    Salva Modifiche
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Conferma Cambio Stato */}
      {showConfirmModal && utentePerCambioStato && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalContentMedium}`}>
            <div className={styles.modalHeader}>
              <div className={styles.confirmHeader}>
                <div className={`${styles.confirmIcon} ${utentePerCambioStato.stato ? styles.confirmIconDeactivate : styles.confirmIconActivate}`}>
                  {utentePerCambioStato.stato ? '⚠️' : '✓'}
                </div>
                <div className={styles.confirmTitleWrapper}>
                  <h3 className={styles.confirmTitle}>
                    {utentePerCambioStato.stato ? 'Disattiva Utente' : 'Attiva Utente'}
                  </h3>
                  <p className={styles.confirmSubtitle}>Conferma l'operazione</p>
                </div>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.confirmMessage}>
                <p className={styles.confirmMessageText}>
                  {utentePerCambioStato.stato ? (
                    <>
                      Stai per <strong style={{ color: '#dc2626' }}>disattivare</strong> l'utente:
                    </>
                  ) : (
                    <>
                      Stai per <strong style={{ color: '#065f46' }}>attivare</strong> l'utente:
                    </>
                  )}
                </p>
                <div className={styles.confirmUserCard}>
                  <p className={styles.confirmUserName}>
                    {utentePerCambioStato.nome} {utentePerCambioStato.cognome}
                  </p>
                  <p className={styles.confirmUserEmail}>
                    {utentePerCambioStato.email}
                  </p>
                </div>
              </div>

              {utentePerCambioStato.stato && (
                <div className={styles.confirmWarning}>
                  <p className={styles.confirmWarningText}>
                    <strong>Attenzione:</strong> L'utente non potrà più accedere al sistema fino alla riattivazione.
                  </p>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setUtentePerCambioStato(null);
                  }}
                  className={styles.buttonCancel}
                >
                  Annulla
                </button>
                <button
                  onClick={confermaToggleStato}
                  className={utentePerCambioStato.stato ? styles.buttonDanger : styles.buttonSuccess}
                >
                  {utentePerCambioStato.stato ? 'Disattiva Utente' : 'Attiva Utente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}