const path = require('node:path');

const documents = [];

function create(document) {
  documents.push(document);
  return document;
}

function findByOwner(owner) {
  return documents
    .filter((document) => document.owner === owner)
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}

function findByIdAndOwner(id, owner) {
  return documents.find(
    (document) => document.id === id && document.owner === owner,
  );
}

function getStoredFilePath(storedName) {
  return path.join(__dirname, '..', '..', 'storage', storedName);
}

function clear() {
  documents.splice(0, documents.length);
}

module.exports = { create, findByOwner, findByIdAndOwner, getStoredFilePath, clear };