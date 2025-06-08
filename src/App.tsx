import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, ChevronDown, ChevronUp, Circle, AlertCircle } from "lucide-react";
import RankingCursoModal from "@/components/RankingCursoModal.js";
import DesempenoEstudianteCurso from "@/components/DesempenoEstudianteCurso.js";
import RankingModal from "@/components/RankingModal.js";
import DesempenoEstudiante from "@/components/DesempenoEstudiante.js";
import PopUp from './components/popup/PopUp.jsx';
import FlashcardWidget from './widgets/FlashcardWidget.jsx';



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
  nombre: string;
  puntosTotales: number;
  puntosS1: number;
  puntosS2: number;
  revisados: string[]; // lista de ids de materiales revisados
}

export default function SemanaApp() {
  const [module] = useState('');
  const [totalAlumnos, setTotalAlumnos] = useState<number>(0);
  const [puntosBase, setPuntosBase] = useState<number>(0);
  const [puntosIncrementales, setPuntosIncrementales] = useState<number>(0);
  const [maxPuntosCurso, setMaxPuntosCurso] = useState<number>(0);
  const [mostrarRankingCurso, setMostrarRankingCurso] = useState(false);
  const [mostrarDesempenoCurso, setMostrarDesempenoCurso] = useState(false);

  // Para manejar ranking y desempeño por semana, usamos número o null para indicar abierto o cerrado
  const [mostrarRankingSemana, setMostrarRankingSemana] = useState<number | null>(null);
  const [mostrarDesempenoSemana, setMostrarDesempenoSemana] = useState<number | null>(null);

  const [alumnos, setAlumnos] = useState<AlumnoRevision[]>([]);
  const [classShow, setclassShow] = useState(" active");
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({});
  const [weekData, setWeekData] = useState<SemanaData[]>([]);
  const [porcentajes, setPorcentajes] = useState<Record<string, number>>({});
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [puntos, setPuntos] = useState<number>(0);
  const [estudianteActual, setEstudianteActual] = useState<AlumnoRevision | null>(null);

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

  // Evitar doble conteo global (UI)
  if (checkedItems[id]) return;

  // Verificamos que el estudiante actual exista
  if (!estudianteActual) return;

  // ❗ Evitar sumar si ya lo revisó antes
  if (estudianteActual.revisados.includes(id)) return;

  setCheckedItems((prev) => ({ ...prev, [id]: true }));

  // Encontrar semana
  const semanaIndex = weekData.findIndex((semana) =>
    semana.materiales.some((mat) => mat.id === id)
  );

  // Actualizar alumnos
  setAlumnos((prevAlumnos) =>
    prevAlumnos.map((alumno) => {
      if (alumno.alumnoId === estudianteActual.alumnoId) {
        let nuevosPuntosS1 = alumno.puntosS1;
        let nuevosPuntosS2 = alumno.puntosS2;

        if (semanaIndex === 0) {
          nuevosPuntosS1 += material.puntos;
        } else if (semanaIndex === 1) {
          nuevosPuntosS2 += material.puntos;
        }

        return {
          ...alumno,
          puntosS1: nuevosPuntosS1,
          puntosS2: nuevosPuntosS2,
          puntosTotales: nuevosPuntosS1 + nuevosPuntosS2,
          revisados: [...alumno.revisados, id],
        };
      }
      return alumno;
    })
  );

  // Actualizar estudianteActual
  let nuevosPuntosS1 = estudianteActual.puntosS1;
  let nuevosPuntosS2 = estudianteActual.puntosS2;

  if (semanaIndex === 0) {
    nuevosPuntosS1 += material.puntos;
  } else if (semanaIndex === 1) {
    nuevosPuntosS2 += material.puntos;
  }

  setEstudianteActual({
    ...estudianteActual,
    puntosS1: nuevosPuntosS1,
    puntosS2: nuevosPuntosS2,
    puntosTotales: nuevosPuntosS1 + nuevosPuntosS2,
    revisados: [...estudianteActual.revisados, id],
  });

  // Actualizar UI de puntos total
  setPuntos((prev) => prev + material.puntos);

  // Actualizar estado del material y porcentajes
  if (material.estado === "No revisado") {
    setWeekData((prevWeekData) =>
      prevWeekData.map((semana) => ({
        ...semana,
        materiales: semana.materiales.map((mat) =>
          mat.id === id ? { ...mat, estado: "Revisado" } : mat
        ),
      }))
    );

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
        setTotalAlumnos(alumnoData.length);
        setAlumnos(alumnoData);

        const estudiante = alumnoData.find((e) => e.nombre === "Kaleb");
        if (estudiante) {
          setEstudianteActual(estudiante);
          setPuntosBase(Number(estudiante.puntosTotales) || 0); // Puntos base inicial del alumno (asegura que sea número)
          setPuntosIncrementales(0); // Reseteamos puntos adicionales
        }

        const totalMaxPuntos = semanaData.reduce(
          (acc, semana) => acc + Number(semana.maxPuntos),
          0
        );
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

  useEffect(() => {
    const base = Number(puntosBase) || 0;
    const inc = Number(puntosIncrementales) || 0;
    setPuntos(base + inc);
  }, [puntosBase, puntosIncrementales]);


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
        onClick={() => setMostrarRankingCurso(true)}
        className="mt-4 mb-2 rounded bg-indigo-600 text-white px-4 py-2 font-semibold"
      >
        Ver ranking general
      </button>

      {mostrarRankingCurso && (
        <RankingCursoModal
          estudiantes={alumnos}
          maxPuntos={maxPuntosCurso}
          onClose={() => setMostrarRankingCurso(false)}
        />
      )}

      <button
        onClick={() => setMostrarDesempenoCurso(true)}
        className="mt-4 mb-2 rounded bg-indigo-600 text-white px-4 py-2 font-semibold"
      >
        Ver mi desempeño
      </button>

      {mostrarDesempenoCurso && estudianteActual && (
        <DesempenoEstudianteCurso
          estudiantes={alumnos}
          estudianteActual={estudianteActual}
          maxPuntos={maxPuntosCurso}
          onClose={() => setMostrarDesempenoCurso(false)}
        />
      )}

      <h1 className="text-lg font-bold mb-4">Puntos acumulados: {puntos}</h1>

      {weekData.map((semana, i) => (
        <Card key={i} className="mb-4 shadow-md">
          <CardContent>
            <div className="flex justify-between items-center">
              <h2
                className="text-xl font-semibold cursor-pointer"
                onClick={() => toggleWeek(i)}
              >
                {semana.semana}
              </h2>

              <div className="flex gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  onClick={() =>
                    setMostrarRankingSemana((prev) => (prev === i ? null : i))
                  }
                >
                  Ranking
                </button>

                {mostrarRankingSemana === i && (
                  <RankingModal
                    estudiantes={alumnos}
                    maxPuntos={semana.maxPuntos}
                    semana={semana.semana}
                    onClose={() => setMostrarRankingSemana(null)}
                  />
                )}

                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  onClick={() =>
                    setMostrarDesempenoSemana((prev) => (prev === i ? null : i))
                  }
                >
                  Desempeño
                </button>

                {mostrarDesempenoSemana === i && estudianteActual && (
                  <DesempenoEstudiante
                    estudiantes={alumnos}
                    estudianteActual={estudianteActual}
                    maxPuntos={semana.maxPuntos}
                    semana={semana.semana}
                    onClose={() => setMostrarDesempenoSemana(null)}
                  />
                )}
              </div>

              <div className="cursor-pointer ml-4" onClick={() => toggleWeek(i)}>
                {openWeeks[i] ? <ChevronUp /> : <ChevronDown />}
              </div>
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
      <FlashcardWidget selectedModule={module} />
    </div>
    
  );
}
