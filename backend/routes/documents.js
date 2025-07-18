const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx|ppt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Routes
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/', upload.single('file'), documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/download', documentController.downloadDocument);

// Search documents
router.get('/search/:query', documentController.searchDocuments);

// Get documents by status
router.get('/status/:status', documentController.getDocumentsByStatus);

module.exports = router;
