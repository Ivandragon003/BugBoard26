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
  const [sidebarAperta, setSidebarAperta] = useState(true);
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [utenteSelezionato, setUtenteSelezionato] = useState<Utente | null>(null);
  const [caricamentoInCorso, setCaricamentoInCorso] = useState(true);
  const [messaggioErrore, setMessaggioErrore] = useState('');
  const [messaggioSuccesso, setMessaggioSuccesso] = useState('');
  const [mostraModalVisualizza, setMostraModalVisualizza] = useState(false);
  const [mostraModalModifica, setMostraModalModifica] = useState(false);
  const [formModifica, setFormModifica] = useState({ nome: '', cognome: '', ruolo: '' });
  const [filtroStato, setFiltroStato] = useState<string>('');
  const [filtroNome, setFiltroNome] = useState<string>('');


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
      setCaricamentoInCorso(true);
      const response = await axios.get(`${API_BASE_URL}/utenza/lista`, {
        headers: getAuthHeader()
      });
      setUtenti(response.data);
      setMessaggioErrore('');
    } catch (err: any) {
      setMessaggioErrore('Errore nel caricamento degli utenti');
      console.error(err);
    } finally {
      setCaricamentoInCorso(false);
    }
  };


  const visualizzaProfiloUtente = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setMostraModalVisualizza(true);
  };


  const apriModalModifica = (utente: Utente) => {
    setUtenteSelezionato(utente);
    setFormModifica({
      nome: utente.nome,
      cognome: utente.cognome,
      ruolo: utente.ruolo
    });
    setMostraModalModifica(true);
  };


  const gestisciModificaUtente = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formModifica.nome.trim() || !formModifica.cognome.trim()) {
      setMessaggioErrore('Nome e cognome sono obbligatori');
      return;
    }


    if (!utenteSelezionato) return;


    try {
      await axios.put(
        `${API_BASE_URL}/utenza/${utenteSelezionato.idUtente}`,
        formModifica,
        { headers: getAuthHeader() }
      );
      
      setMessaggioSuccesso('Utente modificato con successo');
      setMostraModalModifica(false);
      setMessaggioErrore('');
      caricaUtenti();
      
      setTimeout(() => setMessaggioSuccesso(''), 3000);
    } catch (err: any) {
      setMessaggioErrore(err.response?.data?.message || 'Errore durante la modifica');
    }
  };

  const gestisciCambioStatoUtente = async (idUtente: number, nuovoStato: boolean) => {
    if (window.confirm(`Sei sicuro di voler ${nuovoStato ? 'attivare' : 'disattivare'} questo utente?`)) {
      try {
        await axios.patch(
          `${API_BASE_URL}/utenza/${idUtente}/stato`,
          { stato: nuovoStato },
          { headers: getAuthHeader() }
        );
        
        setMessaggioSuccesso(`Utente ${nuovoStato ? 'attivato' : 'disattivato'} con successo`);
        setMessaggioErrore('');
        caricaUtenti();
        
        setTimeout(() => setMessaggioSuccesso(''), 3000);
      } catch (err: any) {
        setMessaggioErrore(err.response?.data?.message || 'Errore durante il cambio dello stato');
      }
    }
  };

  // Filtra gli utenti in base ai filtri
  const utentiFiltrati = utenti.filter((utente) => {
    const nomeCompleto = `${utente.nome} ${utente.cognome}`.toLowerCase();
    const matchNome = filtroNome === '' || nomeCompleto.includes(filtroNome.toLowerCase());
    
    let matchStato = true;
    if (filtroStato === 'attivi') {
      matchStato = utente.stato === true;
    } else if (filtroStato === 'inattivi') {
      matchStato = utente.stato === false;
    }
    
    return matchNome && matchStato;
  });


  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" stroke="#0d9488" strokeWidth="2"/>
      <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );


  if (caricamentoInCorso) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />
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
      <Sidebar sidebarOpen={sidebarAperta} setSidebarOpen={setSidebarAperta} />


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
              onClick={() => setSidebarAperta(!sidebarAperta)}
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
          {messaggioErrore && (
            <div style={{
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {messaggioErrore}
            </div>
          )}


          {messaggioSuccesso && (
            <div style={{
              color: '#065f46',
              backgroundColor: '#d1fae5',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #86efac'
            }}>
              {messaggioSuccesso}
            </div>
          )}

          {/* Filtri */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '20px 24px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginTop: 0, marginBottom: '16px' }}>
              Filtri
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Stato Utente
                </label>
                <select
                  value={filtroStato}
                  onChange={(e) => setFiltroStato(e.target.value)}
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
                  <option value="">Tutti</option>
                  <option value="attivi">Attivi</option>
                  <option value="inattivi">Inattivi</option>
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Ricerca per Nome
                </label>
                <input
                  type="text"
                  placeholder="Ricerca nome o cognome..."
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>


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
                Utenti Registrati ({utentiFiltrati.length} di {utenti.length})
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
                      textAlign: 'left',
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
                  {utentiFiltrati.map((utente) => (
                    <tr
                      key={utente.idUtente}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        transition: 'background-color 0.2s'
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
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          fontSize: '13px',
                          backgroundColor: utente.stato ? '#d1fae5' : '#fee2e2',
                          color: utente.stato ? '#065f46' : '#dc2626'
                        }}>
                          {utente.stato ? '✓ Attivo' : '✗ Inattivo'}
                        </span>
                      </td>
                      <td style={{
                        padding: '14px 24px',
                        textAlign: 'right'
                      }}>
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
                            marginRight: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => gestisciCambioStatoUtente(utente.idUtente, !utente.stato)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: utente.stato ? '#dc2626' : '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          {utente.stato ? 'Disattiva' : 'Attiva'}
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
      {mostraModalVisualizza && utenteSelezionato && (
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
                onClick={() => setMostraModalVisualizza(false)}
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
              {/* Info Utente */}
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
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Stato Account</p>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      fontSize: '13px',
                      backgroundColor: utenteSelezionato.stato ? '#d1fae5' : '#fee2e2',
                      color: utenteSelezionato.stato ? '#065f46' : '#dc2626'
                    }}>
                      {utenteSelezionato.stato ? '✓ Attivo' : '✗ Inattivo'}
                    </span>
                  </div>
                </div>
              </div>


              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setMostraModalVisualizza(false)}
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
      {mostraModalModifica && utenteSelezionato && (
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
                onClick={() => setMostraModalModifica(false)}
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


            <form onSubmit={gestisciModificaUtente}>
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
                    value={formModifica.nome}
                    onChange={(e) => setFormModifica({ ...formModifica, nome: e.target.value })}
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
                    value={formModifica.cognome}
                    onChange={(e) => setFormModifica({ ...formModifica, cognome: e.target.value })}
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
                    value={formModifica.ruolo}
                    onChange={(e) => setFormModifica({ ...formModifica, ruolo: e.target.value })}
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
                    {/* ✅ SE È AMMINISTRATORE, MOSTRA SOLO "AMMINISTRATORE" */}
                    {utenteSelezionato.ruolo === 'Amministratore' ? (
                      <option value="Amministratore">Amministratore</option>
                    ) : (
                      <>
                        <option value="Utente">Utente</option>
                        <option value="Amministratore">Amministratore</option>
                      </>
                    )}
                  </select>
                  
                  {/* ✅ AVVISO SE È AMMINISTRATORE */}
                  {utenteSelezionato.ruolo === 'Amministratore' && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#0d9488', 
                      marginTop: '6px',
                      marginBottom: 0 
                    }}>
                      ℹ️ Un amministratore non può essere declassato a utente
                    </p>
                  )}
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
                    onClick={() => setMostraModalModifica(false)}
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


      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
