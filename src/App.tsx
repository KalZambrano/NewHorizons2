import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, ChevronDown, ChevronUp, Circle, AlertCircle } from "lucide-react";
import PopUp from './components/popup/PopUp.jsx'

interface Material {
  tipo: string;
  titulo: string;
  estado: "Revisado" | "Por entregar" | "No revisado";
  id: string;
  desde?: string;
  hasta?: string;
}

interface SemanaData {
  semana: string;
  materiales: Material[];
}

interface AlumnoRevision {
  alumnoId: string;
  revisados: string[]; // lista de ids de materiales revisados
}

export default function Semana11() {
  const [classShow, setclassShow] = useState(" active");

  const openPopUp = () => setclassShow(" active");
  const closePopUp = () => setclassShow("");

  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({});
  const [weekData, setWeekData] = useState<SemanaData[]>([]);
  // const [alumnos, setAlumnos] = useState<AlumnoRevision[]>([]);
  const [porcentajes, setPorcentajes] = useState<Record<string, number>>({});
  const [puntos, setPuntos] = useState<number>(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleWeek = (weekIndex: number) => {
    setOpenWeeks((prev) => ({
      ...prev,
      [weekIndex]: !prev[weekIndex],
    }));
  };

  const handleCheckboxChange = (id: string) => {
    setCheckedItems((prev) => {
      if (prev[id]) return prev; // No permitir desmarcar
      setPuntos((prevPuntos) => prevPuntos + 10);
      return {
        ...prev,
        [id]: true,
      };
    });
  };

  const handleMaterialClick = (weekIndex: number, materialId: string) => {
    setWeekData((prev) => {
      const updated = [...prev];
      const week = updated[weekIndex];
      week.materiales = week.materiales.map((mat) =>
        mat.id === materialId && mat.estado === "No revisado"
          ? { ...mat, estado: "Revisado" }
          : mat
      );
      return updated;
    });
  };

  useEffect(() => {
    Promise.all([fetch("/semana.json"), fetch("/alumnos.json")])
      .then(async ([semanaRes, alumnosRes]) => {
        const semanaData: SemanaData[] = await semanaRes.json();
        const alumnoData: AlumnoRevision[] = await alumnosRes.json();

        setWeekData(semanaData);
        // setAlumnos(alumnoData);

        // Calcular porcentajes dinámicamente
        const totalAlumnos = alumnoData.length;
        const nuevosPorcentajes: Record<string, number> = {};

        semanaData.forEach((semana) => {
          semana.materiales.forEach((mat) => {
            const revisados = alumnoData.filter((alumno) =>
              alumno.revisados.includes(mat.id)
            ).length;
            const porcentaje = Math.round((revisados / totalAlumnos) * 100);
            nuevosPorcentajes[mat.id] = porcentaje;
          });
        });

        setPorcentajes(nuevosPorcentajes);
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  return (
    <div className="p-6">
      <button className="rounded-md bg-blue-300 py-2 px-4 cursor-pointer font-bold" onClick={openPopUp}>Mostrar resumen</button>

      <PopUp
        closePopUp={closePopUp}
        classShow={classShow}
        semanaData={weekData}
        porcentajes={porcentajes}
      />


      <h1 className="text-lg font-bold mb-4">Puntos acumulados: {puntos}</h1>
      {weekData.map((semana, i) => (
        <Card key={i} className="mb-4 shadow-md">
          <CardContent>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleWeek(i)}
            >
              <h2 className="text-xl font-semibold">{semana.semana}</h2>
              {openWeeks[i] ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
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

                  const showCheckbox = mat.estado !== "Por entregar";

                  return (
                    <div
                      key={j}
                      className="relative border p-4 rounded-lg mb-2 bg-white flex justify-between items-center cursor-pointer"
                      onClick={() => handleMaterialClick(i, mat.id)}
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
                      </div>

                      <div className="flex items-center gap-4">
                        {showCheckbox && (
                          <input
                            type="checkbox"
                            className="w-5 h-5"
                            checked={checkedItems[mat.id] || false}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCheckboxChange(mat.id);
                            }}
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
