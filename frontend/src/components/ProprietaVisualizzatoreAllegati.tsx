import React, { useState, useEffect } from 'react';
import { allegatoService } from '../services/allegatoService';

interface Allegato {
  idAllegato: number;
  nomeFile: string;
  tipoFile: string;
  dimensione: number;
  dataCaricamento: string;
  percorso: string;
}

interface ProprietaVisualizzatoreAllegati {
  idIssue: number;
  puoModificare: boolean;
}

const VisualizzatoreAllegati: React.FC<ProprietaVisualizzatoreAllegati> = ({ 
  idIssue, 
  puoModificare 
}) => {
  const [listaAllegati, setListaAllegati] = useState<Allegato[]>([]);
  const [caricamentoInCorso, setCaricamentoInCorso] = useState(true);
  const [messaggioErrore, setMessaggioErrore] = useState('');

  useEffect(() => {
    caricaAllegati();
  }, [idIssue]);

  const caricaAllegati = async () => {
    try {
      setCaricamentoInCorso(true);
      const datiAllegati = await allegatoService.getAllegatiByIssue(idIssue);
      setListaAllegati(datiAllegati);
      setMessaggioErrore('');
    } catch (errore: any) {
      console.error('Errore caricamento allegati:', errore);
      setMessaggioErrore('Errore nel caricamento degli allegati');
    } finally {
      setCaricamentoInCorso(false);
    }
  };

  const gestisciDownload = async (allegatoDaScaricare: Allegato) => {
    try {
      const rispostaDownload = await allegatoService.downloadAllegato(allegatoDaScaricare.idAllegato);
      
      const blobFile = new Blob([rispostaDownload.data], { type: allegatoDaScaricare.tipoFile });
      const urlTemporaneo = window.URL.createObjectURL(blobFile);
      
      const linkDownload = document.createElement('a');
      linkDownload.href = urlTemporaneo;
      linkDownload.download = allegatoDaScaricare.nomeFile;
      document.body.appendChild(linkDownload);
      linkDownload.click();
      
      document.body.removeChild(linkDownload);
      window.URL.revokeObjectURL(urlTemporaneo);
    } catch (errore: any) {
      console.error('Errore download:', errore);
      alert('Errore durante il download del file');
    }
  };

  const gestisciEliminazione = async (idAllegatoDaEliminare: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo allegato?')) {
      return;
    }

    try {
      await allegatoService.deleteAllegato(idAllegatoDaEliminare);
      await caricaAllegati();
    } catch (errore: any) {
      console.error('Errore eliminazione:', errore);
      alert('Errore durante l\'eliminazione del file');
    }
  };

  const formattaDimensioneFile = (dimensioneInBytes: number): string => {
    if (dimensioneInBytes === 0) return '0 Bytes';
    const fattoreDivisione = 1024;
    const unitaMisura = ['Bytes', 'KB', 'MB', 'GB'];
    const indiceSufisso = Math.floor(Math.log(dimensioneInBytes) / Math.log(fattoreDivisione));
    return Math.round(dimensioneInBytes / Math.pow(fattoreDivisione, indiceSufisso) * 100) / 100 + ' ' + unitaMisura[indiceSufisso];
  };

  const formattaData = (stringaData: string): string => {
    const oggettoData = new Date(stringaData);
    return oggettoData.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ottieniIconaFile = (tipoMimeFile: string): string => {
    if (tipoMimeFile.startsWith('image/')) return '🖼️';
    if (tipoMimeFile === 'application/pdf') return '📄';
    if (tipoMimeFile.includes('word')) return '📝';
    return '📎';
  };

  if (caricamentoInCorso) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '24px'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          Caricamento allegati...
        </div>
      </div>
    );
  }

  if (messaggioErrore) {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '24px',
        color: '#dc2626',
        fontSize: '14px'
      }}>
        ⚠️ {messaggioErrore}
      </div>
    );
  }

  if (listaAllegati.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
          Nessun allegato
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {puoModificare ? 'Aggiungi allegati modificando l\'issue' : 'Questa issue non ha allegati'}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginTop: '24px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937',
          margin: 0
        }}>
          📎 Allegati ({listaAllegati.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {listaAllegati.map((allegatoCorrente) => (
          <div
            key={allegatoCorrente.idAllegato}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(eventoMouse) => {
              eventoMouse.currentTarget.style.backgroundColor = '#f3f4f6';
              eventoMouse.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(eventoMouse) => {
              eventoMouse.currentTarget.style.backgroundColor = '#f9fafb';
              eventoMouse.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#e0f2f1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {ottieniIconaFile(allegatoCorrente.tipoFile)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '4px',
                  wordBreak: 'break-word'
                }}>
                  {allegatoCorrente.nomeFile}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <span>{formattaDimensioneFile(allegatoCorrente.dimensione)}</span>
                  <span>•</span>
                  <span>{formattaData(allegatoCorrente.dataCaricamento)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => gestisciDownload(allegatoCorrente)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0d9488',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(eventoMouse) => eventoMouse.currentTarget.style.backgroundColor = '#0f766e'}
                onMouseLeave={(eventoMouse) => eventoMouse.currentTarget.style.backgroundColor = '#0d9488'}
              >
                ⬇️ Scarica
              </button>

              {puoModificare && (
                <button
                  onClick={() => gestisciEliminazione(allegatoCorrente.idAllegato)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(eventoMouse) => {
                    eventoMouse.currentTarget.style.backgroundColor = '#fecaca';
                  }}
                  onMouseLeave={(eventoMouse) => {
                    eventoMouse.currentTarget.style.backgroundColor = '#fee2e2';
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisualizzatoreAllegati;