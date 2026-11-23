# Especificação - Document Management System

## 1. Objetivo

Entregar uma aplicação web mínima em que usuários possam enviar, listar e baixar seus documentos, com metadados em memória e arquivos armazenados localmente no servidor.

## 2. Escopo

### Dentro do escopo

- Upload de documentos por multipart/form-data.
- Associação simples do documento ao identificador informado em `X-User-ID`.
- Listagem dos documentos do usuário.
- Download por identificador.
- Interface React com estados de envio, carregamento, vazio e erro.
- Backend Express organizado em Clean Architecture simples.

### Fora do escopo

- Autenticação, sessões e autorização.
- Banco de dados externo ou armazenamento em nuvem.
- Versionamento, exclusão, edição ou compartilhamento.
- Pesquisa avançada, antivírus, auditoria e administração.

## 3. Requisitos funcionais

| ID | Requisito |
|---|---|
| RF-01 | O usuário pode enviar um arquivo pelo campo multipart `file`. |
| RF-02 | O upload cria um identificador único e registra nome original, tamanho, data/hora e dono. |
| RF-03 | O usuário pode listar documentos associados ao seu identificador. |
| RF-04 | O usuário pode baixar um documento pelo identificador. |
| RF-05 | O frontend atualiza a lista após um upload bem-sucedido. |
| RF-06 | O sistema apresenta erros de upload, documento inexistente e comunicação. |

## 4. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF-01 | Backend Node.js com Express em CommonJS. |
| RNF-02 | Arquivos gravados em `backend/storage` com Multer `diskStorage`. |
| RNF-03 | Metadados mantidos em memória durante a execução. |
| RNF-04 | Nenhum provedor de armazenamento externo é permitido. |
| RNF-05 | Backend dividido em routes, controllers, services e repositories. |
| RNF-06 | Frontend React com componentes funcionais e comunicação por `fetch`. |
| RNF-07 | Configuração por `PORT` e `MAX_FILE_SIZE_BYTES`; padrões `3000` e `10485760`. |
| RNF-08 | Erros HTTP em JSON com código estável e mensagem em português. |

## 5. Modelo de dados

### Documento público

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | string | Sim | Identificador único gerado pelo servidor. |
| `originalName` | string | Sim | Nome original do arquivo enviado. |
| `size` | number | Sim | Tamanho em bytes. |
| `uploadedAt` | string | Sim | Data/hora ISO 8601. |
| `owner` | string | Sim | Identificador informado em `X-User-ID` ou `anonymous`. |

### Metadado interno

O repositório também mantém `storedName`, usado para localizar o arquivo físico. Esse campo nunca é exposto pela API.

Regras:

- O identificador é gerado por `crypto.randomUUID()`.
- O nome físico usa UUID e extensão, não o nome original.
- Arquivos são associados ao usuário apenas pelo campo `owner`; não há autenticação.
- Reiniciar o backend limpa os metadados em memória.

## 6. Contratos de API

### GET /health

Resposta `200`:

```json
{ "status": "ok" }
```

### POST /upload

Entrada: `multipart/form-data`, campo obrigatório `file`, cabeçalho opcional `X-User-ID`.

Resposta `201`:

```json
{
  "id": "string",
  "originalName": "documento.pdf",
  "size": 12345,
  "uploadedAt": "2026-11-23T12:00:00.000Z",
  "owner": "usuario-1"
}
```

Erros:

- `400 FILE_REQUIRED`: nenhum arquivo enviado.
- `413 FILE_TOO_LARGE`: limite excedido.
- `500 UPLOAD_FAILED`: falha ao salvar ou registrar.

### GET /documents

Cabeçalho opcional `X-User-ID`. Resposta `200`:

```json
[
  {
    "id": "string",
    "originalName": "documento.pdf",
    "size": 12345,
    "uploadedAt": "2026-11-23T12:00:00.000Z",
    "owner": "usuario-1"
  }
]
```

Sem documentos, retorna `[]`. A ordem é decrescente por `uploadedAt`.

### GET /documents/:id/download

Resposta `200` com conteúdo binário e `Content-Disposition: attachment`.

Erros:

- `404 DOCUMENT_NOT_FOUND`: metadado ou arquivo físico ausente.
- `500 DOCUMENT_DOWNLOAD_FAILED`: falha na leitura.

### Formato de erro

```json
{
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Documento não encontrado"
  }
}
```

No frontend, todas as rotas são chamadas pelo prefixo `/api`; o proxy do Vite remove esse prefixo e encaminha para o backend na porta `3000`.

## 7. Decisões arquiteturais

- `routes/`: registra endpoints e delega aos controllers.
- `controllers/`: trata entrada HTTP e respostas.
- `services/`: concentra regras de upload, listagem e download.
- `repositories/`: mantém metadados em memória e caminhos locais.
- Fluxo obrigatório: `routes -> controllers -> services -> repositories`.
- O frontend usa `components/`, `services/` e `App.jsx`.
- `UploadComponent`, `DocumentList` e `DownloadButton` são componentes separados.

## 8. Plano de execução

1. Confirmar scripts, dependências e configuração do Vite.
2. Implementar a estrutura backend por rotas, controllers, serviços e repositório.
3. Configurar Multer com `diskStorage` em `backend/storage`.
4. Implementar os contratos de upload, listagem e download.
5. Adicionar testes HTTP para sucesso, isolamento por usuário e erros.
6. Implementar o serviço de API e os componentes React.
7. Integrar frontend e backend pelo proxy `/api`.
8. Executar testes, build e validação manual dos fluxos.

## 9. Critérios de aceitação

- Upload válido cria metadados públicos e grava um arquivo local.
- Listagem filtra por usuário e retorna `[]` sem documentos.
- Download recupera o arquivo correto e usa o nome original no anexo.
- Erros retornam status HTTP, código estável e mensagem em português.
- Não existe persistência externa ou vazamento de `storedName`.
