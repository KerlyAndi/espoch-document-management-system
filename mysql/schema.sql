-- ESPOCH Document Management System Database Schema
-- Created for Universidad ESPOCH - Sistema de Gestión de Documentos

-- Create database
CREATE DATABASE IF NOT EXISTS espoch_docs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE espoch_docs;

-- Users table (Docentes)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_department (department)
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    status ENUM('pending', 'processing', 'processed', 'error') DEFAULT 'pending',
    uploaded_by INT,
    processed_data JSON,
    error_message TEXT,
    download_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_title (title),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_created_at (created_at),
    FULLTEXT idx_search (title, description, tags)
);

-- Document versions table (for version control)
CREATE TABLE IF NOT EXISTS document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    version_number INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    changes_description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_version (document_id, version_number),
    INDEX idx_document_id (document_id)
);

-- Document shares table (for sharing documents between users)
CREATE TABLE IF NOT EXISTS document_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_with INT NOT NULL,
    permission ENUM('read', 'write', 'admin') DEFAULT 'read',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_share (document_id, shared_with),
    INDEX idx_document_id (document_id),
    INDEX idx_shared_with (shared_with)
);

-- Document comments table
CREATE TABLE IF NOT EXISTS document_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    parent_comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES document_comments(id) ON DELETE CASCADE,
    INDEX idx_document_id (document_id),
    INDEX idx_user_id (user_id)
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50),
    parent_id INT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort_order (sort_order)
);

-- Insert default categories
INSERT INTO categories (name, description, color, icon) VALUES
('Académico', 'Documentos académicos y planes de estudio', '#3B82F6', 'academic-cap'),
('Administrativo', 'Documentos administrativos y oficiales', '#10B981', 'clipboard-document'),
('Investigación', 'Documentos de investigación y proyectos', '#8B5CF6', 'beaker'),
('Reglamentos', 'Reglamentos y normativas institucionales', '#F59E0B', 'scale'),
('Reportes', 'Reportes y estadísticas', '#EF4444', 'chart-bar'),
('Recursos', 'Recursos educativos y materiales', '#06B6D4', 'book-open');

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, department, position) VALUES
('Administrador ESPOCH', 'admin@espoch.edu.ec', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sistemas', 'Administrador del Sistema');

-- Insert sample documents
INSERT INTO documents (title, description, category, tags, file_name, file_path, file_size, mime_type, status, uploaded_by) VALUES
('Plan Estratégico ESPOCH 2024-2028', 'Plan estratégico institucional para el período 2024-2028', 'Académico', 'plan,estratégico,2024,institucional', 'plan_estrategico_2024.pdf', 'uploads/sample/plan_estrategico_2024.pdf', 2048576, 'application/pdf', 'processed', 1),
('Reglamento Académico Vigente', 'Reglamento académico actualizado de la universidad', 'Reglamentos', 'reglamento,académico,normativa', 'reglamento_academico.pdf', 'uploads/sample/reglamento_academico.pdf', 1536000, 'application/pdf', 'processed', 1),
('Manual de Procedimientos Administrativos', 'Manual con todos los procedimientos administrativos', 'Administrativo', 'manual,procedimientos,administrativo', 'manual_procedimientos.docx', 'uploads/sample/manual_procedimientos.docx', 1024000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'processed', 1);

-- Create views for common queries
CREATE VIEW document_summary AS
SELECT 
    d.id,
    d.title,
    d.category,
    d.status,
    d.created_at,
    u.name as uploaded_by_name,
    u.department,
    d.download_count,
    CASE 
        WHEN d.processed_data IS NOT NULL THEN JSON_UNQUOTE(JSON_EXTRACT(d.processed_data, '$.summary'))
        ELSE SUBSTRING(d.description, 1, 200)
    END as summary
FROM documents d
LEFT JOIN users u ON d.uploaded_by = u.id
WHERE d.status != 'error';

-- Create stored procedures
DELIMITER //

CREATE PROCEDURE GetUserDocuments(IN user_id INT, IN limit_count INT, IN offset_count INT)
BEGIN
    SELECT 
        d.*,
        u.name as uploaded_by_name,
        c.name as category_name,
        c.color as category_color
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by = u.id
    LEFT JOIN categories c ON d.category = c.name
    WHERE d.uploaded_by = user_id
    ORDER BY d.created_at DESC
    LIMIT limit_count OFFSET offset_count;
END //

CREATE PROCEDURE SearchDocuments(IN search_term VARCHAR(255), IN limit_count INT)
BEGIN
    SELECT 
        d.*,
        u.name as uploaded_by_name,
        c.name as category_name,
        c.color as category_color,
        MATCH(d.title, d.description, d.tags) AGAINST(search_term IN NATURAL LANGUAGE MODE) as relevance
    FROM documents d
    LEFT JOIN users u ON d.uploaded_by = u.id
    LEFT JOIN categories c ON d.category = c.name
    WHERE MATCH(d.title, d.description, d.tags) AGAINST(search_term IN NATURAL LANGUAGE MODE)
       OR d.title LIKE CONCAT('%', search_term, '%')
       OR d.description LIKE CONCAT('%', search_term, '%')
    ORDER BY relevance DESC, d.created_at DESC
    LIMIT limit_count;
END //

CREATE PROCEDURE LogActivity(
    IN p_user_id INT,
    IN p_action VARCHAR(100),
    IN p_resource_type VARCHAR(50),
    IN p_resource_id INT,
    IN p_details JSON,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    INSERT INTO activity_log (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent);
END //

DELIMITER ;

-- Create triggers
DELIMITER //

CREATE TRIGGER update_document_timestamp
    BEFORE UPDATE ON documents
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END //

CREATE TRIGGER log_document_creation
    AFTER INSERT ON documents
    FOR EACH ROW
BEGIN
    INSERT INTO activity_log (user_id, action, resource_type, resource_id, details)
    VALUES (NEW.uploaded_by, 'CREATE', 'document', NEW.id, JSON_OBJECT('title', NEW.title, 'category', NEW.category));
END //

CREATE TRIGGER log_document_update
    AFTER UPDATE ON documents
    FOR EACH ROW
BEGIN
    IF OLD.title != NEW.title OR OLD.description != NEW.description OR OLD.category != NEW.category THEN
        INSERT INTO activity_log (user_id, action, resource_type, resource_id, details)
        VALUES (NEW.uploaded_by, 'UPDATE', 'document', NEW.id, JSON_OBJECT('title', NEW.title, 'old_title', OLD.title));
    END IF;
END //

CREATE TRIGGER log_document_deletion
    BEFORE DELETE ON documents
    FOR EACH ROW
BEGIN
    INSERT INTO activity_log (user_id, action, resource_type, resource_id, details)
    VALUES (OLD.uploaded_by, 'DELETE', 'document', OLD.id, JSON_OBJECT('title', OLD.title, 'category', OLD.category));
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_documents_fulltext ON documents(title, description);
CREATE INDEX idx_activity_log_composite ON activity_log(user_id, action, created_at);
CREATE INDEX idx_document_shares_composite ON document_shares(shared_with, permission);

-- Show table information
SELECT 
    TABLE_NAME as 'Tabla',
    TABLE_ROWS as 'Filas',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamaño (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'espoch_docs'
ORDER BY TABLE_NAME;

-- Show successful creation message
SELECT 'Base de datos ESPOCH creada exitosamente' as 'Estado';
