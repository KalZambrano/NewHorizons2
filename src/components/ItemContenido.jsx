const ItemContenido = ({ titulo, tipo, archivo, revisado }) => {
  return (
    <div className="item">
      <div className="item-info">
        <span className="icono-archivo">📄</span>
        <div>
          <p className="item-titulo">{titulo}</p>
          <p className="item-tipo">Tipo: {tipo}</p>
        </div>
      </div>
      <div className="item-meta">
        {revisado && (
          <span className="check-verde">✔ Revisado</span>
        )}
        <a href={archivo} className="ver-link" target="_blank" rel="noopener noreferrer">
          Ver archivo
        </a>
      </div>
    </div>
  );
};

export default ItemContenido;