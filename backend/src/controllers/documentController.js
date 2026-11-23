const service = require('../services/documentService');

function upload(req, res, next) {
  try {
    const owner = service.getOwner(req);
    const document = service.createDocument(req.file, owner);
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
}

function list(req, res, next) {
  try {
    const owner = service.getOwner(req);
    res.json(service.listDocuments(owner));
  } catch (error) {
    next(error);
  }
}

function download(req, res, next) {
  try {
    const owner = service.getOwner(req);
    const { document, filePath } = service.getDownload(owner, req.params.id);

    res.download(filePath, document.originalName, (error) => {
      if (error && !res.headersSent) {
        error.code = 'DOCUMENT_DOWNLOAD_FAILED';
        error.status = 500;
        error.message = 'Falha ao baixar o documento';
        next(error);
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { upload, list, download };
