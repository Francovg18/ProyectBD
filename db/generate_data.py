import pandas as pd
import uuid
import random
from datetime import datetime, timedelta
from cassandra.cluster import Cluster
from redis import Redis
import os

# Configuración
NUM_MESAS = 1000  # Cambiar a 35000 para pruebas finales
NUM_AUDITORIAS = 50  # Reducido proporcionalmente

# Conectar a Cassandra
cluster = Cluster(['localhost'])
session = cluster.connect('elecciones')

# Conectar a Redis
r = Redis(host='localhost', port=6379, decode_responses=True)

# Crear directorio para CSVs
os.makedirs('data', exist_ok=True)

# Generar datos para Mesa_Electoral
departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
mesas_data = []
for i in range(NUM_MESAS):
    id_mesa = str(uuid.uuid4())
    departamento = random.choice(departamentos)
    municipio = f"Municipio_{random.randint(1, 20)}"
    recinto = f"Recinto_{random.randint(1, 10)}"
    mesas_data.append({
        'id_mesa': id_mesa,
        'departamento': departamento,
        'municipio': municipio,
        'recinto': recinto
    })
mesas_df = pd.DataFrame(mesas_data)
mesas_df.to_csv('data/mesas.csv', index=False)

# Insertar en Cassandra
for _, row in mesas_df.iterrows():
    session.execute(
        """
        INSERT INTO Mesa_Electoral (id_mesa, departamento, municipio, recinto)
        VALUES (%s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_mesa']), row['departamento'], row['municipio'], row['recinto'])
    )

# Generar datos para Partido_Politico
partidos_data = [
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Movimiento al Socialismo', 'sigla': 'MAS', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Frente para la Victoria', 'sigla': 'FPV', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Movimiento Nacionalista Revolucionario', 'sigla': 'MNR', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Frente Revolucionario de Izquierda', 'sigla': 'FRI', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Unidad Nacional', 'sigla': 'UN', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Partido Demócrata Cristiano', 'sigla': 'PDC', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Morena', 'sigla': 'MORENA', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Acción Democrática Nacionalista', 'sigla': 'ADN', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Pan-Bol', 'sigla': 'PAN-BOL', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Nueva Generación Política', 'sigla': 'NGP', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Creemos', 'sigla': 'CREEMOS', 'estado': 'activo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Comunidad Ciudadana', 'sigla': 'CC', 'estado': 'inactivo'},
    {'id_partido': str(uuid.uuid4()), 'nombre': 'Bolivia Súmate', 'sigla': 'SUMATE', 'estado': 'activo'}
]
partidos_df = pd.DataFrame(partidos_data)
partidos_df.to_csv('data/partidos.csv', index=False)

# Insertar en Cassandra
for _, row in partidos_df.iterrows():
    session.execute(
        """
        INSERT INTO Partido_Politico (id_partido, nombre, sigla, estado)
        VALUES (%s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_partido']), row['nombre'], row['sigla'], row['estado'])
    )

# Generar datos para Votos con distribución ponderada
pesos = {
    'Bolivia Súmate': 12,
    'Unidad Nacional': 18,
    'Frente Revolucionario de Izquierda': 18,
    'Nueva Generación Política': 15,
    'Frente para la Victoria': 12,
    'Creemos': 10,
    'Movimiento al Socialismo': 8,
    'Partido Demócrata Cristiano': 5,
    'Morena': 2,
    'Pan-Bol': 2
}
partidos_ids = {row['sigla']: row['id_partido'] for _, row in partidos_df.iterrows() if row['estado'] == 'activo'}
votos_data = []
base_time = datetime.now() - timedelta(days=1)
for id_mesa in mesas_df['id_mesa']:
    total_votos_mesa = random.randint(50, 200)  # Total de votos por mesa
    votos_por_partido = random.choices(
        list(pesos.keys()),
        weights=list(pesos.values()),
        k=total_votos_mesa
    )
    conteo = {nombre: votos_por_partido.count(nombre) for nombre in pesos.keys()}
    for nombre, votos in conteo.items():
        id_partido = partidos_ids[partidos_df[partidos_df['nombre'] == nombre]['sigla'].iloc[0]]
        fecha_hora = (base_time + timedelta(minutes=random.randint(0, 1440))).strftime('%Y-%m-%d %H:%M:%S')
        votos_data.append({
            'id_mesa': id_mesa,
            'id_partido': id_partido,
            'votos': votos,
            'fecha_hora': fecha_hora
        })
votos_df = pd.DataFrame(votos_data)
votos_df.to_csv('data/votos.csv', index=False)

# Insertar en Cassandra
for _, row in votos_df.iterrows():
    session.execute(
        """
        INSERT INTO Votos (id_mesa, id_partido, votos, fecha_hora)
        VALUES (%s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_mesa']), uuid.UUID(row['id_partido']), row['votos'], row['fecha_hora'])
    )

# Actualizar Redis
votos_por_departamento = {}
for id_mesa in votos_df['id_mesa'].unique():
    mesa = mesas_df[mesas_df['id_mesa'] == id_mesa].iloc[0]
    departamento = mesa['departamento']
    votos_mesa = votos_df[votos_df['id_mesa'] == id_mesa]
    for _, row in votos_mesa.iterrows():
        id_partido = row['id_partido']
        votos = row['votos']
        # Totales por departamento
        if departamento not in votos_por_departamento:
            votos_por_departamento[departamento] = {}
        votos_por_departamento[departamento][id_partido] = votos_por_departamento[departamento].get(id_partido, 0) + votos
        # Votos por mesa
        r.hincrby(f'votos_actuales:mesa:{id_mesa}', id_partido, votos)
        # Histórico
        r.zadd(f'votos_hist:mesa:{id_mesa}:{id_partido}', {str(votos): int(datetime.strptime(row['fecha_hora'], '%Y-%m-%d %H:%M:%S').timestamp() * 1000)})

# Guardar totales por departamento en Redis
for departamento, partidos in votos_por_departamento.items():
    for id_partido, total in partidos.items():
        r.hset(f'votos_totales:departamento:{departamento}', id_partido, total)

# Generar datos para Log_Auditoria
auditoria_data = []
for _ in range(NUM_AUDITORIAS):
    id_mesa = random.choice(mesas_df['id_mesa'].tolist())
    user_id = f"Usuario_{random.randint(1, 20)}"
    accion = random.choice(['inserción', 'edición', 'eliminación'])
    partido_afectado = random.choice([row['id_partido'] for _, row in partidos_df.iterrows() if row['estado'] == 'activo'])
    fecha_hora = (base_time + timedelta(minutes=random.randint(0, 1440))).strftime('%Y-%m-%d %H:%M:%S')
    auditoria_data.append({
        'id_mesa': id_mesa,
        'user_id': user_id,
        'accion': accion,
        'partido_afectado': partido_afectado,
        'fecha_hora': fecha_hora
    })
auditoria_df = pd.DataFrame(auditoria_data)
auditoria_df.to_csv('data/auditoria.csv', index=False)

# Insertar en Cassandra
for _, row in auditoria_df.iterrows():
    session.execute(
        """
        INSERT INTO Log_Auditoria (id_mesa, user_id, accion, partido_afectado, fecha_hora)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (uuid.UUID(row['id_mesa']), row['user_id'], row['accion'], uuid.UUID(row['partido_afectado']), row['fecha_hora'])
    )

# Actualizar Redis (auditoría)
for _, row in auditoria_df.iterrows():
    r.xadd('log_auditoria', {
        'user_id': row['user_id'],
        'accion': row['accion'],
        'partido_afectado': row['partido_afectado'],
        'id_mesa': row['id_mesa'],
        'fecha_hora': row['fecha_hora']
    })

print("Datos generados e importados a Cassandra y Redis. Archivos CSV guardados.")