/*
Script para crear la base de datos en Cassandra 
*/


/*
Instrucciones:

Ejecutar en cqlsh: 

cqlsh> -f cassandra_setup.cql

o Ejecutar en NoSQL Manager for cassandra todo el contenido: 
*/


-- 1. Crear keyspace 'elecciones' 

CREATE KEYSPACE IF NOT EXISTS elecciones
WITH replication = {
'class': 'SimpleStrategy',
'replication_factor': '1'
};

-- 2. Usar el keyspace 'elecciones'
USE elecciones;

-- 3. Definir tabla Mesa_Electoral

CREATE TABLE IF NOT EXISTS Mesa_Electoral (
id_mesa uuid,
departamento text,
municipio text,
recinto text,
nro_mesa int,
estado text,
PRIMARY KEY ((departamento, municipio), id_mesa)
);

-- 4. Definir tabla Partido_Politico

CREATE TABLE IF NOT EXISTS Partido_Politico (
id_partido uuid PRIMARY KEY,
nombre text,
sigla text,
estado text
);

-- 5. Definir tabla Votos (conteo por mesa y partido)

CREATE TABLE IF NOT EXISTS Votos (
id_mesa uuid,
id_partido uuid,
fecha_hora timestamp,
votos int,
user_id text,
PRIMARY KEY (id_mesa, id_partido)
) WITH CLUSTERING ORDER BY (id_partido ASC);

-- 6. Definir tabla Log_Auditoria

CREATE TABLE IF NOT EXISTS Log_Auditoria (
  user_id text,
  fecha_hora timestamp,
  accion text,
  partido_afectado uuid,
  id_mesa uuid,
  id_log timeuuid,
  PRIMARY KEY (user_id, fecha_hora)
) WITH CLUSTERING ORDER BY (fecha_hora DESC);


