import React, { useState, useEffect, useRef } from "react";
import "./CreateVoluntariadoForm.css";
import { getCategorias } from "../../services/categoria/categoriaService";
import { getDepartamentos, getCiudadesByDepartamento } from "../../services/ubicacion/ubicacionService";
import { createVoluntariado } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import { SuccessAlert } from "../../utils/ToastAlerts";
import { WrongAlert } from "../../utils/ToastAlerts";
import ImagePreviewModal from "./ImagePreviewModal/ImagePreviewModal";
import Select from "react-select";
import { customSelectStylesVoluntariado } from "../../styles/selectStylesVoluntariado";
import { TextField } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import LocationPickerMap from "../Map/LocationPickerMap/LocationPickerMap";


const MAX_PHOTOS = 5;
const MAX_SIZE = 5 * 1024 * 1024;

const DEFAULT_COORDS = { latitud: 1.1491254, longitud: -76.6465421 };

// Helper para redondear coordenadas a N decimales (7 por defecto)
const roundCoord = (n, digits = 7) => {
  const num = Number(n);
  return Number.isFinite(num) ? Number(num.toFixed(digits)) : n;
};

function CreateVoluntariadoForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const mapRef = useRef(null);
  const [categorias, setCategorias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [fotos, setFotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_COORDS.longitud,
    latitude: DEFAULT_COORDS.latitud,
    zoom: 13
  });
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaHoraInicio: "",
    horas: 1,
    maxParticipantes: 10,
    categoria_id: "",
    ubicacion: { ...DEFAULT_COORDS, direccion: "", ciudad_id: "", nombre_sector: "" }
  });

  // Geocodificación inversa para obtener dirección desde coordenadas
  const getAddressFromCoords = async (lng, lat) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return feature.place_name;
      }
      return "Dirección no disponible";
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
      return "Error al obtener dirección";
    }
  };

  // Manejar clic en el mapa
  const handleMapClick = async (event) => {
    const { lngLat } = event;
    // Redondear a 8 decimales como máximo (según el DTO del backend)
    const lng = parseFloat(lngLat.lng.toFixed(8));
    const lat = parseFloat(lngLat.lat.toFixed(8));
    
    // Actualizar marcador
    setMarkerPosition({ longitude: lng, latitude: lat });
    
    // Obtener dirección
    const address = await getAddressFromCoords(lng, lat);
    
    // Actualizar formulario
    setFormData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        latitud: lat,
        longitud: lng,
        direccion: address
      }
    }));
    
    // Limpiar error de dirección si existe
    if (errors["ubicacion.direccion"]) {
      setErrors(prev => ({ ...prev, "ubicacion.direccion": "" }));
    }
  };

  useEffect(() => {
    (async () => {
      try { setCategorias(await getCategorias()); }
      catch {
      }
      try { setDepartamentos(await getDepartamentos()); }
      catch {
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDepartamento) {
      setCiudades([]);
      setFormData(prev => ({ ...prev, ubicacion: { ...prev.ubicacion, ciudad_id: "" } }));
      return;
    }
    (async () => {
      try {
        const data = await getCiudadesByDepartamento(selectedDepartamento);
        setCiudades(data);
      } catch {
      }
    })();
  }, [selectedDepartamento]);

  const readFileData = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res({ name: file.name, url: reader.result });
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const processFiles = async (fileList) => {
    const filesArr = Array.from(fileList);
    if (fotos.length + filesArr.length > MAX_PHOTOS) {
      const available = MAX_PHOTOS - fotos.length;
      await WrongAlert({
        title: "Límite excedido",
        message: `Solo puedes agregar ${available} imagen(es) más.`
      });
      return;
    }
    for (const f of filesArr) {
      if (f.size > MAX_SIZE) {
        await WrongAlert({
          title: "Archivo muy grande",
          message: `${f.name} supera 5MB.`
        });
        return;
      }
    }
    try {
      const previews = await Promise.all(filesArr.map(readFileData));
      setFotos(prev => [...prev, ...filesArr]);
      setPreviewImages(prev => [...prev, ...previews]);
      setErrors(prev => ({ ...prev, fotos: "" }));
    } catch {
      await WrongAlert({
        title: "Error",
        message: "No se pudieron procesar las imágenes"
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("ubicacion.")) {
      const key = name.split(".")[1];
      setFormData(prev => ({ ...prev, ubicacion: { ...prev.ubicacion, [key]: value } }));
    } else {
      const parsed = ["horas", "maxParticipantes", "categoria_id"].includes(name) ? (parseInt(value) || "") : value;
      setFormData(prev => ({ ...prev, [name]: parsed }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name, selected) => {
    const value = selected ? selected.value : "";
    if (name === "departamento") {
      setSelectedDepartamento(value);
      setCiudades([]);
      setFormData(prev => ({ ...prev, ubicacion: { ...prev.ubicacion, ciudad_id: "" } }));
    } else if (name === "ubicacion.ciudad_id") {
      setFormData(prev => ({
        ...prev,
        ubicacion: { ...prev.ubicacion, ciudad_id: value }
      }));
    } else if (name === "categoria_id") {
      setFormData(prev => ({ ...prev, categoria_id: value }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFotosChange = (e) => {
    const files = e.target.files;
    if (files && files.length) processFiles(files);
    const input = document.getElementById("fotos");
    if (input) input.value = "";
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files) processFiles(e.dataTransfer.files); };

  const removeImage = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    const input = document.getElementById("fotos");
    if (input && previewImages.length - 1 === 0) input.value = "";
  };

  const clearAllImages = () => { setFotos([]); setPreviewImages([]); const input = document.getElementById("fotos"); if (input) input.value = ""; };

  const openImageModal = (image, index) => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    setSelectedImageModal({ ...image, index, scrollY });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    else if (formData.titulo.length > 255) newErrors.titulo = "Máx 255 caracteres";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!formData.fechaHoraInicio) newErrors.fechaHoraInicio = "La fecha y hora son obligatorias";
    else if (new Date(formData.fechaHoraInicio) <= new Date()) newErrors.fechaHoraInicio = "La fecha debe ser futura";
    if (!formData.horas || formData.horas < 1) newErrors.horas = "Las horas deben ser mínimo 1";
    if (!formData.maxParticipantes || formData.maxParticipantes < 1) newErrors.maxParticipantes = "Mínimo 1 participante";
    else if (formData.maxParticipantes > 100) newErrors.maxParticipantes = "Máximo 100 participantes";
    if (!formData.categoria_id) newErrors.categoria_id = "La categoría es obligatoria";
    if (!formData.ubicacion.direccion.trim()) newErrors["ubicacion.direccion"] = "La dirección es obligatoria";
    if (!formData.ubicacion.nombre_sector.trim()) newErrors["ubicacion.nombre_sector"] = "El barrio/sector es obligatorio";
    if (!formData.ubicacion.ciudad_id) newErrors["ubicacion.ciudad_id"] = "La ciudad es obligatoria";
    if (!fotos || fotos.length === 0) newErrors.fotos = "Debes subir al menos una foto";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      titulo: "", descripcion: "", fechaHoraInicio: "", horas: 1, maxParticipantes: 10, categoria_id: "",
      ubicacion: { ...DEFAULT_COORDS, direccion: "", ciudad_id: "", nombre_sector: "" }
    });
    setFotos([]); 
    setPreviewImages([]); 
    setSelectedDepartamento("");
    setMarkerPosition(null);
    setViewState({
      longitude: DEFAULT_COORDS.longitud,
      latitude: DEFAULT_COORDS.latitud,
      zoom: 13
    });
    const fileInput = document.getElementById("fotos"); 
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    if (!validateForm()) {
      await WrongAlert({
        title: "Formulario incompleto",
        message: "Por favor completa todos los campos obligatorios"
      });
      return;
    }

    // Validar autenticación y rol
    if (!user || user.rol !== "CREADOR") {
      await WrongAlert({
        title: "Permisos insuficientes",
        message: "Debes estar autenticado con rol CREADOR para crear voluntariados"
      });
      return;
    }

    setLoading(true);

    try {
      // Asegurar que ciudad_id sea un número
      const dataToSend = {
        ...formData,
        ubicacion: {
          ...formData.ubicacion,
          ciudad_id: parseInt(formData.ubicacion.ciudad_id)
        }
      };

      console.log("Datos a enviar:", dataToSend);
      
      // Crear voluntariado usando directamente los datos del formulario y fotos
      const result = await createVoluntariado(dataToSend, fotos);
      await SuccessAlert({
        title: "¡Voluntariado creado!",
        timer: 1500
      });

      // Resetear formulario y pasar el resultado al callback
      resetForm();
      if (onSuccess) onSuccess(result);

    } catch (err) {
      console.log(err)
      await WrongAlert({
        title: "Error al crear voluntariado",
        message: err?.message || "Ocurrió un error al intentar crear el voluntariado"
      });
    } finally {
      setLoading(false);
    }
  };

  // Preparar opciones para los selects
  const departamentoOptions = departamentos.map(dept => ({
    value: dept.id_departamento,
    label: dept.departamento
  }));

  const ciudadOptions = ciudades.map(ciudad => ({
    value: ciudad.id_ciudad,
    label: ciudad.ciudad
  }));

  const categoriaOptions = categorias.map(cat => ({
    value: cat.id_categoria,
    label: cat.nombre
  }));

  // Valores seleccionados para los selects
  const selectedDeptValue = selectedDepartamento ? {
    value: selectedDepartamento,
    label: departamentos.find(dept => dept.id_departamento === selectedDepartamento)?.departamento
  } : null;

  const selectedCiudadValue = formData.ubicacion.ciudad_id ? {
    value: formData.ubicacion.ciudad_id,
    label: ciudades.find(ciudad => ciudad.id_ciudad === formData.ubicacion.ciudad_id)?.ciudad
  } : null;

  const selectedCategoriaValue = formData.categoria_id ? {
    value: formData.categoria_id,
    label: categorias.find(cat => cat.id_categoria === formData.categoria_id)?.nombre
  } : null;

  if (!user || user.rol !== "CREADOR") {
    return (
      <div className="create-voluntariado-form-container">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2>Acceso Restringido</h2>
          <p>Solo los usuarios con rol CREADOR pueden acceder a esta función.</p>
          <p>Tu rol actual: {user?.rol || "No autenticado"}</p>
        </div>
      </div>
    );
  }

  // Map selection handler: updates lat, lng and address
  const handleMapSelect = ({ latitud, longitud, direccion }) => {
    setFormData(prev => ({
      ...prev,
      ubicacion: {
        ...prev.ubicacion,
        latitud: roundCoord(latitud),
        longitud: roundCoord(longitud),
        // Only overwrite if we got an address; keeps manual edits if reverse geocode failed
        direccion: direccion ?? prev.ubicacion.direccion
      }
    }));
    if (direccion && errors["ubicacion.direccion"]) {
      setErrors(prev => ({ ...prev, "ubicacion.direccion": "" }));
    }
  };

  return (
    <>
      <div className="create-voluntariado-form-container">
        <form onSubmit={handleSubmit} className="create-voluntariado-form">
          {/* Título y categoría */}
          <div className="form-row">
            <div className="form-group">
              <label className="register-form-label">Título *</label>
              <input
                className={`register-form-input ${errors.titulo ? "error" : ""}`}
                value={formData.titulo}
                onChange={handleInputChange}
                maxLength="255"
                placeholder="Ingresa el título"
                name="titulo"
              />
              {errors.titulo && <span className="error-text">{errors.titulo}</span>}
            </div>
            <div className="form-group">
              <label className="register-form-label">Categoría *</label>
              <Select
                className="register-form-react-select"
                options={categoriaOptions}
                value={selectedCategoriaValue}
                onChange={(selected) => handleSelectChange("categoria_id", selected)}
                placeholder="Selecciona una categoría"
                isClearable
                styles={customSelectStylesVoluntariado}
                isSearchable={false}
              />
              {errors.categoria_id && <span className="error-text">{errors.categoria_id}</span>}
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group form-group-text-area">
            <label className="register-form-label">Descripción *</label>
            <textarea
              className={`register-form-input ${errors.descripcion ? "error" : ""}`}
              value={formData.descripcion}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe el voluntariado"
              name="descripcion"
            />
            {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
          </div>

          {/* Fecha / horas / participantes */}
          <div className="form-row">
            <div className="form-group">
              <div className="fecha-picker-wrapper" style={{ width: "100%" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Fecha y Hora *"
                    value={formData.fechaHoraInicio ? new Date(formData.fechaHoraInicio) : null}
                    onChange={(newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        fechaHoraInicio: newValue ? newValue.toISOString() : ""
                      }));
                      if (errors.fechaHoraInicio) setErrors(prev => ({ ...prev, fechaHoraInicio: "" }));
                    }}
                    minDate={new Date()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth 
                        className={`register-form-input ${errors.fechaHoraInicio ? "error" : ""}`}
                        sx={{
                          "& .MuiInputBase-root": {
                            fontFamily: "Inter, system-ui, sans-serif",
                            borderRadius: "12px",
                            padding: "0.5rem 0.8rem",
                            backgroundColor: "#fdfdfd",
                            fontSize: "0.95rem"
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: errors.fechaHoraInicio ? "#dc2626" : "#cbd5e1"
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#2563eb"
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#2563eb",
                            boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.15)"
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </div>
              {errors.fechaHoraInicio && <span className="error-text">{errors.fechaHoraInicio}</span>}
            </div>
            <div className="form-group">
              <label className="register-form-label">Duración (horas) *</label>
              <input
                className={`register-form-input ${errors.horas ? "error" : ""}`}
                type="number"
                value={formData.horas}
                onChange={handleInputChange}
                min="1"
                max="24"
                name="horas"
              />
              {errors.horas && <span className="error-text">{errors.horas}</span>}
            </div>
            <div className="form-group">
              <label className="register-form-label">Máx Participantes *</label>
              <input
                className={`register-form-input ${errors.maxParticipantes ? "error" : ""}`}
                type="number"
                value={formData.maxParticipantes}
                onChange={handleInputChange}
                min="1"
                max="100"
                name="maxParticipantes"
              />
              {errors.maxParticipantes && <span className="error-text">{errors.maxParticipantes}</span>}
            </div>
          </div>

          {/* Ubicación */}
          <div className="ubicacion-section">
            <h3>Ubicación del Voluntariado</h3>

            {/* Mapa para seleccionar ubicación */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="register-form-label">Selecciona en el mapa</label>
              <LocationPickerMap
                initialLat={formData.ubicacion.latitud}
                initialLng={formData.ubicacion.longitud}
                onSelect={handleMapSelect}
                height={360}
              />
              <p className="secondary-text" style={{ marginTop: "0.5rem" }}>
                Haz clic en el mapa para elegir la ubicación. Se autocompleta la dirección y se guardan las coordenadas.
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="register-form-label">Departamento *</label>
                <Select
                  className="register-form-react-select"
                  options={departamentoOptions}
                  value={selectedDeptValue}
                  onChange={(selected) => handleSelectChange("departamento", selected)}
                  placeholder="Selecciona un departamento"
                  isClearable
                  styles={customSelectStylesVoluntariado}
                  isSearchable={false}
                />
              </div>
              <div className="form-group">
                <label className="register-form-label">Ciudad *</label>
                <Select
                  className="register-form-react-select"
                  options={ciudadOptions}
                  value={selectedCiudadValue}
                  onChange={(selected) => handleSelectChange("ubicacion.ciudad_id", selected)}
                  placeholder={selectedDepartamento ? "Selecciona una ciudad" : "Seleccione un departamento"}
                  isDisabled={!selectedDepartamento}
                  isClearable
                  styles={customSelectStylesVoluntariado}
                  isSearchable={false}
                />
                {errors["ubicacion.ciudad_id"] && <span className="error-text">{errors["ubicacion.ciudad_id"]}</span>}
              </div>
            </div>


            <div className="form-group">
              <label className="register-form-label">Dirección *</label>
              <input
                className={`register-form-input ${errors["ubicacion.direccion"] ? "error" : ""}`}
                value={formData.ubicacion.direccion}
                onChange={handleInputChange}
                placeholder="Dirección completa (se autocompleta al seleccionar en el mapa)"
                name="ubicacion.direccion"
              />
              {errors["ubicacion.direccion"] && <span className="error-text">{errors["ubicacion.direccion"]}</span>}
            </div>

            {/* Dirección (solo lectura) */}
            <div className="form-group">
              <label className="register-form-label">Dirección seleccionada</label>
              <input
                className="register-form-input direccion-readonly"
                value={formData.ubicacion.direccion || "Haz clic en el mapa para seleccionar la ubicación"}
                readOnly
                placeholder="La dirección se mostrará aquí"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="register-form-label">Barrio/Sector *</label>
                <input
                  className={`register-form-input ${errors["ubicacion.nombre_sector"] ? "error" : ""}`}
                  value={formData.ubicacion.nombre_sector}
                  onChange={handleInputChange}
                  placeholder="Barrio o sector"
                  name="ubicacion.nombre_sector"
                />
                {errors["ubicacion.nombre_sector"] && (
                  <span className="error-text">{errors["ubicacion.nombre_sector"]}</span>
                )}
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="form-group">
            <label className="register-form-label">Fotos del Voluntariado *</label>
            <div
              className={`drag-drop-zone ${isDragOver ? "drag-over" : ""} ${errors.fotos ? "error" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fotos").click()}
            >
              <div className="drag-drop-content">
                <div className="upload-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13L12 9L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 9V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="primary-text">{previewImages.length ? `Arrastra más imágenes o haz clic para agregar` : `Arrastra tus imágenes o haz clic para seleccionar`}</p>
                <p className="secondary-text">Máximo 5 fotos • Hasta 5MB cada una • JPG, PNG, GIF</p>
              </div>
              <input id="fotos" type="file" accept="image/*" multiple onChange={handleFotosChange} style={{ display: "none" }} />
            </div>
            {errors.fotos && <span className="error-text">{errors.fotos}</span>}

            {previewImages.length > 0 && (
              <div className="image-preview-container">
                <div className="preview-header">
                  <p className="preview-title">Imágenes seleccionadas ({previewImages.length}/{MAX_PHOTOS})</p>
                  <button type="button" className="clear-all-btn" onClick={clearAllImages}>Limpiar todo</button>
                </div>
                <div className="image-preview-grid">
                  {previewImages.map((image, i) => (
                    <div key={i} className="image-preview-item">
                      <div className="image-container" onClick={() => openImageModal(image, i)}>
                        <img src={image.url} alt={image.name} className="preview-image" />
                        <div className="image-overlay">
                          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                          </svg>
                        </div>
                      </div>
                      <button type="button" className="remove-image-btn" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>✕</button>
                      <p className="image-name">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            {onCancel && <button type="button" onClick={onCancel} className="btn-cancel">Cancelar</button>}
            <button type="submit" disabled={loading} className="btn-submit">{loading ? "Creando..." : "Crear Voluntariado"}</button>
          </div>
        </form>
      </div>

      <ImagePreviewModal
        image={selectedImageModal}
        onClose={() => setSelectedImageModal(null)}
      />
    </>
  );
}

export default CreateVoluntariadoForm;