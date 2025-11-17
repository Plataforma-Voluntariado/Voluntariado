import React, { useState, useEffect } from "react";
import "./EditVoluntariadoModal.css";
import { updateVoluntariado } from "../../../services/voluntariado/voluntariadoService";
import { getCategorias } from "../../../services/voluntariado/voluntariadoService";
import { getDepartamentos, getCiudadesByDepartamento } from "../../../services/ubicacion/ubicacionService";
import { SuccessAlert, WrongAlert } from "../../../utils/ToastAlerts";
import Select from "react-select";
import { customSelectStylesVoluntariado } from "../../../styles/selectStylesVoluntariado";
import { TextField } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Map from "react-map-gl";
import { Marker } from "react-map-gl";
import { FaMapMarkerAlt } from "react-icons/fa";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const MAX_PHOTOS = 5;
const MAX_SIZE = 5 * 1024 * 1024;

function EditVoluntariadoModal({ voluntariado, onClose, onSuccess }) {
  const [categorias, setCategorias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFotos, setNewFotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  
  // IDs de las fotos existentes que se mantendrán
  const fotosExistentesIds = voluntariado.fotos?.map(f => f.id_foto) || [];

  const [formData, setFormData] = useState({
    titulo: voluntariado.titulo || "",
    descripcion: voluntariado.descripcion || "",
    fechaHoraInicio: new Date(voluntariado.fechaHoraInicio) || new Date(),
    horas: voluntariado.horas || 1,
    maxParticipantes: voluntariado.maxParticipantes || 10,
    categoria_id: voluntariado.categoria?.id_categoria || "",
    ubicacion: {
      latitud: parseFloat(voluntariado.ubicacion?.latitud) || -2.9001285,
      longitud: parseFloat(voluntariado.ubicacion?.longitud) || -76.6124805,
      direccion: voluntariado.ubicacion?.direccion || "",
      ciudad_id: voluntariado.ubicacion?.ciudad?.id_ciudad || "",
      nombre_sector: voluntariado.ubicacion?.nombre_sector || "",
      zona: voluntariado.ubicacion?.zona || "URBANA",
    },
  });

  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [viewport, setViewport] = useState({
    latitude: parseFloat(voluntariado.ubicacion?.latitud) || -2.9001285,
    longitude: parseFloat(voluntariado.ubicacion?.longitud) || -76.6124805,
    zoom: 14,
  });

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    try {
      const [categoriasData, departamentosData] = await Promise.all([
        getCategorias(),
        getDepartamentos(),
      ]);
      setCategorias(categoriasData);
      setDepartamentos(departamentosData);

      // Si ya tiene ciudad, cargar el departamento y las ciudades
      if (voluntariado.ubicacion?.ciudad?.departamento?.id_departamento) {
        const depId = voluntariado.ubicacion.ciudad.departamento.id_departamento;
        setSelectedDepartamento(depId);
        const ciudadesData = await getCiudadesByDepartamento(depId);
        setCiudades(ciudadesData);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    if (!selectedDepartamento) {
      setCiudades([]);
      return;
    }
    (async () => {
      try {
        const data = await getCiudadesByDepartamento(selectedDepartamento);
        setCiudades(data);
      } catch (error) {
        console.error("Error cargando ciudades:", error);
      }
    })();
  }, [selectedDepartamento]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUbicacionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ubicacion: { ...prev.ubicacion, [name]: value },
    }));
  };

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat;
    setFormData((prev) => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        latitud: lat,
        longitud: lng,
      },
    }));
    setViewport((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handlePhotoChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const currentTotal = voluntariado.fotos?.length || 0;
    const newTotal = currentTotal + newFotos.length + files.length;

    if (newTotal > MAX_PHOTOS) {
      await WrongAlert({
        title: "Límite excedido",
        message: `Solo puedes tener hasta ${MAX_PHOTOS} fotos en total.`,
      });
      return;
    }

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        await WrongAlert({
          title: "Archivo muy grande",
          message: `${file.name} supera 5MB.`,
        });
        return;
      }
    }

    // Crear previews
    const previews = await Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, url: reader.result });
          reader.readAsDataURL(file);
        });
      })
    );

    setNewFotos((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...previews]);
  };

  const removeNewPhoto = (index) => {
    setNewFotos((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      await WrongAlert({ title: "Error", message: "El título es requerido" });
      return;
    }
    if (!formData.descripcion.trim()) {
      await WrongAlert({ title: "Error", message: "La descripción es requerida" });
      return;
    }

    try {
      setLoading(true);
      // Enviar los IDs de las fotos existentes para mantenerlas
      await updateVoluntariado(voluntariado.id_voluntariado, formData, newFotos, fotosExistentesIds);
      await SuccessAlert({
        title: "¡Éxito!",
        message: "Voluntariado actualizado correctamente",
        timer: 1500,
      });
      onSuccess();
    } catch (error) {
      console.error("Error actualizando voluntariado:", error);
      await WrongAlert({
        title: "Error",
        message: error.message || "No se pudo actualizar el voluntariado",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoriaOptions = categorias.map((c) => ({
    value: c.id_categoria,
    label: c.nombre,
  }));

  const departamentoOptions = departamentos.map((d) => ({
    value: d.id_departamento,
    label: d.departamento,
  }));

  const ciudadOptions = ciudades.map((c) => ({
    value: c.id_ciudad,
    label: c.ciudad,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-edit" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-edit">
          <h2>Editar Voluntariado</h2>
          <button className="btn-close-modal" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Título */}
          <div className="form-group">
            <label>Título *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Título del voluntariado"
              required
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe el voluntariado..."
              rows={5}
              required
            />
          </div>

          {/* Fecha y hora */}
          <div className="form-row">
            <div className="form-group">
              <label>Fecha y hora de inicio *</label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  value={formData.fechaHoraInicio}
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, fechaHoraInicio: date }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDateTime={new Date()}
                />
              </LocalizationProvider>
            </div>

            <div className="form-group">
              <label>Duración (horas) *</label>
              <input
                type="number"
                name="horas"
                value={formData.horas}
                onChange={handleInputChange}
                min="1"
                max="24"
                required
              />
            </div>
          </div>

          {/* Categoría y participantes */}
          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <Select
                options={categoriaOptions}
                value={categoriaOptions.find((o) => o.value === formData.categoria_id)}
                onChange={(option) =>
                  setFormData((prev) => ({ ...prev, categoria_id: option.value }))
                }
                styles={customSelectStylesVoluntariado}
                placeholder="Selecciona una categoría"
              />
            </div>

            <div className="form-group">
              <label>Máx. participantes *</label>
              <input
                type="number"
                name="maxParticipantes"
                value={formData.maxParticipantes}
                onChange={handleInputChange}
                min="1"
                max="500"
                required
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="form-section">
            <h3>Ubicación</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Departamento *</label>
                <Select
                  options={departamentoOptions}
                  value={departamentoOptions.find((o) => o.value === selectedDepartamento)}
                  onChange={(option) => {
                    setSelectedDepartamento(option.value);
                    setFormData((prev) => ({
                      ...prev,
                      ubicacion: { ...prev.ubicacion, ciudad_id: "" },
                    }));
                  }}
                  styles={customSelectStylesVoluntariado}
                  placeholder="Selecciona un departamento"
                />
              </div>

              <div className="form-group">
                <label>Ciudad *</label>
                <Select
                  options={ciudadOptions}
                  value={ciudadOptions.find((o) => o.value === formData.ubicacion.ciudad_id)}
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      ubicacion: { ...prev.ubicacion, ciudad_id: option.value },
                    }))
                  }
                  styles={customSelectStylesVoluntariado}
                  placeholder="Selecciona una ciudad"
                  isDisabled={!selectedDepartamento}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección *</label>
              <input
                type="text"
                name="direccion"
                value={formData.ubicacion.direccion}
                onChange={handleUbicacionChange}
                placeholder="Ej: Calle 123 #45-67"
                required
              />
            </div>

            <div className="form-group">
              <label>Nombre del sector</label>
              <input
                type="text"
                name="nombre_sector"
                value={formData.ubicacion.nombre_sector}
                onChange={handleUbicacionChange}
                placeholder="Ej: Centro Histórico"
              />
            </div>

            <div className="form-group">
              <label>Zona *</label>
              <select
                name="zona"
                value={formData.ubicacion.zona}
                onChange={handleUbicacionChange}
                required
              >
                <option value="URBANA">Urbana</option>
                <option value="RURAL">Rural</option>
              </select>
            </div>

            {/* Mapa */}
            <div className="form-group">
              <label>Ubicación en el mapa (haz clic para marcar) *</label>
              <div className="map-container-edit">
                <Map
                  {...viewport}
                  onMove={(evt) => setViewport(evt.viewState)}
                  onClick={handleMapClick}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  style={{ width: "100%", height: "300px" }}
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                >
                  {formData.ubicacion.latitud && formData.ubicacion.longitud && (
                    <Marker
                      longitude={formData.ubicacion.longitud}
                      latitude={formData.ubicacion.latitud}
                      anchor="bottom"
                    >
                      <FaMapMarkerAlt size={32} color="#FF5A5F" />
                    </Marker>
                  )}
                </Map>
              </div>
              <small className="help-text">
                Coordenadas: Lat {typeof formData.ubicacion.latitud === 'number' ? formData.ubicacion.latitud.toFixed(6) : (parseFloat(formData.ubicacion.latitud) || 0).toFixed(6)}, Lng{" "}
                {typeof formData.ubicacion.longitud === 'number' ? formData.ubicacion.longitud.toFixed(6) : (parseFloat(formData.ubicacion.longitud) || 0).toFixed(6)}
              </small>
            </div>
          </div>

          {/* Fotos actuales */}
          {voluntariado.fotos && voluntariado.fotos.length > 0 && (
            <div className="form-section">
              <h3>Fotos actuales</h3>
              <div className="current-photos-grid">
                {voluntariado.fotos.map((foto, index) => (
                  <img
                    key={index}
                    src={foto.url}
                    alt={`Foto ${index + 1}`}
                    className="current-photo"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nuevas fotos */}
          <div className="form-section">
            <h3>Agregar nuevas fotos</h3>
            <div className="form-group">
              <label>Subir fotos (opcional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                disabled={
                  (voluntariado.fotos?.length || 0) + newFotos.length >= MAX_PHOTOS
                }
              />
              <small className="help-text">
                Total: {(voluntariado.fotos?.length || 0) + newFotos.length} / {MAX_PHOTOS}{" "}
                fotos. Máximo 5MB por foto.
              </small>
            </div>

            {previewImages.length > 0 && (
              <div className="preview-grid">
                {previewImages.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview.url} alt={preview.name} />
                    <button
                      type="button"
                      className="btn-remove-preview"
                      onClick={() => removeNewPhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditVoluntariadoModal;
