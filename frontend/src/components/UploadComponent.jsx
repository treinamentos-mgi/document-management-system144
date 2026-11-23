import { useState } from 'react';
import { uploadDocument } from '../services/documentService';

export default function UploadComponent({ owner, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleUpload(event) {
    event.preventDefault();

    if (!file) {
      setMessage('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      await uploadDocument(file, owner);
      setFile(null);
      event.target.reset();
      setMessage('Arquivo enviado com sucesso.');
      await onUploaded();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="upload-panel" aria-labelledby="upload-title">
      <div>
        <p className="section-kicker">Novo documento</p>
        <h2 id="upload-title">Enviar arquivo</h2>
      </div>

      <form className="upload-form" onSubmit={handleUpload}>
        <label className="file-field" htmlFor="document-file">
          <span>{file ? file.name : 'Escolher arquivo'}</span>
          <input
            id="document-file"
            type="file"
            onChange={(event) => setFile(event.target.files[0] || null)}
          />
        </label>
        <button type="submit" disabled={isUploading || !file}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {message && <p className="form-message" role="status">{message}</p>}
    </section>
  );
}
