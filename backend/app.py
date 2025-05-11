from flask import Flask
from flask_cors import CORS
from database.cassandra_conn import session

app = Flask(__name__)
CORS(app)


@app.route("/votos")
def votos_por_partido():
    votos = session.execute("SELECT id_partido, cantidad FROM votos")
    partidos = session.execute(
        "SELECT id_partido, nombre, sigla FROM partido_politico")

    partidos_info = {
        str(p.id_partido): {"nombre": p.nombre, "sigla": p.sigla}
        for p in partidos
    }

    # Inicializar votos
    conteo = {idp: 0 for idp in partidos_info}

    # Sumar votos por partido
    for row in votos:
        idp = str(row.id_partido)
        if idp in conteo:
            conteo[idp] += row.cantidad

    total_votos = sum(conteo.values())

    # Construir respuesta
    data = []
    for idp, cantidad in conteo.items():
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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
