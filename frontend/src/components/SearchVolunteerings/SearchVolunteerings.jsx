import React, { useEffect, useState } from "react";
import "./SearchVolunteerings.css";
import { getCategorias } from "../../services/voluntariado/voluntariadoService";

export default function SearchVolunteerings({ onApplyFilters }) {
  const [categorias, setCategorias] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [openTags, setOpenTags] = useState(false);

  const loadCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error cargando categorias", e);
      setCategorias([]);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const apply = () => {
    const filters = {};
    if (search && search.trim() !== "") filters.search = search.trim();
    if (selectedCategoria) filters.categoria_id = selectedCategoria;
    onApplyFilters(filters);
  };

  const clear = () => {
    setSearch("");
    setSelectedCategoria("");
    onApplyFilters({});
  };

  const toggleCategoria = (id) => {
    const newId = selectedCategoria === id ? "" : id;
    setSelectedCategoria(newId);
    const filters = {};
    if (search && search.trim() !== "") filters.search = search.trim();
    if (newId) filters.categoria_id = newId;
    onApplyFilters(filters);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") apply();
  };

  return (
    <div className="search-volunteerings">
      <div className="search-box" onClick={() => setOpenTags(false)}>
        <input
          className="search-input"
          placeholder="Buscar por título o descripción"
          value={search}
          onKeyDown={onKeyDown}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="actions">
          <button className="btn-ghost" onClick={apply} aria-label="Buscar">Buscar</button>
          <button className="btn-clear" onClick={clear} aria-label="Limpiar">Limpiar</button>
          <button className="btn-tags" onClick={() => setOpenTags(!openTags)} aria-label="Etiquetas">Etiquetas</button>
        </div>
      </div>

      {openTags && (
        <div className="tags-panel">
          {categorias.map((c) => (
            <button
              key={c.id_categoria}
              className={`tag-item ${String(selectedCategoria) === String(c.id_categoria) ? "selected" : ""}`}
              onClick={() => toggleCategoria(c.id_categoria)}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      {!openTags && categorias.length > 0 && (
        <div className="tags-inline">
          {categorias.slice(0, 6).map((c) => (
            <button
              key={c.id_categoria}
              className={`tag-item small ${String(selectedCategoria) === String(c.id_categoria) ? "selected" : ""}`}
              onClick={() => toggleCategoria(c.id_categoria)}
            >
              {c.nombre}
            </button>
          ))}
          {categorias.length > 6 && (
            <button className="tag-more" onClick={() => setOpenTags(true)}>Más...</button>
          )}
        </div>
      )}
    </div>
  );
}