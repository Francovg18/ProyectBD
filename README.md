# ProyectBD - Sistema de Votación Electrónica

Este proyecto es un sistema para monitorear resultados electorales en Bolivia. Utiliza un backend en Flask (Python), un frontend en React, y almacena datos en Apache Cassandra y Redis. Este `README.md` está diseñado para guiar a usuarios con poca experiencia en Git, WSL2, React, Python, Bash o Linux, con instrucciones detalladas y claras.

## Requisitos

Antes de empezar, asegúrate de tener instalado lo siguiente en tu sistema (preferiblemente WSL2 en Windows 11):

- **Git**: Para clonar el repositorio.
- **Python 3.8 o superior**: Para el backend y scripts de datos.
- **Node.js 18 o superior**: Para el frontend en React.
- **Apache Cassandra**: Base de datos para almacenar datos electorales.
- **Redis**: Para almacenamiento en memoria.
- **cqlsh**: Cliente de línea de comandos para Cassandra.
- **redis-cli**: Cliente de línea de comandos para Redis.
- Un terminal Bash (en WSL2, usa la terminal de Ubuntu).

### Instalación de requisitos en WSL2

Si no tienes estos programas, instálalos en WSL2 con los siguientes comandos:

1. **Actualizar WSL2**:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

2. **Instalar Git**:
   ```bash
   sudo apt-get install git
   ```

3. **Instalar Python 3**:
   ```bash
   sudo apt-get install python3 python3-pip python3-venv
   ```

4. **Instalar Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

5. **Instalar Cassandra**:
   ```bash
   echo "deb https://debian.cassandra.apache.org 41x main" | sudo tee -a /etc/apt/sources.list.d/cassandra.sources.list
   curl https://downloads.apache.org/cassandra/KEYS | sudo apt-key add -
   sudo apt-get update
   sudo apt-get install cassandra
   ```

6. **Instalar Redis**:
   ```bash
   sudo apt-get install redis-server
   ```

7. **Verificar instalaciones**:
   ```bash
   git --version
   python3 --version
   node --version
   npm --version
   cqlsh --version
   redis-cli --version
   ```

   Si alguno falla, repite el paso correspondiente o busca ayuda.

## Clonación del repositorio

1. Abre una terminal en WSL2 (por ejemplo, Ubuntu).
2. Clona el repositorio:
   ```bash
   git clone https://github.com/Francovg18/ProyectBD
   cd ProyectBD
   ```

3. Cambia al branch `version2`:
   ```bash
   git checkout version2
   ```

   **Nota**: Si ves un error como `error: pathspec 'version2' did not match any file(s) known to git`, verifica que el branch existe en GitHub o contacta al equipo.

## Configuración inicial

### Limpieza de datos anteriores

Para evitar errores, limpia las bases de datos Redis y Cassandra antes de configurar el proyecto:

1. **Limpiar Redis**:
   ```bash
   redis-cli flushall
   ```

   Esto elimina todos los datos en Redis. Deberías ver `OK` como respuesta.

2. **Eliminar el keyspace de Cassandra**:
   ```bash
   cqlsh -e "DROP KEYSPACE IF EXISTS elecciones"
   ```

   Esto elimina el keyspace `elecciones` si existe. Si no existe, no pasa nada.

### Configurar el entorno de Python

1. Crea un entorno virtual:
   ```bash
   python3 -m venv venv
   ```

2. Activa el entorno virtual:
   ```bash
   source venv/bin/activate
   ```

   **Nota**: Verás `(venv)` al inicio de la línea de comandos, indicando que el entorno está activo.

3. Instala las dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```

   **Nota**: Si ves errores como `pip: command not found`, ejecuta `sudo apt-get install python3-pip` y repite.

### Configurar el frontend

1. Navega al directorio `frontend`:
   ```bash
   cd frontend
   ```

2. Instala las dependencias de Node.js:
   ```bash
   npm install
   ```

   **Nota**: Esto puede tardar unos minutos. Si ves errores, asegúrate de tener Node.js 18+ instalado (`node --version`).

3. Vuelve a la raíz del proyecto:
   ```bash
   cd ..
   ```

### Configurar Cassandra

1. Inicia el servicio de Cassandra:
   En WSL2, systemd no está disponible por defecto, así que inicia Cassandra manualmente:
   ```bash
   cassandra -f
   ```

   **Nota**: Esto ejecuta Cassandra en primer plano. Abre una nueva terminal (Ctrl+T en la mayoría de los terminales) para continuar con los siguientes pasos, dejando esta terminal corriendo.

2. Crea las tablas en Cassandra:
   En la nueva terminal, ejecuta:
   ```bash
   cqlsh -f db/cassandra_datos1.cql
   ```

   Esto crea el keyspace `elecciones` y sus tablas. Si ves errores, verifica que Cassandra esté corriendo (`ps aux | grep cassandra`) y que `cqlsh` esté instalado.

### Generar datos

1. Asegúrate de estar en la raíz del proyecto:
   ```bash
   cd ~/publico/ProyectBD
   ```

2. Genera datos para la base de datos:
   ```bash
   cd db
   python3 generate_data.py
   ```

   **Nota**: Esto pobla las tablas en Cassandra. Asegúrate de haber ejecutado `cqlsh -f cassandra_datos1.cql` primero, o dará errores. Usa `NUM_MESAS = 35000` en `generate_data.py` para pruebas finales.

3. Vuelve a la raíz:
   ```bash
   cd ..
   ```

## Iniciar los servicios

Abre **tres terminales** en WSL2 para ejecutar los servicios (Backend, Frontend, y Redis). Mantén la terminal de Cassandra corriendo si no la cerraste.

### Terminal 1: Redis

1. Inicia Redis:
   ```bash
   redis-server
   ```

   **Nota**: Esto ejecuta Redis en primer plano. Déjalo corriendo.

### Terminal 2: Backend (Flask)

1. Asegúrate de estar en la raíz del proyecto:
   ```bash
   cd ~/publico/ProyectBD
   ```

2. Activa el entorno virtual si no está activo:
   ```bash
   source venv/bin/activate
   ```

3. Inicia el backend:
   ```bash
   python3 backend/app.py
   ```

   **Nota**: Deberías ver un mensaje como `Running on http://127.0.0.1:5000`. Si ves errores, verifica que Redis y Cassandra estén corriendo.

### Terminal 3: Frontend (React)

1. Navega al directorio `frontend`:
   ```bash
   cd ~/publico/ProyectBD/frontend
   ```

2. Inicia el frontend:
   ```bash
   npm run dev
   ```

   **Nota**: Esto inicia el servidor de desarrollo de Vite. Deberías ver un mensaje como `VITE vX.X.X ready in XXX ms` y una URL como `http://localhost:5173`.

## Acceder al dashboard

1. Abre un navegador (en Windows, no en WSL2).
2. Ve a `http://localhost:5173`.

**Qué deberías ver**:
- Un dashboard con los 10 partidos políticos activos.
- UN y FRI liderando (~17.7% cada uno).
- MAS más atrás (~7.9%).

**Si no carga**:
- Verifica que las tres terminales (Backend, Frontend, Redis) estén corriendo.
- Asegúrate de que Cassandra esté activa (en su propia terminal).
- Revisa los mensajes de error en las terminales.

## Estructura del proyecto

- `backend/`: Contiene `app.py`, la API Flask que conecta con Cassandra y Redis.
- `db/`: Scripts para configurar y poblar la base de datos:
  - `cassandra_datos1.cql`: Define el keyspace y tablas.
  - `cassandra_datos2.cql`: Consultas adicionales.
  - `generate_data.py`: Genera datos de prueba.
- `frontend/`: Aplicación React con Vite para el dashboard.
- `requirements.txt`: Dependencias de Python.
- `.gitignore`: Archivos y directorios ignorados por Git (como `venvP/`, `KEYS`, y `.csv`).

## Notas importantes

- **Pruebas finales**: Usa `NUM_MESAS = 35000` en `db/generate_data.py` para simular datos reales.
- **Errores comunes**:
  - Si `cqlsh` falla: Asegúrate de que Cassandra esté corriendo (`ps aux | grep cassandra`).
  - Si `npm run dev` falla: Verifica Node.js (`node --version`) y elimina `frontend/node_modules` y `frontend/package-lock.json`, luego repite `npm install`.
  - Si el backend falla: Confirma que Redis y Cassandra están activos y que el entorno virtual está activado (`source venv/bin/activate`).
- **WSL2**: Los servicios no se inician con `systemctl` (como en Linux nativo). Usa `cassandra -f` y `redis-server` directamente.
- **Limpieza**: Siempre ejecuta `redis-cli flushall` y `cqlsh -e "DROP KEYSPACE elecciones"` antes de empezar para evitar datos residuales.

## Solución de problemas

- **Cassandra no inicia**: Ejecuta `sudo service cassandra status` o reinicia con `cassandra -f`.
- **Redis no responde**: Verifica con `redis-cli ping` (debería responder `PONG`).
- **Errores de Python**: Asegúrate de estar en el entorno virtual (`source venv/bin/activate`) y que todas las dependencias están instaladas (`pip install -r requirements.txt`).
- **Frontend no carga**: Abre la consola del navegador (F12) y busca errores. Revisa la terminal de `npm run dev`.

Si necesitas ayuda, contacta al equipo o revisa los logs en las terminales.
