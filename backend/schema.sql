CREATE DATABASE IF NOT EXISTS sas_c4_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sas_c4_db;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    turno ENUM('matutino', 'vespertino', 'nocturno') NOT NULL,
    rol VARCHAR(50) DEFAULT 'supervisor',
    ip_permitida VARCHAR(50) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS envios_c5 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio_c4 VARCHAR(50) UNIQUE NOT NULL,
    fecha_envio DATE NOT NULL,
    hora_envio TIME NOT NULL,
    motivo VARCHAR(255),
    ubicacion VARCHAR(255),
    descripcion TEXT,
    agente VARCHAR(100),
    conclusion TEXT,
    metodo_envio VARCHAR(50) DEFAULT 'whatsapp',
    numero_destino VARCHAR(20),
    usuario_id INT,
    folio_c5 VARCHAR(50),
    estado ENUM('pendiente', 'enviado', 'recibido', 'error') DEFAULT 'pendiente',
    fecha_respuesta DATETIME,
    eliminado_en DATETIME DEFAULT NULL,
    eliminado_por INT DEFAULT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    accion VARCHAR(100) NOT NULL,
    detalles TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
