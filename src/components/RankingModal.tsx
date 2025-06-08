import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "./Ranking.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Estudiante = {
  id: string;
  nombre: string;
  puntosS1?: number;
  puntosS2?: number;
  // agrega más propiedades si tienes más semanas
};

interface RankingModalProps {
  estudiantes: Estudiante[];
  onClose: () => void;
  maxPuntos: number | string;
  semana: string;
}

const getColor = (puntos: number): string => {
  if (puntos >= 90) return "rgba(54, 162, 235, 0.6)"; // azul
  if (puntos >= 80) return "rgba(75, 192, 75, 0.6)"; // verde
  if (puntos >= 70) return "rgba(255, 205, 86, 0.6)"; // amarillo
  if (puntos >= 60) return "rgba(255, 159, 64, 0.6)"; // naranja
  return "rgba(255, 99, 132, 0.6)"; // rojo
};

const getBorderColor = (puntos: number): string => {
  if (puntos >= 90) return "rgba(54, 162, 235, 1)";
  if (puntos >= 80) return "rgba(75, 192, 75, 1)";
  if (puntos >= 70) return "rgba(255, 205, 86, 1)";
  if (puntos >= 60) return "rgba(255, 159, 64, 1)";
  return "rgba(255, 99, 132, 1)";
};

const RankingModal: React.FC<RankingModalProps> = ({
  estudiantes,
  onClose,
  maxPuntos,
  semana,
}) => {
  const maxPuntosNum =
    typeof maxPuntos === "string" ? parseInt(maxPuntos, 10) : maxPuntos;

  if (isNaN(maxPuntosNum)) {
    throw new Error("maxPuntos no es un número válido");
  }

  const numeroSemana = parseInt(semana.match(/\d+/)?.[0] ?? "1", 10);

  const datosEstudiantes = estudiantes.map((e) => {
    const puntosSemanaRaw = e[`puntosS${numeroSemana}` as keyof Estudiante];
    const puntosSemana = typeof puntosSemanaRaw === "number" ? puntosSemanaRaw : 0;
    const porcentaje = (puntosSemana / maxPuntosNum) * 100;

    return {
      nombre: e.nombre,
      porcentaje,
      backgroundColor: getColor(porcentaje),
      borderColor: getBorderColor(porcentaje),
    };
  });

  const data = {
    labels: datosEstudiantes.map((e) => e.nombre),
    datasets: [
      {
        label: "Puntos obtenidos (%)",
        data: datosEstudiantes.map((e) => e.porcentaje),
        backgroundColor: datosEstudiantes.map((e) => e.backgroundColor),
        borderColor: datosEstudiantes.map((e) => e.borderColor),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        max: 100,
        beginAtZero: true,
        title: {
          display: true,
          text: "Porcentaje (%)",
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Ranking semanal por puntos",
      },
    },
  };

  const height = estudiantes.length * 40;

  return (
    <div className="ranking-overlay">
      <div className="ranking-modal">
        <h3>Ranking de estudiantes</h3>
        <div style={{ height: `${height}px` }}>
          <Bar data={data} options={options} />
        </div>
        <button className="cerrar-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default RankingModal;

