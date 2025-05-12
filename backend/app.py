from flask import Flask, request
from flask_cors import CORS
from cassandra.cluster import Cluster
from redis import Redis

# Inicializar la aplicación Flask
app = Flask(__name__)

# Configurar CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Conectar a Cassandra (solo para partidos)
cluster = Cluster(['localhost'])
session = cluster.connect('elecciones')

# Conectar a Redis
r = Redis(host='localhost', port=6379, decode_responses=True)

@app.route("/votos")
def votos_por_partido():
    departamento = request.args.get('departamento')
    try:
        # Consultar partidos activos
        partidos = session.execute(
            "SELECT id_partido, nombre, sigla FROM Partido_Politico WHERE estado = 'activo' ALLOW FILTERING"
        )
        partidos_info = {
            str(p.id_partido): {"nombre": p.nombre, "sigla": p.sigla}
            for p in partidos
        }
        conteo = {idp: 0 for idp in partidos_info}

        # Usar totales preagregados en Redis
        departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
        if departamento and departamento != 'todos':
            # Votos por departamento
            for idp in partidos_info:
                votos = r.hget(f'votos_totales:departamento:{departamento}', idp) or 0
                conteo[idp] = int(votos)
        else:
            # Votos nacionales (sumar todos los departamentos)
            for dep in departamentos:
                for idp in partidos_info:
                    votos = r.hget(f'votos_totales:departamento:{dep}', idp) or 0
                    conteo[idp] += int(votos)

        total_votos = sum(conteo.values())
        data = []
        for idp, cantidad in conteo.items():
            if idp in partidos_info:
                info = partidos_info[idp]
                porcentaje = (cantidad / total_votos * 100) if total_votos > 0 else 0
                data.append({
                    "nombre": info["nombre"],
                    "sigla": info["sigla"],
                    "votos": cantidad,
                    "porcentaje": round(porcentaje, 2)
                })
        data.sort(key=lambda x: x["votos"], reverse=True)
        return {"data": data}
    except Exception as e:
        print(f"Error en /votos: {str(e)}")
        return {"error": str(e)}, 500

@app.route("/votos_por_departamento")
def votos_por_departamento():
    try:
        departamentos = ['La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni']
        partidos = session.execute(
            "SELECT id_partido, nombre, sigla FROM Partido_Politico WHERE estado = 'activo' ALLOW FILTERING"
        )
        partidos_info = {
            str(p.id_partido): {"nombre": p.nombre, "sigla": p.sigla}
            for p in partidos
        }
        data = []
        for dep in departamentos:
            conteo = {idp: 0 for idp in partidos_info}
            for idp in partidos_info:
                votos = r.hget(f'votos_totales:departamento:{dep}', idp) or 0
                conteo[idp] = int(votos)
            total_votos = sum(conteo.values())
            if total_votos > 0:
                # Encontrar el partido con más votos
                idp_max = max(conteo, key=conteo.get)
                porcentaje = (conteo[idp_max] / total_votos * 100) if total_votos > 0 else 0
                data.append({
                    "departamento": dep,
                    "partido_ganador": partidos_info[idp_max]["nombre"],
                    "sigla": partidos_info[idp_max]["sigla"],
                    "porcentaje": round(porcentaje, 2)
                })
        return {"data": data}
    except Exception as e:
        print(f"Error en /votos_por_departamento: {str(e)}")
        return {"error": str(e)}, 500

@app.route("/auditoria")
def auditoria():
    try:
        logs = r.xrange('log_auditoria', '-', '+', count=5)
        data = [
            {
                "user_id": log[1]['user_id'],
                "accion": log[1]['accion'],
                "id_mesa": log[1]['id_mesa'],
                "fecha_hora": log[1]['fecha_hora']
            }
            for log in logs
        ]
        return {"data": data}
    except Exception as e:
        print(f"Error en /auditoria: {str(e)}")
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)