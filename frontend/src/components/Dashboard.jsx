import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../css/dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Coordenadas aproximadas de los departamentos de Bolivia
const departamentosCoordenadas = {
  La_Paz: { lat: -16.5, lng: -68.15 },
  Cochabamba: { lat: -17.39, lng: -66.15 },
  Santa_Cruz: { lat: -17.8, lng: -63.18 },
  Oruro: { lat: -17.97, lng: -67.12 },
  Potosí: { lat: -19.58, lng: -65.75 },
  Chuquisaca: { lat: -19.03, lng: -65.26 },
  Tarija: { lat: -21.53, lng: -64.73 },
  Pando: { lat: -11.02, lng: -68.77 },
  Beni: { lat: -14.83, lng: -64.9 }
};

export default function Dashboard() {
  const [datos, setDatos] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [votosPorDepartamento, setVotosPorDepartamento] = useState([]);
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const departamentos = ['todos', 'La_Paz', 'Cochabamba', 'Santa_Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Pando', 'Beni'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = filtroDepartamento === 'todos'
          ? 'http://localhost:5000/votos'
          : `http://localhost:5000/votos?departamento=${filtroDepartamento}`;
        const res = await axios.get(url);
        setDatos(res.data.data);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Error al obtener datos:', err);
        setLoading(false);
      }
    };

    const fetchAuditoria = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auditoria');
        setAuditoria(res.data.data);
      } catch (err) {
        console.error('Error al obtener auditoría:', err);
      }
    };

    const fetchVotosPorDepartamento = async () => {
      try {
        const res = await axios.get('http://localhost:5000/votos_por_departamento');
        setVotosPorDepartamento(res.data.data);
      } catch (err) {
        console.error('Error al obtener votos por departamento:', err);
      }
    };

    fetchData();
    fetchAuditoria();
    fetchVotosPorDepartamento();
    const intervalo = setInterval(() => {
      fetchData();
      fetchAuditoria();
      fetchVotosPorDepartamento();
    }, 5000);
    return () => clearInterval(intervalo);
  }, [filtroDepartamento]);

  const coloresFijos = [
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 0, 0.8)',
    'rgba(75, 192, 92, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 83, 83, 0.8)',
    'rgba(255, 105, 180, 0.8)',
    'rgba(0, 255, 255, 0.8)',
    'rgba(128, 0, 128, 0.8)',
    'rgba(0, 128, 128, 0.8)'
  ];

  const colorBordes = [
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 0, 1)',
    'rgba(75, 192, 92, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
    'rgba(83, 83, 83, 1)',
    'rgba(255, 105, 180, 1)',
    'rgba(0, 255, 255, 1)',
    'rgba(128, 0, 128, 1)',
    'rgba(0, 128, 128, 1)'
  ];

  const totalVotos = datos.reduce((sum, partido) => sum + partido.votos, 0);

  const data = {
    labels: datos.map(d => d.nombre),
    datasets: [
      {
        label: 'Votos',
        data: datos.map(d => d.votos),
        backgroundColor: coloresFijos.slice(0, datos.length),
        borderColor: colorBordes.slice(0, datos.length),
        borderWidth: 2,
        borderRadius: 8,
        maxBarThickness: 80,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribución de Votos por Partido',
        font: { size: 18, family: "'Poppins', sans-serif", weight: 'bold' },
        padding: { bottom: 20 },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 16, family: "'Poppins', sans-serif" },
        bodyFont: { size: 14, family: "'Poppins', sans-serif" },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const partido = datos[index];
            const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
            return `${partido.votos.toLocaleString()} votos (${porcentaje}%)`;
          },
          title: function (context) {
            const index = context[0].dataIndex;
            const partido = datos[index];
            return `${partido.nombre} (${partido.sigla})`;
          }
        }
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', family: "'Poppins', sans-serif", size: 14 },
        textShadow: '0px 0px 4px rgba(0, 0, 0, 0.5)',
        formatter: function (value, context) {
          const porcentaje = ((value / totalVotos) * 100).toFixed(1);
          return `${porcentaje}%`;
        },
        anchor: 'center',
        align: 'center',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(226, 232, 240, 0.5)' },
        border: { dash: [4, 4] },
        ticks: {
          font: { family: "'Poppins', sans-serif" },
          callback: function (value) {
            if (value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Poppins', sans-serif" } }
      }
    },
    animation: { duration: 1000, easing: 'easeOutQuart' }
  };

  // Fecha última actualización
  const formatFecha = (fecha) => {
    const opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return fecha.toLocaleTimeString('es-ES', opciones);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Elecciones Presidenciales</h2>
        <p>Monitoreo de resultados en tiempo real</p>
        <div className="login-buttons">
          <button onClick={() => navigate('/admin-login')} className="login-btn admin-btn">
            Iniciar Sesión como Admin
          </button>
          <button onClick={() => navigate('/juror-login')} className="login-btn juror-btn">
            Iniciar Sesión como Jurado Electoral
          </button>
        </div>
      </div>

      {/* Filtro por departamento */}
      <div className="filtro-container">
        <label htmlFor="departamento">Filtrar por Departamento: </label>
        <select
          id="departamento"
          onChange={(e) => setFiltroDepartamento(e.target.value)}
          value={filtroDepartamento}
        >
          {departamentos.map(dep => (
            <option key={dep} value={dep}>
              {dep === 'todos' ? 'Todos' : dep.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Tarjetas de resumen */}
      <div className="summary-container">
        {datos.map((partido, index) => {
          const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
          return (
            <div key={partido.sigla} className="summary-card" style={{ borderTop: `4px solid ${colorBordes[index]}` }}>
              <h3>{partido.sigla}</h3>
              <div className="value">{partido.votos.toLocaleString()}</div>
              <div className="percentage">{porcentaje}%</div>
            </div>
          );
        })}
      </div>

      {/* Gráfica */}
      <div className="chart-container" style={{ height: '400px' }}>
        {loading && datos.length === 0 ? (
          <div className="loading">Cargando datos...</div>
        ) : datos.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="no-data">No hay datos disponibles</div>
        )}
      </div>

      {/* Mapa de Bolivia */}
      <div className="map-container" style={{ height: '400px', marginTop: '20px' }}>
        <h3>Partido Ganador por Departamento</h3>
        {loading && votosPorDepartamento.length === 0 ? (
          <div className="loading">Cargando mapa...</div>
        ) : votosPorDepartamento.length > 0 ? (
          <MapContainer center={[-16.5, -68.15]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {votosPorDepartamento.map((dep, index) => (
              <Marker key={index} position={[departamentosCoordenadas[dep.departamento].lat, departamentosCoordenadas[dep.departamento].lng]}>
                <Popup>
                  <b>{dep.departamento.replace('_', ' ')}</b><br />
                  Ganador: {dep.partido_ganador} ({dep.sigla})<br />
                  Porcentaje: {dep.porcentaje}%
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="no-data">No hay datos de departamentos disponibles</div>
        )}
      </div>

      {/* Resumen de auditoría */}
      <div className="auditoria-container">
        <h3>Últimas Acciones</h3>
        {auditoria.length > 0 ? (
          <ul>
            {auditoria.slice(0, 5).map((log, index) => (
              <li key={index}>
                {`${log.fecha_hora}: ${log.user_id} realizó ${log.accion} en mesa ${log.id_mesa}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay registros de auditoría disponibles.</p>
        )}
      </div>

      {/* Indicador de actualización */}
      <div className="update-status">
        <div className="update-indicator"></div>
        <span>Última actualización: {formatFecha(lastUpdated)}</span>
      </div>
    </div>
  );
}