import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
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

export default function Dashboard() {
  const [datos, setDatos] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/votos");
        setDatos(res.data.data);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setLoading(false);
      }
    };

    fetchData();
    const intervalo = setInterval(fetchData, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const coloresFijos = [
    'rgba(54, 162, 235, 0.8)',   
    'rgba(255, 206, 0, 0.8)',    
    'rgba(75, 192, 92, 0.8)',    
    'rgba(255, 99, 132, 0.8)'    
  ];

  const colorBordes = [
    'rgba(54, 162, 235, 1)',   
    'rgba(255, 206, 0, 1)',    
    'rgba(75, 192, 92, 1)',    
    'rgba(255, 99, 132, 1)'    
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
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Distribución de Votos por Partido',
        font: {
          size: 18,
          family: "'Poppins', sans-serif",
          weight: 'bold'
        },
        padding: {
          bottom: 20
        },
        color: '#1e293b'
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 16,
          family: "'Poppins', sans-serif",
        },
        bodyFont: {
          size: 14,
          family: "'Poppins', sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const partido = datos[index];
            const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
            return `${partido.votos.toLocaleString()} votos (${porcentaje}%)`;
          },
          title: function(context) {
            const index = context.at(0).dataIndex;
            const partido = datos[index];
            return `${partido.nombre} (${partido.sigla})`;
          }
        }
      },
      datalabels: {
        color: function(context) {
          return '#fff';
        },
        font: {
          weight: 'bold',
          family: "'Poppins', sans-serif",
          size: 14
        },
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
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        border: {
          dash: [4, 4]
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
          },
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  };

  // fecha última actualización
  const formatFecha = (fecha) => {
    const opciones = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return fecha.toLocaleTimeString('es-ES', opciones);
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Elecciones Presidenciales</h2>
        <p>Monitoreo de resultados en tiempo real</p>
      </div>
      
      {/* Tarjetas de resumen */}
      <div className="summary-container">
        {datos.map((partido, index) => {
          const porcentaje = ((partido.votos / totalVotos) * 100).toFixed(2);
          return (
            <div key={partido.sigla} className="summary-card" style={{borderTop: `4px solid ${colorBordes[index]}`}}>
              <h3>{partido.sigla}</h3>
              <div className="value">{partido.votos.toLocaleString()}</div>
              <div className="percentage">{porcentaje}%</div>
            </div>
          );
        })}
      </div>
      
      {/* Gráfica */}
      <div className="chart-container" style={{height: '400px'}}>
        {loading && datos.length === 0 ? (
          <div className="loading">Cargando datos...</div>
        ) : datos.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div className="no-data">No hay datos disponibles</div>
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