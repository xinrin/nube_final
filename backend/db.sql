CREATE DATABASE reportes;

use reportes;

CREATE TABLE Reportes (
  num_reporte int NOT NULL AUTO_INCREMENT,
  fecha date NULL,
  hora time NULL,
  canal varchar(100) NULL,
  estación varchar(100) NULL,
  tipo varchar(50) NULL,
  id_reporte varchar(50) NULL,
  urgencia varchar(20) NULL,
  solución varchar(80) NULL,
  usuario varchar(50) NULL,
  status varchar(50) NULL,
  PRIMARY KEY (num_reporte)
);


CREATE TABLE Encuestas (
  Resolucion varchar(20) NOT NULL,
  Tiempo varchar(50) NOT NULL,
  Comunicacion varchar(20) NOT NULL,
  Amabilidad varchar(20) NOT NULL,
  Satisfaccion varchar(20) NOT NULL,
  Recomendacion varchar(20) NOT NULL,
  Comentario text NULL,
  Usuario varchar(50) NOT NULL,
  FechaCreacion datetime NULL
);


CREATE TABLE Sesiones (
  id_sesion int NOT NULL AUTO_INCREMENT,
  usuario varchar(50) NOT NULL,
  fecha_inicio date NOT NULL,
  hora_inicio time NOT NULL,
  fecha_cierre date NULL,
  hora_cierre time NULL,
  sesion_activa bit NOT NULL,
  PRIMARY KEY (id_sesion)
);


CREATE TABLE Usuarios (
  usuario varchar(50) NOT NULL,
  contrasena varchar(255) NOT NULL,
  jerarquia int NOT NULL
);


INSERT INTO Usuarios (usuario, contrasena, jerarquia)
VALUES
  ('cesar', '123456789', 4),
  ('alex', '123456789', 4),
  ('supervisor', '123456789', 2),
  ('david', '123456789', 4);


select * from Usuarios;
select * from Sesiones;