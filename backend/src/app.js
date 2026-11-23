const express = require('express');
const multer = require('multer');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(documentRoutes);

app.use((error, req, res, next) => {
  let status = error.status || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message || 'Erro interno';

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      code = 'FILE_TOO_LARGE';
      message = 'Arquivo excede o tamanho permitido';
    } else {
      status = 400;
      code = 'UPLOAD_FAILED';
      message = 'Falha ao processar o arquivo enviado';
    }
  } else if (code === 'ENOENT') {
    status = 404;
    code = 'DOCUMENT_NOT_FOUND';
    message = 'Documento não encontrado';
  } else if (status === 500 && code === 'INTERNAL_ERROR') {
    code = 'DOCUMENT_DOWNLOAD_FAILED';
  }

  res.status(status).json({ error: { code, message } });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
