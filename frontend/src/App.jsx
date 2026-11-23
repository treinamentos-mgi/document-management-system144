import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentService';

export default function App() {
  const [owner, setOwner] = useState('usuario-1');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [listError, setListError] = useState('');

  async function loadDocuments() {
    setIsLoading(true);
    setListError('');

    try {
      const result = await listDocuments(owner);
      setDocuments(result);
    } catch (error) {
      setListError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, [owner]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="brand-mark">DMS</p>
          <h1>Document Management</h1>
        </div>

        <label className="owner-field" htmlFor="owner">
          <span>Usuário</span>
          <input
            id="owner"
            value={owner}
            onChange={(event) => setOwner(event.target.value.trimStart() || 'anonymous')}
            placeholder="Identificador do usuário"
          />
        </label>
      </header>

      <div className="workspace">
        <UploadComponent owner={owner} onUploaded={loadDocuments} />
        <DocumentList
          documents={documents}
          owner={owner}
          isLoading={isLoading}
          error={listError}
        />
      </div>
    </main>
  );
}
