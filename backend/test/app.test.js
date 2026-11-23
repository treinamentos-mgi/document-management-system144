const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');
const repository = require('../src/repositories/documentRepository');

let server;
let baseUrl;
let existingFiles;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const storageDirectory = path.join(__dirname, '..', 'storage');
  existingFiles = new Set(fs.readdirSync(storageDirectory));
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  repository.clear();
  const storageDirectory = path.join(__dirname, '..', 'storage');
  for (const fileName of fs.readdirSync(storageDirectory)) {
    if (!existingFiles.has(fileName)) {
      fs.rmSync(path.join(storageDirectory, fileName), { force: true });
    }
  }
});

beforeEach(() => repository.clear());

test('responde ao health check', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(await response.json(), { status: 'ok' });
});

test('faz upload e retorna metadados sem expor o nome armazenado', async () => {
  const form = new FormData();
  form.append('file', new Blob(['conteudo']), 'documento.txt');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-ID': 'usuario-1' },
    body: form,
  });

  assert.strictEqual(response.status, 201);
  const document = await response.json();
  assert.strictEqual(document.originalName, 'documento.txt');
  assert.strictEqual(document.owner, 'usuario-1');
  assert.strictEqual(document.size, 8);
  assert.ok(document.id);
  assert.ok(document.uploadedAt);
  assert.equal('storedName' in document, false);
});

test('exige um arquivo no upload', async () => {
  const response = await fetch(`${baseUrl}/upload`, { method: 'POST' });
  assert.strictEqual(response.status, 400);
  assert.deepStrictEqual(await response.json(), {
    error: { code: 'FILE_REQUIRED', message: 'Nenhum arquivo foi enviado' },
  });
});

test('lista apenas documentos do usuário informado', async () => {
  for (const owner of ['usuario-1', 'usuario-2']) {
    const form = new FormData();
    form.append('file', new Blob([owner]), `${owner}.txt`);
    await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-ID': owner },
      body: form,
    });
  }

  const response = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-ID': 'usuario-1' },
  });
  const documents = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(documents.length, 1);
  assert.strictEqual(documents[0].owner, 'usuario-1');
});

test('baixa o documento pelo identificador', async () => {
  const form = new FormData();
  form.append('file', new Blob(['conteudo']), 'arquivo.txt');
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-ID': 'usuario-1' },
    body: form,
  });
  const document = await uploadResponse.json();

  const response = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-ID': 'usuario-1' },
  });

  assert.strictEqual(response.status, 200);
  assert.match(response.headers.get('content-disposition'), /arquivo\.txt/);
  assert.strictEqual(await response.text(), 'conteudo');
});

test('retorna 404 para documento inexistente ou de outro usuário', async () => {
  const response = await fetch(`${baseUrl}/documents/id-inexistente/download`, {
    headers: { 'X-User-ID': 'usuario-1' },
  });

  assert.strictEqual(response.status, 404);
  assert.deepStrictEqual(await response.json(), {
    error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado' },
  });
});
