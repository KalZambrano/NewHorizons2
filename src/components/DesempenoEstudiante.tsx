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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Estudiante = {
  id: string;
  nombre?: string;
  puntosS1?: number;
  puntosS2?: number;
  // otros campos que tengas
};

interface DesempenoEstudianteProps {
  estudiantes: Estudiante[];
  estudianteActual: Estudiante;
  semana: string;
  onClose: () => void;
  maxPuntos: number | string;
}

const getColor = (rango: string, actualRango: string): string => {
  const colores: Record<string, string> = {
    "Excelente (90–100)": "rgba(54, 162, 235, 0.6)", // azul
    "Bueno (80–89)": "rgba(75, 192, 75, 0.6)", // verde
    "Intermedio (70–79)": "rgba(255, 205, 86, 0.6)", // amarillo
    "Bajo (60–69)": "rgba(255, 159, 64, 0.6)", // naranja
    "Deficiente (<60)": "rgba(255, 99, 132, 0.6)", // rojo
  };

  const resaltado: Record<string, string> = {
    "Excelente (90–100)": "rgba(54, 162, 235, 1)",
    "Bueno (80–89)": "rgba(75, 192, 75, 1)",
    "Intermedio (70–79)": "rgba(255, 205, 86, 1)",
    "Bajo (60–69)": "rgba(255, 159, 64, 1)",
    "Deficiente (<60)": "rgba(255, 99, 132, 1)",
  };

  return rango === actualRango ? resaltado[rango] : colores[rango];
};

const DesempenoEstudiante: React.FC<DesempenoEstudianteProps> = ({
  estudiantes,
  estudianteActual,
  semana,
  onClose,
  maxPuntos,
}) => {
  // Convertir maxPuntos a número si viene como string
  const maxPuntosNum =
    typeof maxPuntos === "string" ? parseInt(maxPuntos, 10) : maxPuntos;

  const getPuntosSemana = (e: Estudiante): number => {
    const numeroSemana = semana.match(/\d+/)?.[0];
    if (!numeroSemana) return 0;
    return (
      e[`puntosS${parseInt(numeroSemana, 10)}` as keyof Estudiante] ?? 0
    ) as number;
  };

  const getRango = (porcentaje: number): string => {
    if (porcentaje >= 90) return "Excelente (90–100)";
    if (porcentaje >= 80) return "Bueno (80–89)";
    if (porcentaje >= 70) return "Intermedio (70–79)";
    if (porcentaje >= 60) return "Bajo (60–69)";
    return "Deficiente (<60)";
  };

  const rangos = [
    "Excelente (90–100)",
    "Bueno (80–89)",
    "Intermedio (70–79)",
    "Bajo (60–69)",
    "Deficiente (<60)",
  ];

  const conteoPorRango: Record<string, number> = {};
  rangos.forEach((r) => (conteoPorRango[r] = 0));

  estudiantes.forEach((e) => {
    const puntosSemana = getPuntosSemana(e);
    const porcentaje = (puntosSemana / maxPuntosNum) * 100;
    const r = getRango(porcentaje);
    conteoPorRango[r]++;
  });

  const puntosEstudiante = getPuntosSemana(estudianteActual);
  const porcentajeEstudiante = (puntosEstudiante / maxPuntosNum) * 100;
  const rangoEstudiante = getRango(porcentajeEstudiante);

  const data = {
    labels: rangos,
    datasets: [
      {
        label: "Cantidad de estudiantes",
        data: rangos.map((r) => conteoPorRango[r]),
        backgroundColor: rangos.map((r) => getColor(r, rangoEstudiante)),
        borderColor: rangos.map((r) =>
          r === rangoEstudiante ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cantidad de estudiantes",
        },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Distribución de puntajes",
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const rango = context.label;
            const cantidad = context.raw;
            const esTuRango = rango === rangoEstudiante;
            return `${cantidad} estudiante(s)${
              esTuRango ? " — Tú estás aquí" : ""
            }`;
          },
        },
      },
    },
  };

  return (
    <div className="ranking-overlay">
      <div className="ranking-modal">
        <h3>Tu desempeño</h3>
        <p style={{ marginBottom: "1rem" }}>
          Estás en el rango: <strong>{rangoEstudiante}</strong>
        </p>
        <Bar data={data} options={options} />
        <button className="cerrar-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default DesempenoEstudiante;
