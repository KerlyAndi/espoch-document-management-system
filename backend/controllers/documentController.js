const db = require('../config/db');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get all documents
exports.getDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `SELECT d.*, u.name as uploaded_by_name 
       FROM documents d 
       LEFT JOIN users u ON d.uploaded_by = u.id 
       ORDER BY d.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM documents');
    const total = countResult[0].total;

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get document by ID
exports.getDocumentById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, u.name as uploaded_by_name 
       FROM documents d 
       LEFT JOIN users u ON d.uploaded_by = u.id 
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// Create new document
exports.createDocument = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({
        success: false,
        error: 'Título y archivo son requeridos'
      });
    }

    // Insert document into database
    const [result] = await db.query(
      `INSERT INTO documents (title, description, category, tags, file_name, file_path, file_size, mime_type, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        title,
        description || null,
        category || 'general',
        tags || null,
        file.originalname,
        file.path,
        file.size,
        file.mimetype
      ]
    );

    const documentId = result.insertId;

    // Process document with FastAPI (async)
    processDocumentAsync(documentId, file.path);

    res.status(201).json({
      success: true,
      message: 'Documento subido exitosamente',
      data: {
        id: documentId,
        title,
        status: 'pending'
      }
    });
  } catch (err) {
    // Clean up uploaded file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
};

// Update document
exports.updateDocument = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;
    const documentId = req.params.id;

    // Check if document exists
    const [existing] = await db.query('SELECT id FROM documents WHERE id = ?', [documentId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    await db.query(
      `UPDATE documents 
       SET title = ?, description = ?, category = ?, tags = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [title, description, category, tags, documentId]
    );

    res.json({
      success: true,
      message: 'Documento actualizado exitosamente'
    });
  } catch (err) {
    next(err);
  }
};

// Delete document
exports.deleteDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    // Get document info to delete file
    const [rows] = await db.query('SELECT file_path FROM documents WHERE id = ?', [documentId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    const filePath = rows[0].file_path;

    // Delete from database
    await db.query('DELETE FROM documents WHERE id = ?', [documentId]);

    // Delete physical file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });
  } catch (err) {
    next(err);
  }
};

// Download document
exports.downloadDocument = async (req, res, next) => {
  try {
    const documentId = req.params.id;

    const [rows] = await db.query(
      'SELECT file_path, file_name FROM documents WHERE id = ?',
      [documentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Documento no encontrado'
      });
    }

    const { file_path, file_name } = rows[0];

    if (!fs.existsSync(file_path)) {
      return res.status(404).json({
        success: false,
        error: 'Archivo no encontrado en el servidor'
      });
    }

    res.download(file_path, file_name);
  } catch (err) {
    next(err);
  }
};

// Search documents
exports.searchDocuments = async (req, res, next) => {
  try {
    const query = req.params.query;
    const searchTerm = `%${query}%`;

    const [rows] = await db.query(
      `SELECT d.*, u.name as uploaded_by_name 
       FROM documents d 
       LEFT JOIN users u ON d.uploaded_by = u.id 
       WHERE d.title LIKE ? OR d.description LIKE ? OR d.tags LIKE ?
       ORDER BY d.created_at DESC`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.json({
      success: true,
      data: rows,
      query: query
    });
  } catch (err) {
    next(err);
  }
};

// Get documents by status
exports.getDocumentsByStatus = async (req, res, next) => {
  try {
    const status = req.params.status;

    const [rows] = await db.query(
      `SELECT d.*, u.name as uploaded_by_name 
       FROM documents d 
       LEFT JOIN users u ON d.uploaded_by = u.id 
       WHERE d.status = ?
       ORDER BY d.created_at DESC`,
      [status]
    );

    res.json({
      success: true,
      data: rows,
      status: status
    });
  } catch (err) {
    next(err);
  }
};

// Async function to process document with FastAPI
async function processDocumentAsync(documentId, filePath) {
  try {
    console.log(`🔄 Procesando documento ${documentId} con FastAPI...`);

    const response = await axios.post(`${process.env.FASTAPI_URL}/process-document`, {
      documentId: documentId,
      filePath: filePath
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    // Update document with processed data
    await db.query(
      `UPDATE documents 
       SET status = 'processed', processed_data = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [JSON.stringify(response.data), documentId]
    );

    console.log(`✅ Documento ${documentId} procesado exitosamente`);
  } catch (error) {
    console.error(`❌ Error procesando documento ${documentId}:`, error.message);

    // Update document status to error
    await db.query(
      `UPDATE documents 
       SET status = 'error', error_message = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [error.message, documentId]
    );
  }
}

module.exports = exports;
