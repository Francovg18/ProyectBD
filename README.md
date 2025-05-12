   # ProyectBD - Sistema de Votación Electrónica

   Sistema para monitorear resultados electorales en Bolivia, con backend en Flask, frontend en React, y almacenamiento en Cassandra y Redis.

   ## Requisitos

   - Python 3.8+
   - Node.js 18+
   - Cassandra
   - Redis
   - Git

   ## Instalación

   1. Clonar el repositorio:
      ```bash
      git clone https://github.com/Francovg18/ProyectBD
      cd ProyectBD
      ```

   2. Cambiar al branch `version2`:
      ```bash
      git checkout version2
      ```

   3. Configurar el entorno de Python:
      ```bash
      python3 -m venv venv
      source venv/bin/activate
      pip install -r requirements.txt
      ```

   4. Configurar el frontend:
      ```bash
      cd frontend
      npm install
      ```

   5. Iniciar servicios:
      - Cassandra: `sudo systemctl start cassandra`
      - Redis: `redis-server`
      - Backend: `python3 backend/app.py`
      - Frontend: `cd frontend && npm run dev`

   6. Generar datos:
      ```bash
      cd db
      python3 generate_data.py
      ```

   7. Acceder al dashboard:
      Abre `http://localhost:5173` en tu navegador.

   ## Estructura del proyecto

   - `backend/`: API Flask (`app.py`).
   - `db/`: Scripts para generar datos (`generate_data.py`, `cassandra_datos1.cql`, `cassandra_datos2.cql`).
   - `frontend/`: Aplicación React con Vite.
   - `requirements.txt`: Dependencias de Python.
   - `.gitignore`: Archivos ignorados por Git.

   ## Notas

   - Solo los partidos activos aparecen en el dashboard.
   - Usa `NUM_MESAS = 35000` en `generate_data.py` para pruebas finales.
