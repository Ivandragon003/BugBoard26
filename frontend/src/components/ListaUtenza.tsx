import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { authService } from '../services/authService';
import axios from 'axios';
import API_BASE_URL from '../config';


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


export default function ListaUtenza() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [utentePerCambioStato, setUtentePerCambioStato] = useState<Utente | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', cognome: '', ruolo: '' });


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
      setError('Errore nel caricamento degli utenti');
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
    setEditForm({
      nome: utente.nome,
      cognome: utente.cognome,
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
    
    if (!editForm.nome.trim() || !editForm.cognome.trim()) {
      setError('Nome e cognome sono obbligatori');
      return;
    }

    if (!utenteSelezionato) return;

    try {
      await axios.put(
        `${API_BASE_URL}/utenza/${utenteSelezionato.idUtente}`,
        editForm,
        { headers: getAuthHeader() }
      );
      
      setSuccessMessage('Utente modificato con successo');
      setShowEditModal(false);
      setError('');
      caricaUtenti();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore durante la modifica');
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
    }
  };


  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
      <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );


  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #0d9488',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Caricamento...</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f5f7fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />


      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#374151'
              }}
            >
              ☰
            </button>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                Gestione Utenti
              </h2>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                Amministrazione utenti e assegnazioni
              </div>
            </div>
          </div>
          <div 
            onClick={() => navigate('/profilo')}
            style={{ 
              width: '36px',
              height: '36px',
              backgroundColor: '#e0f2f1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <UserIcon />
          </div>
        </header>


        {/* Content */}
        <div style={{ padding: '32px' }}>
          {/* Messages */}
          {error && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}


          {successMessage && (
            <div style={{
              color: '#065f46',
              backgroundColor: '#d1fae5',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #86efac'
            }}>
              {successMessage}
            </div>
          )}


          {/* Lista Utenti */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '2px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                Utenti Registrati ({utenti.length})
              </h2>
            </div>


            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #d1d5db' }}>
                    <th style={{
                      padding: '14px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Nome Completo
                    </th>
                    <th style={{
                      padding: '14px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '14px 24px',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Ruolo
                    </th>
                    <th style={{
                      padding: '14px 24px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Stato
                    </th>
                    <th style={{
                      padding: '14px 24px',
                      textAlign: 'right',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {utenti.map((utente) => (
                    <tr
                      key={utente.idUtente}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s',
                        opacity: utente.stato ? 1 : 0.6
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: '14px 24px',
                        color: '#1f2937',
                        fontWeight: 500,
                        fontSize: '14px'
                      }}>
                        {utente.nome} {utente.cognome}
                      </td>
                      <td style={{ padding: '14px 24px', color: '#6b7280', fontSize: '14px' }}>
                        {utente.email}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          fontSize: '13px',
                          backgroundColor: utente.ruolo === 'Amministratore' ? '#e9d5ff' : '#dbeafe',
                          color: utente.ruolo === 'Amministratore' ? '#6b21a8' : '#1e40af'
                        }}>
                          {utente.ruolo}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          fontSize: '13px',
                          backgroundColor: utente.stato ? '#d1fae5' : '#fee2e2',
                          color: utente.stato ? '#065f46' : '#dc2626'
                        }}>
                          {utente.stato ? '✓ Attivo' : '✗ Disattivato'}
                        </span>
                      </td>
                      <td style={{
                        padding: '14px 24px',
                        textAlign: 'right'
                      }}>
                        <button
                          onClick={() => apriModalConferma(utente)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: utente.stato ? '#fee2e2' : '#d1fae5',
                            color: utente.stato ? '#dc2626' : '#065f46',
                            border: `1px solid ${utente.stato ? '#fca5a5' : '#86efac'}`,
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginRight: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          {utente.stato ? '🔴 Disattiva' : '🟢 Attiva'}
                        </button>
                        
                        <button
                          onClick={() => visualizzaProfiloUtente(utente)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: '#0d9488',
                            border: '1px solid #0d9488',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            marginRight: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#0d9488';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#0d9488';
                          }}
                        >
                          Visualizza
                        </button>
                        
                        <button
                          onClick={() => apriModalModifica(utente)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#0d9488',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                        >
                          Modifica
                        </button>
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                Profilo: {utenteSelezionato.nome} {utenteSelezionato.cognome}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>


            <div style={{ padding: '24px' }}>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Email</p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937', margin: 0 }}>
                      {utenteSelezionato.email}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Ruolo</p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937', margin: 0 }}>
                      {utenteSelezionato.ruolo}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Stato</p>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937', margin: 0 }}>
                      {utenteSelezionato.stato ? '✓ Attivo' : '✗ Disattivato'}
                    </p>
                  </div>
                </div>
              </div>


              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modal Modifica Utente */}
      {showEditModal && utenteSelezionato && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: 0 }}>
                Modifica Utente
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ×
              </button>
            </div>


            <form onSubmit={handleModificaUtente}>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Nome
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>


                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Cognome
                  </label>
                  <input
                    type="text"
                    value={editForm.cognome}
                    onChange={(e) => setEditForm({ ...editForm, cognome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>


                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Ruolo
                  </label>
                  <select
                    value={editForm.ruolo}
                    onChange={(e) => setEditForm({ ...editForm, ruolo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Utente">Utente</option>
                    <option value="Amministratore">Amministratore</option>
                  </select>
                </div>


                <div style={{
                  padding: '12px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ fontSize: '13px', color: '#92400e', margin: 0 }}>
                    <strong>Nota:</strong> Email e password non possono essere modificate da qui
                  </p>
                </div>


                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#0d9488',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: utentePerCambioStato.stato ? '#fee2e2' : '#d1fae5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {utentePerCambioStato.stato ? '⚠️' : '✓'}
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: 600, 
                    color: '#1f2937', 
                    margin: 0 
                  }}>
                    {utentePerCambioStato.stato ? 'Disattiva Utente' : 'Attiva Utente'}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: '4px 0 0 0' 
                  }}>
                    Conferma l'operazione
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  margin: '0 0 12px 0',
                  lineHeight: 1.6
                }}>
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
                <div style={{
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ 
                    fontSize: '15px', 
                    fontWeight: 600, 
                    color: '#1f2937', 
                    margin: '0 0 4px 0' 
                  }}>
                    {utentePerCambioStato.nome} {utentePerCambioStato.cognome}
                  </p>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#6b7280', 
                    margin: 0 
                  }}>
                    {utentePerCambioStato.email}
                  </p>
                </div>
              </div>

              {utentePerCambioStato.stato && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ 
                    fontSize: '13px', 
                    color: '#92400e', 
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    <strong>Attenzione:</strong> L'utente non potrà più accedere al sistema fino alla riattivazione.
                  </p>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end' 
              }}>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setUtentePerCambioStato(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Annulla
                </button>
                <button
                  onClick={confermaToggleStato}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: utentePerCambioStato.stato ? '#dc2626' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = utentePerCambioStato.stato ? '#b91c1c' : '#047857';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = utentePerCambioStato.stato ? '#dc2626' : '#059669';
                  }}
                >
                  {utentePerCambioStato.stato ? 'Disattiva Utente' : 'Attiva Utente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
