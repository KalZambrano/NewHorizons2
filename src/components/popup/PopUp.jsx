import React from "react";
import Slider from "react-slick";
import { CheckCircle, Circle, AlertCircle } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./PopUp.css";

const PopUp = ({ classShow, closePopUp, semanaData, porcentajes }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const allMaterials = semanaData.flatMap((semana) => semana.materiales);
  const porEntregar = allMaterials.filter((m) => m.estado === "Por entregar");
  const pendientes = allMaterials.filter((m) => m.estado === "No revisado");
  const revisados = allMaterials.filter((m) => m.estado === "Revisado");

  // Calcular resumen global
  const totalPendientes = porEntregar.length + pendientes.length;
  const totalMateriales = allMaterials.length;
  const porcentajePendientes = Math.round((totalPendientes / totalMateriales) * 100);

  const renderCard = (material) => {
    const porcentaje = porcentajes[material.id] || 0;
    const icono =
      material.estado === "Revisado" ? (
        <CheckCircle size={14} />
      ) : material.estado === "Por entregar" ? (
        <AlertCircle size={14} />
      ) : (
        <Circle size={14} />
      );

    const estadoClase =
      material.estado === "Revisado"
        ? "revisado"
        : material.estado === "Por entregar"
        ? "por-entregar"
        : "pendiente";

    return (
      <div className="task-card" key={material.id}>
        <div className="task-header">
          <div className="task-type">Material · {material.tipo}</div>
        </div>
        <div className="task-body">
          <div className="task-title">{material.titulo}</div>
          <div className={`task-status ${estadoClase}`}>
            {icono}
            {material.estado}
          </div>
        </div>
        {material.desde && material.hasta && (
          <div className="task-footer">
            <div>Desde: {material.desde}</div>
            <div>Hasta: {material.hasta}</div>
          </div>
        )}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill active"
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
          <div className="progress-text visible">
            {porcentaje}% de tus compañeros ya lo completaron
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`popUp-background${classShow}`} id="popUp">
      <div className="popUp-container">
        <button className="cursor-pointer font-bold" onClick={closePopUp}>X</button>

        {/* Aviso general */}
        {totalPendientes > 0 && (
          <div className="global-warning">
            🔴 Formas parte del {porcentajePendientes}% que aún tiene actividades pendientes.
          </div>
        )}

        <Slider {...settings} className="slider">
          {/* Slide 1: Por entregar */}
          <div className="carrousel-card">
            <div className="title">
              <h1>Actividades por entregar</h1>
            </div>
            <div className="body">
              <div className="tasks-container">
                {porEntregar.length > 0 ? (
                  porEntregar.map(renderCard)
                ) : (
                  <p>No hay actividades por entregar.</p>
                )}
              </div>
            </div>
          </div>

          {/* Slide 2: Pendientes (no revisados) */}
          <div className="carrousel-card">
            <div className="title">
              <h1>Materiales pendientes de revisión</h1>
            </div>
            <div className="body">
              <div className="tasks-container">
                {pendientes.length > 0 ? (
                  pendientes.map(renderCard)
                ) : (
                  <p>No hay pendientes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Slide 3: Revisados */}
          <div className="carrousel-card">
            <div className="title">
              <h1>Materiales revisados</h1>
            </div>
            <div className="body">
              <div className="tasks-container">
                {revisados.length > 0 ? (
                  revisados.map(renderCard)
                ) : (
                  <p>No has revisado ningún material aún.</p>
                )}
              </div>
            </div>
          </div>
        </Slider>

        <div className="footer">
          <button className="cursor-pointer" onClick={closePopUp}>Entendido</button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
