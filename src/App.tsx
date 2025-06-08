import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, ChevronDown, ChevronUp, Circle, AlertCircle } from "lucide-react";
import PopUp from './components/popup/PopUp.jsx';
import DesempenoEstudianteCurso from "./components/DesempenoEstudianteCurso";

interface Material {
  tipo: string;
  titulo: string;
  estado: "Revisado" | "Por entregar" | "No revisado";
  id: string;
  puntos: number;
  desde?: string;
  hasta?: string;
}

interface SemanaData {
  semana: string;
  materiales: Material[];
  maxPuntos: number | string;
}

interface AlumnoRevision {
  alumnoId: string;
  revisados: string[];
}

export default function SemanaApp() {
  const [totalAlumnos, setTotalAlumnos] = useState<number>(0);

  const [maxPuntosCurso, setMaxPuntosCurso] = useState<number>(0);
  const [classShow, setclassShow] = useState(" active");
  const [mostrarDesempeno, setMostrarDesempeno] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({});
  const [weekData, setWeekData] = useState<SemanaData[]>([]);
  const [porcentajes, setPorcentajes] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [puntos, setPuntos] = useState<number>(0);
  const [estudianteActual] = useState("kaleb");

  const openPopUp = () => setclassShow(" active");
  const closePopUp = () => setclassShow("");

  const toggleWeek = (weekIndex: number) => {
    setOpenWeeks((prev) => ({
      ...prev,
      [weekIndex]: !prev[weekIndex],
    }));
  };

  const handleCheckboxChange = (material: Material) => {
  const id = material.id;

  // Si ya está marcado, no hacer nada
  if (checkedItems[id]) return;

  // Marcar checkbox visualmente
  setCheckedItems((prev) => ({ ...prev, [id]: true }));

  // Sumar puntos siempre (si no estaba marcado antes)
  setPuntos((prev) => prev + material.puntos);

  // Si el material estaba "No revisado", cambiar a "Revisado" y actualizar porcentaje
  if (material.estado === "No revisado") {
    // Cambiar estado a "Revisado"
    setWeekData((prevWeekData) =>
      prevWeekData.map((semana) => ({
        ...semana,
        materiales: semana.materiales.map((mat) =>
          mat.id === id ? { ...mat, estado: "Revisado" } : mat
        ),
      }))
    );

    // Actualizar porcentaje simulando revisión por el estudiante actual
    setPorcentajes((prevPorcentajes) => {
      const prev = prevPorcentajes[id] || 0;
      const yaRevisados = Math.round((prev / 100) * totalAlumnos);
      const nuevoRevisados = Math.min(yaRevisados + 1, totalAlumnos);
      const nuevoPorcentaje = Math.round((nuevoRevisados / totalAlumnos) * 100);
      return { ...prevPorcentajes, [id]: nuevoPorcentaje };
    });
  }
};



  useEffect(() => {
  Promise.all([fetch("/semana.json"), fetch("/alumnos.json")])
    .then(async ([semanaRes, alumnosRes]) => {
      const semanaData: SemanaData[] = await semanaRes.json();
      const alumnoData: AlumnoRevision[] = await alumnosRes.json();

      setWeekData(semanaData);
      setTotalAlumnos(alumnoData.length); // 👈 Guarda el total de alumnos

      const totalMaxPuntos = semanaData.reduce((acc, semana) => {
        return acc + semana.materiales.reduce((sum, m) => sum + (m.puntos || 0), 0);
      }, 0);
      setMaxPuntosCurso(totalMaxPuntos);

      const nuevosPorcentajes: Record<string, number> = {};

      semanaData.forEach((semana) => {
        semana.materiales.forEach((mat) => {
          const revisados = alumnoData.filter((alumno) =>
            alumno.revisados.includes(mat.id)
          ).length;
          const porcentaje = Math.round((revisados / alumnoData.length) * 100);
          nuevosPorcentajes[mat.id] = porcentaje;
        });
      });

      setPorcentajes(nuevosPorcentajes);
    })
    .catch((err) => console.error("Error loading JSON:", err));
}, []);


  return (
    <div className="p-6">
      <button
        className="rounded-md bg-blue-300 py-2 px-4 cursor-pointer font-bold"
        onClick={openPopUp}
      >
        Mostrar resumen
      </button>

      <PopUp
        closePopUp={closePopUp}
        classShow={classShow}
        semanaData={weekData}
        porcentajes={porcentajes}
      />

      <button
        onClick={() => setMostrarDesempeno(true)}
        className="mt-4 mb-2 rounded bg-indigo-600 text-white px-4 py-2 font-semibold"
      >
        Ver mi desempeño
      </button>

      {mostrarDesempeno && (
        <DesempenoEstudianteCurso
          estudiantes={[
            { nombre: estudianteActual, puntosTotales: puntos }
          ]}
          estudianteActual={{ nombre: estudianteActual, puntosTotales: puntos }}
          maxPuntos={maxPuntosCurso}
          onClose={() => setMostrarDesempeno(false)}
        />
      )}

      <h1 className="text-lg font-bold mb-4">Puntos acumulados: {puntos}</h1>

      {weekData.map((semana, i) => (
        <Card key={i} className="mb-4 shadow-md">
          <CardContent>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleWeek(i)}
            >
              <h2 className="text-xl font-semibold">{semana.semana}</h2>
              {openWeeks[i] ? <ChevronUp /> : <ChevronDown />}
            </div>

            {openWeeks[i] && (
              <div className="mt-4">
                <p className="font-medium mb-3">Material de estudio</p>
                {semana.materiales.map((mat, j) => {
                  const porcentaje = porcentajes[mat.id] ?? 0;
                  const estadoClase =
                    mat.estado === "Revisado"
                      ? "bg-green-200 text-green-800"
                      : mat.estado === "Por entregar"
                      ? "bg-yellow-300 text-yellow-900 animate-pulse"
                      : "bg-gray-200 text-gray-800 animate-pulse";

                  return (
                    <div
                      key={j}
                      className="relative border p-4 rounded-lg mb-2 bg-white flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm text-gray-600">
                          Material · {mat.tipo}
                        </p>
                        <p className="font-medium">{mat.titulo}</p>
                        {mat.desde && mat.hasta && (
                          <p className="text-xs mt-1 text-gray-500">
                            <strong>Desde:</strong> {mat.desde} <br />
                            <strong>Hasta:</strong> {mat.hasta}
                          </p>
                        )}
                        <p className="text-xs mt-1 text-gray-500">
                          <strong>Puntos:</strong> {mat.puntos}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {mat.estado !== "Por entregar" && (
                          <input
                            type="checkbox"
                            className="w-5 h-5"
                            checked={checkedItems[mat.id] || false}
                            onChange={() => handleCheckboxChange(mat)}
                          />
                        )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className={`flex items-center px-3 py-1 rounded-full text-sm shadow-md cursor-default font-bold ${estadoClase}`}
                              >
                                {mat.estado === "Revisado" ? (
                                  <CheckCircle className="size-4 mr-1 text-green-600" />
                                ) : mat.estado === "Por entregar" ? (
                                  <AlertCircle className="size-4 mr-1 text-yellow-600" />
                                ) : (
                                  <Circle className="size-4 mr-1 text-gray-600" />
                                )}
                                {mat.estado}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">
                                {porcentaje}% de alumnos ya revisó este material
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
