import React, { useState, useEffect, useCallback } from 'react';
import { allegatoService } from '../services/allegatoService';
import styles from './AttachmentsViewer.module.css';

interface Allegato {
  idAllegato: number;
  nomeFile: string;
  tipoFile: string;
  dimensione: number;
  dimensioneMB: string;
  dataCaricamento: string;
}

interface AttachmentsViewerProps {
  idIssue: number;
  canEdit: boolean;
}

interface ConfirmDialog {
  open: boolean;
  title: string;
  message: string;
  allegatoId: number | null;
}

const AttachmentsViewer: React.FC<AttachmentsViewerProps> = ({ idIssue, canEdit }) => {
  const [allegati, setAllegati] = useState<Allegato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState<ConfirmDialog>({
    open: false,
    title: '',
    message: '',
    allegatoId: null
  });

  const loadAllegati = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Caricamento allegati per issue:', idIssue);
      const data = await allegatoService.getAllegatiByIssue(idIssue);
      
      console.log('✅ Allegati ricevuti:', data);
      setAllegati(data);
    } catch (err: any) {
      console.error('❌ Errore caricamento allegati:', err);
      const message = err.response?.data?.message || err.message || 'Errore nel caricamento degli allegati';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [idIssue]);

  useEffect(() => {
    loadAllegati();
  }, [loadAllegati]);

  const handleDownload = async (allegato: Allegato) => {
    try {
      setDownloadingId(allegato.idAllegato);
      setError('');
      
      console.log('📥 Download allegato:', allegato.idAllegato);
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
      
      setSuccess(`File "${allegato.nomeFile}" scaricato con successo`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Errore download:', err);
      const message = err.response?.data?.message || 'Errore durante il download del file';
      setError(message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteClick = (allegato: Allegato) => {
    setShowConfirm({
      open: true,
      title: 'Elimina Allegato',
      message: `Sei sicuro di voler eliminare "${allegato.nomeFile}"? Questa azione non può essere annullata.`,
      allegatoId: allegato.idAllegato
    });
  };

  const confirmDelete = async () => {
    if (!showConfirm.allegatoId) return;

    try {
      console.log('🗑️ Eliminazione allegato:', showConfirm.allegatoId);
      await allegatoService.deleteAllegato(showConfirm.allegatoId);
      
      setSuccess('Allegato eliminato con successo');
      setShowConfirm({ open: false, title: '', message: '', allegatoId: null });
      
      // Ricarica lista allegati
      await loadAllegati();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('❌ Errore eliminazione:', err);
      const message = err.response?.data?.message || 'Errore durante l\'eliminazione del file';
      setError(message);
      setShowConfirm({ open: false, title: '', message: '', allegatoId: null });
      setTimeout(() => setError(''), 5000);
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
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (tipoFile: string): string => {
    if (tipoFile.startsWith('image/')) return '🖼️';
    if (tipoFile === 'application/pdf') return '📄';
    if (tipoFile.includes('word') || tipoFile.includes('msword')) return '📝';
    if (tipoFile.includes('excel') || tipoFile.includes('sheet')) return '📊';
    if (tipoFile.includes('zip') || tipoFile.includes('rar')) return '📦';
    return '📎';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <div className={styles.loadingText}>
          Caricamento allegati...
        </div>
      </div>
    );
  }

  if (allegati.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>📎</div>
        <div className={styles.emptyTitle}>
          Nessun allegato
        </div>
        <div className={styles.emptySubtitle}>
          {canEdit ? 'Aggiungi allegati modificando l\'issue' : 'Questa issue non ha allegati'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.attachmentsContainer}>
      {/* Messaggi di feedback */}
      {error && (
        <div className={styles.errorMessage}>
          ⚠️ {error}
        </div>
      )}
      
      {success && (
        <div className={styles.successMessage}>
          ✅ {success}
        </div>
      )}

      <div className={styles.attachmentsHeader}>
        <h3 className={styles.attachmentsTitle}>
          Allegati ({allegati.length})
        </h3>
      </div>

      <div className={styles.attachmentsList}>
        {allegati.map((allegato) => (
          <div key={allegato.idAllegato} className={styles.attachmentItem}>
            <div className={styles.attachmentContent}>
              <div className={styles.fileIconContainer}>
                {getFileIcon(allegato.tipoFile)}
              </div>

              <div className={styles.fileInfo}>
                <div className={styles.fileName} title={allegato.nomeFile}>
                  {allegato.nomeFile}
                </div>
                <div className={styles.fileMetadata}>
                  <span>{formatFileSize(allegato.dimensione)}</span>
                  <span className={styles.metadataSeparator}>•</span>
                  <span>{formatDate(allegato.dataCaricamento)}</span>
                </div>
              </div>
            </div>

            <div className={styles.attachmentActions}>
              <button
                onClick={() => handleDownload(allegato)}
                disabled={downloadingId === allegato.idAllegato}
                className={`${styles.downloadButton} ${downloadingId === allegato.idAllegato ? styles.downloading : ''}`}
                aria-label={`Scarica ${allegato.nomeFile}`}
              >
                {downloadingId === allegato.idAllegato ? (
                  <>⏳ Scaricando...</>
                ) : (
                  <>⬇️ Scarica</>
                )}
              </button>

              {canEdit && (
                <button
                  onClick={() => handleDeleteClick(allegato)}
                  className={styles.deleteButton}
                  aria-label={`Elimina ${allegato.nomeFile}`}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal di conferma eliminazione */}
      {showConfirm.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{showConfirm.title}</h3>
              <button
                onClick={() => setShowConfirm({ open: false, title: '', message: '', allegatoId: null })}
                className={styles.modalClose}
                aria-label="Chiudi"
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.modalMessage}>{showConfirm.message}</p>
            </div>
            
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowConfirm({ open: false, title: '', message: '', allegatoId: null })}
                className={styles.modalCancelButton}
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className={styles.modalConfirmButton}
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentsViewer;