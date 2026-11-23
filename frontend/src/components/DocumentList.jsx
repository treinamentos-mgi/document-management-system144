import DownloadButton from './DownloadButton';

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(uploadedAt) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(uploadedAt));
}

export default function DocumentList({ documents, owner, isLoading, error }) {
  return (
    <section className="document-panel" aria-labelledby="documents-title">
      <div className="document-heading">
        <div>
          <p className="section-kicker">Biblioteca</p>
          <h2 id="documents-title">Documentos</h2>
        </div>
        <span className="document-count">{documents.length}</span>
      </div>

      {isLoading && <p className="list-state">Carregando documentos...</p>}
      {error && <p className="list-state error" role="alert">{error}</p>}

      {!isLoading && !error && documents.length === 0 && (
        <div className="empty-state">
          <strong>Nenhum documento enviado</strong>
          <span>Os arquivos deste usuário aparecerão aqui.</span>
        </div>
      )}

      {!isLoading && documents.length > 0 && (
        <div className="document-list">
          {documents.map((document) => (
            <article className="document-row" key={document.id}>
              <div className="document-info">
                <strong title={document.originalName}>{document.originalName}</strong>
                <span>{formatFileSize(document.size)} · {formatDate(document.uploadedAt)}</span>
              </div>
              <DownloadButton documentId={document.id} owner={owner} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
