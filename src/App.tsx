import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Info, ChevronDown, ChevronUp, Circle, AlertCircle } from "lucide-react";

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
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({});
  const [weekData, setWeekData] = useState<SemanaData[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoRevision[]>([]);
  const [porcentajes, setPorcentajes] = useState<Record<string, number>>({});

  const toggleWeek = (weekIndex: number) => {
    setOpenWeeks((prev) => ({
      ...prev,
      [weekIndex]: !prev[weekIndex],
    }));
  };

  useEffect(() => {
    Promise.all([fetch("/semana.json"), fetch("/alumnos.json")])
      .then(async ([semanaRes, alumnosRes]) => {
        const semanaData: SemanaData[] = await semanaRes.json();
        const alumnoData: AlumnoRevision[] = await alumnosRes.json();

        setWeekData(semanaData);
        setAlumnos(alumnoData);

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
                  const estadoClase =
                    mat.estado === "Revisado"
                      ? "bg-green-200 text-green-800"
                      : mat.estado === "Por entregar"
                      ? "bg-yellow-300 text-yellow-900"
                      : "bg-gray-200 text-gray-800";


                  const tooltipColor =
                    mat.estado === "Revisado"
                      ? "bg-blue-200 text-blue-700"
                      : "bg-red-500 text-white animate-pulse";

                  const porcentaje = porcentajes[mat.id] ?? 0;

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
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`flex items-center px-3 py-1 rounded-full font-bold text-sm ${estadoClase}`}
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

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={`w-7 h-7 ${tooltipColor} rounded-full flex items-center justify-center text-xs shadow-lg`}
                              >
                                <Info className="w-4 h-4" />
                              </div>
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
