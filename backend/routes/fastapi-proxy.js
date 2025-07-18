const express = require('express');
const axios = require('axios');
const router = express.Router();

// Proxy to FastAPI service for document processing
router.post('/process/:docId', async (req, res, next) => {
  try {
    const documentId = req.params.docId;
    const { filePath, options } = req.body;

    if (!process.env.FASTAPI_URL) {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }

    const response = await axios.post(`${process.env.FASTAPI_URL}/process-document`, {
      documentId: documentId,
      filePath: filePath,
      options: options || {}
    }, {
      timeout: 30000 // 30 seconds
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }
    next(err);
  }
});

// Get processing status
router.get('/status/:docId', async (req, res, next) => {
  try {
    const documentId = req.params.docId;

    if (!process.env.FASTAPI_URL) {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }

    const response = await axios.get(`${process.env.FASTAPI_URL}/status/${documentId}`, {
      timeout: 10000
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }
    next(err);
  }
});

// Extract text from document
router.post('/extract-text', async (req, res, next) => {
  try {
    const { filePath, documentType } = req.body;

    if (!process.env.FASTAPI_URL) {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }

    const response = await axios.post(`${process.env.FASTAPI_URL}/extract-text`, {
      filePath: filePath,
      documentType: documentType
    }, {
      timeout: 30000
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }
    next(err);
  }
});

// Generate document summary
router.post('/summarize', async (req, res, next) => {
  try {
    const { text, maxLength } = req.body;

    if (!process.env.FASTAPI_URL) {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }

    const response = await axios.post(`${process.env.FASTAPI_URL}/summarize`, {
      text: text,
      maxLength: maxLength || 200
    }, {
      timeout: 30000
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Servicio de procesamiento no disponible'
      });
    }
    next(err);
  }
});

// Health check for FastAPI service
router.get('/health', async (req, res, next) => {
  try {
    if (!process.env.FASTAPI_URL) {
      return res.status(503).json({
        success: false,
        error: 'URL de FastAPI no configurada'
      });
    }

    const response = await axios.get(`${process.env.FASTAPI_URL}/health`, {
      timeout: 5000
    });

    res.json({
      success: true,
      message: 'Servicio FastAPI disponible',
      data: response.data
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Servicio FastAPI no disponible'
      });
    }
    next(err);
  }
});

module.exports = router;
