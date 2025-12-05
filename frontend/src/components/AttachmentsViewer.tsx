import React, { useState, useEffect, useCallback } from 'react';
import { allegatoService } from '../services/allegatoService';

interface Allegato {
  idAllegato: number;
  nomeFile: string;
  tipoFile: string;
  dimensione: number;
  dataCaricamento: string;
  percorso: string;
}

interface AttachmentsViewerProps {
  idIssue: number;
  canEdit: boolean;
}

const AttachmentsViewer: React.FC<AttachmentsViewerProps> = ({ idIssue, canEdit }) => {
  const [allegati, setAllegati] = useState<Allegato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAllegati = useCallback(async () => {
    try {
      setLoading(true);
      const data = await allegatoService.getAllegatiByIssue(idIssue);
      setAllegati(data);
      setError('');
    } catch (err: any) {
      console.error('Errore caricamento allegati:', err);
      setError('Errore nel caricamento degli allegati');
    } finally {
      setLoading(false);
    }
  }, [idIssue]);

  useEffect(() => {
    loadAllegati();
  }, [loadAllegati]);

  const handleDownload = async (allegato: Allegato) => {
    try {
      const response = await allegatoService.downloadAllegato(allegato.idAllegato);
      
      const blob = new Blob([response.data], { type: allegato.tipoFile });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = allegato.nomeFile;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Errore download:', err);
      alert('Errore durante il download del file');
    }
  };


  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (tipoFile: string): string => {
    if (tipoFile.startsWith('image/')) return '🖼️';
    if (tipoFile === 'application/pdf') return '📄';
    if (tipoFile.includes('word')) return '📝';
    return '📎';
  };

  if (loading) {
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

  if (error) {
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
        ⚠️ {error}
      </div>
    );
  }

  if (allegati.length === 0) {
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
          {canEdit ? 'Aggiungi allegati modificando l\'issue' : 'Questa issue non ha allegati'}
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
          📎 Allegati ({allegati.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {allegati.map((allegato) => (
          <div
            key={allegato.idAllegato}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#e5e7eb';
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
                {getFileIcon(allegato.tipoFile)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '4px',
                  wordBreak: 'break-word'
                }}>
                  {allegato.nomeFile}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <span>{formatFileSize(allegato.dimensione)}</span>
                  <span>•</span>
                  <span>{formatDate(allegato.dataCaricamento)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleDownload(allegato)}
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
              >
                ⬇️ Scarica
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentsViewer;