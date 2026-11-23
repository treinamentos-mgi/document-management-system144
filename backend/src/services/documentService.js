const crypto = require('node:crypto');
const fs = require('node:fs');
const repository = require('../repositories/documentRepository');

function getOwner(req) {
  const owner = req.get('X-User-ID')?.trim();
  return owner || 'anonymous';
}

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function createDocument(file, owner) {
  if (!file) {
    const error = new Error('Nenhum arquivo foi enviado');
    error.code = 'FILE_REQUIRED';
    error.status = 400;
    throw error;
  }

  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };

  repository.create(document);
  return toPublicDocument(document);
}

function listDocuments(owner) {
  return repository.findByOwner(owner).map(toPublicDocument);
}

function getDownload(owner, id) {
  const document = repository.findByIdAndOwner(id, owner);
  if (!document) {
    const error = new Error('Documento não encontrado');
    error.code = 'DOCUMENT_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const filePath = repository.getStoredFilePath(document.storedName);
  if (!fs.existsSync(filePath)) {
    const error = new Error('Documento não encontrado');
    error.code = 'DOCUMENT_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  return { document, filePath };
}

module.exports = { getOwner, createDocument, listDocuments, getDownload };