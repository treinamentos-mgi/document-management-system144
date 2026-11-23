const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const controller = require('../controllers/documentController');

const storageDirectory = path.join(__dirname, '..', '..', 'storage');
fs.mkdirSync(storageDirectory, { recursive: true });
const maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES) || 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, storageDirectory),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
});

const router = express.Router();

router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

module.exports = router;
