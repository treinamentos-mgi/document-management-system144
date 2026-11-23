const API_BASE_URL = '/api';

function getErrorMessage(payload, fallback) {
  return payload?.error?.message || fallback;
}

async function readJson(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getErrorMessage(payload, 'Não foi possível concluir a operação'));
  }
  return payload;
}

export async function uploadDocument(file, owner) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'X-User-ID': owner || 'anonymous' },
    body: formData,
  });

  return readJson(response);
}

export async function listDocuments(owner) {
  const response = await fetch(`${API_BASE_URL}/documents`, {
    headers: { 'X-User-ID': owner || 'anonymous' },
  });

  return readJson(response);
}

export async function downloadDocument(id, owner) {
  const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    headers: { 'X-User-ID': owner || 'anonymous' },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(getErrorMessage(payload, 'Não foi possível baixar o documento'));
  }

  const disposition = response.headers.get('Content-Disposition') || '';
  const encodedName = disposition.match(/filename="([^"]+)"/i)?.[1];

  return {
    blob: await response.blob(),
    fileName: encodedName || 'documento',
  };
}
