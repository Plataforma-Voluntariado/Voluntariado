DROP DATABASE IF EXISTS bd_voluntariado;

CREATE DATABASE bd_voluntariado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bd_voluntariado;

CREATE TABLE Departamento (
    id_departamento INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    departamento VARCHAR(255) NOT NULL
);

CREATE TABLE Ciudad (
    id_ciudad INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ciudad VARCHAR(255) NOT NULL,
    id_departamento INT UNSIGNED NOT NULL,
    CONSTRAINT fk_ciudad_departamento FOREIGN KEY (id_departamento) REFERENCES Departamento (id_departamento)
);

CREATE TABLE Usuario (
    id_usuario BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    verificacion BOOLEAN NOT NULL DEFAULT FALSE,
    estado ENUM('ACTIVO', 'BLOQUEADO') NOT NULL DEFAULT 'ACTIVO',
    rol ENUM(
        'ADMIN',
        'VOLUNTARIO',
        'CREADOR'
    ) NOT NULL,
    url_image VARCHAR(255),
    id_ciudad INT UNSIGNED NOT NULL,
    CONSTRAINT fk_usuario_ciudad FOREIGN KEY (id_ciudad) REFERENCES Ciudad (id_ciudad)
);

CREATE TABLE Administrador (
    id_usuario BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Verificacion (
    id_verificacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    estado ENUM(
        'PENDIENTE',
        'ACEPTADO',
        'RECHAZADO'
    ) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_revision DATETIME,
    admin_id BIGINT UNSIGNED,
    observaciones TEXT,
    CONSTRAINT fk_verificacion_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario (id_usuario),
    CONSTRAINT fk_verificacion_admin FOREIGN KEY (admin_id) REFERENCES Administrador (id_usuario)
);

CREATE TABLE Verificacion_Archivo (
    id_verificacion_archivo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    verificacion_id BIGINT UNSIGNED NOT NULL,
    tipo_documento ENUM('CEDULA', 'CAMARA_COMERCIO') NOT NULL,
    ruta_archivo VARCHAR(255) NOT NULL,
    estado ENUM('ACTIVO', 'ELIMINADO') NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_va_verificacion FOREIGN KEY (verificacion_id) REFERENCES Verificacion (id_verificacion)
);

CREATE TABLE Voluntario (
    id_usuario BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    CONSTRAINT fk_voluntario_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Creador (
    id_usuario BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    tipo_creador ENUM(
        'PERSONA_NATURAL',
        'ORGANIZACION'
    ),
    CONSTRAINT fk_creador_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Persona_Natural (
    id_usuario BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    CONSTRAINT fk_persona_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Organizacion (
    id_usuario BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    nombre_entidad VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    CONSTRAINT fk_organizacion_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Habilidades (
    id_habilidad BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    habilidad VARCHAR(255) NOT NULL
);

CREATE TABLE Voluntario_habilidades (
    id_usuario BIGINT UNSIGNED NOT NULL,
    id_habilidad BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (id_usuario, id_habilidad),
    CONSTRAINT fk_vh_usuario FOREIGN KEY (id_usuario) REFERENCES Voluntario (id_usuario),
    CONSTRAINT fk_vh_habilidad FOREIGN KEY (id_habilidad) REFERENCES Habilidades (id_habilidad)
);

CREATE TABLE Token (
    id_token BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATETIME NOT NULL,
    tipo ENUM(
        'RECUPERAR_CONTRASENA',
        'CONFIRMAR_CORREO',
        'CONFIRMAR_CELULAR'
    ) NOT NULL,
    estado ENUM('ACTIVO', 'EXPIRADO', 'USADO') NOT NULL DEFAULT 'ACTIVO',
    intentos_restantes INT NOT NULL DEFAULT 3,
    CONSTRAINT fk_token_usuario FOREIGN KEY (id_usuario) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Categoria (
    id_categoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE Voluntariado (
    id_voluntariado BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    categoria_id BIGINT UNSIGNED NOT NULL,
    horas INT UNSIGNED NOT NULL,
    estado ENUM(
        'PENDIENTE',
        'REALIZADO',
        'NO_REALIZADO',
        'CANCELADO'
    ) NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_voluntariado_categoria FOREIGN KEY (categoria_id) REFERENCES Categoria (id_categoria)
);

CREATE TABLE Certificado (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    voluntario_id BIGINT UNSIGNED NOT NULL,
    voluntariado_id BIGINT UNSIGNED NOT NULL,
    fecha_emision datetime NOT NULL,
    pdf VARCHAR(255),
    CONSTRAINT fk_certificado_voluntario FOREIGN KEY (voluntario_id) REFERENCES Voluntario (id_usuario),
    CONSTRAINT fk_certificado_voluntariado FOREIGN KEY (voluntariado_id) REFERENCES Voluntariado (id_voluntariado)
);

CREATE TABLE Fotos (
    id_foto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    voluntariado_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_foto_voluntariado FOREIGN KEY (voluntariado_id) REFERENCES Voluntariado (id_voluntariado)
);

CREATE TABLE Ubicacion (
    voluntariado_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    direccion VARCHAR(256) NOT NULL,
    ciudad_id INT unsigned NOT NULL,
    zona ENUM('RURAL', 'URBANA') NOT NULL,
    CONSTRAINT fk_ubicacion_voluntariado FOREIGN KEY (voluntariado_id) REFERENCES Voluntariado (id_voluntariado),
    CONSTRAINT fk_ubicacion_ciudad FOREIGN KEY (ciudad_id) REFERENCES Ciudad (id_ciudad)
);

CREATE TABLE Inscripcion (
    id_inscripcion INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    voluntario_id BIGINT UNSIGNED NOT NULL,
    voluntariado_id BIGINT UNSIGNED NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    estado_inscripcion ENUM(
        'PENDIENTE',
        'ACEPTADA',
        'CANCELADA',
        'RECHAZADA'
    ) NOT NULL,
    asistencia ENUM('ASISTIO', 'NO_ASISTIO') DEFAULT NULL,
    CONSTRAINT fk_inscripcion_voluntario FOREIGN KEY (voluntario_id) REFERENCES Voluntario (id_usuario),
    CONSTRAINT fk_inscripcion_voluntariado FOREIGN KEY (voluntariado_id) REFERENCES Voluntariado (id_voluntariado)
);

CREATE TABLE Notificacion (
    id_notificacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT UNSIGNED NOT NULL,
    mensaje VARCHAR(255),
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    visto BOOL NOT NULL DEFAULT FALSE,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Chat (
    id_chat BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    voluntario_id BIGINT UNSIGNED NOT NULL,
    creador_id BIGINT UNSIGNED NOT NULL,
    voluntariado_id BIGINT UNSIGNED NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_voluntario FOREIGN KEY (voluntario_id) REFERENCES Voluntario (id_usuario),
    CONSTRAINT fk_chat_creador FOREIGN KEY (creador_id) REFERENCES Creador (id_usuario),
    CONSTRAINT fk_chat_voluntariado FOREIGN KEY (voluntariado_id) REFERENCES Voluntariado (id_voluntariado),
    UNIQUE (
        voluntario_id,
        creador_id,
        voluntariado_id
    )
);

CREATE TABLE Chat_Mensaje (
    id_mensaje BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_chat BIGINT UNSIGNED NOT NULL,
    remitente_id BIGINT UNSIGNED NOT NULL,
    mensaje TEXT NOT NULL,
    fecha_envio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    visto BOOL NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_chat_mensaje_chat FOREIGN KEY (id_chat) REFERENCES Chat (id_chat),
    CONSTRAINT fk_chat_mensaje_usuario FOREIGN KEY (remitente_id) REFERENCES Usuario (id_usuario)
);

CREATE TABLE Horario (
    id_horario INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL
);

CREATE TABLE Usuario_Horario (
    usuario_id BIGINT UNSIGNED NOT NULL,
    id_horario INT UNSIGNED NOT NULL,
    dia_semana ENUM(
        'LUNES',
        'MARTES',
        'MIERCOLES',
        'JUEVES',
        'VIERNES',
        'SABADO',
        'DOMINGO'
    ) NOT NULL,
    PRIMARY KEY (
        usuario_id,
        id_horario,
        dia_semana
    ),
    CONSTRAINT fk_uh_usuario FOREIGN KEY (usuario_id) REFERENCES Usuario (id_usuario),
    CONSTRAINT fk_uh_horario FOREIGN KEY (id_horario) REFERENCES Horario (id_horario)
);