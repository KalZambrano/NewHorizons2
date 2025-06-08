import { useState } from 'react';
import ItemContenido from './ItemContenido';
import RankingModal from './RankingModal';
import DesempenoEstudiante from './DesempenoEstudiante';

const SemanaAccordion = ({ semana, contenidos, estudiantes, estudianteActual, maxPuntos }) => {
  const [abierto, setAbierto] = useState(false);
  const [mostrarRanking, setMostrarRanking] = useState(false);
  const [mostrarDesempeno, setMostrarDesempeno] = useState(false);

  return (
    <div className="semana-container">
      <div className="semana-header">
        <button onClick={() => setAbierto(!abierto)} className="semana-titulo">
          {semana}
          <span className={`flecha ${abierto ? 'arriba' : 'abajo'}`}>▾</span>
        </button>

        <button className="ranking-btn" onClick={() => setMostrarRanking(true)}>
          Ver ranking
        </button>

        {estudianteActual && (
          <button className="ranking-btn" onClick={() => setMostrarDesempeno(true)}>
            Ver ranking estudiante
          </button>
        )}
      </div>

      {abierto && (
        <div className="contenido">
          {contenidos.map((contenido, i) => (
            <ItemContenido key={i} {...contenido} />
          ))}
        </div>
      )}

      {mostrarRanking && (
        <RankingModal
          estudiantes={estudiantes}
          maxPuntos={maxPuntos}
          semana={semana}
          onClose={() => setMostrarRanking(false)}
        />
      )}

      {mostrarDesempeno && (
        <DesempenoEstudiante
          estudiantes={estudiantes}
          estudianteActual={estudianteActual}
          maxPuntos={maxPuntos}
          semana={semana} 
          onClose={() => setMostrarDesempeno(false)}
        />
      )}
    </div>
  );
};

export default SemanaAccordion;