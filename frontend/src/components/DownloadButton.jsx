import { useState } from 'react';
import { downloadDocument } from '../services/documentService';

export default function DownloadButton({ documentId, owner }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setIsDownloading(true);
    setError('');

    try {
      const result = await downloadDocument(documentId, owner);
      const url = URL.createObjectURL(result.blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = result.fileName;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button type="button" className="download-button" onClick={handleDownload} disabled={isDownloading}>
        {isDownloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error && <span className="download-error" role="alert">{error}</span>}
    </div>
  );
}
