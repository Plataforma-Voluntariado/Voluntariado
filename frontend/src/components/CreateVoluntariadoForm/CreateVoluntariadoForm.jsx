import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./CreateVoluntariadoForm.css";
import { getCategorias } from "../../services/categoria/categoriaService";
import { getDepartamentos, getCiudadesByDepartamento } from "../../services/ubicacion/ubicacionService";
import { createVoluntariado } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import { SuccessAlert, WrongAlert } from "../../utils/ToastAlerts";
import ImagePreviewModal from "./ImagePreviewModal/ImagePreviewModal";
import ImageDropzone, { DROPZONE_MAX_PHOTOS, DROPZONE_MAX_FILE_SIZE_BYTES, DROPZONE_MAX_FILE_SIZE_LABEL } from "./ImageDropzone/ImageDropzone";
import Select from "react-select";
import { customSelectStylesVoluntariado } from "../../styles/selectStylesVoluntariado";
import { TextField } from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import LocationPickerMap from "../Map/LocationPickerMap/LocationPickerMap";

const roundCoord = (value, digits = 7) => {
  const num = Number(value);
  return Number.isFinite(num) ? Number(num.toFixed(digits)) : value;
};

const readFileData = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, url: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const normalizeText = (value) => {
  if (!value) return "";
  try {
    return value.toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  } catch (error) {
    return value.toString().toLowerCase().trim();
  }
};

const parseAddressString = (address, departamentos = []) => {
  if (!address || !address.toString) return {};
  const parts = address
    .toString()
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const parsed = {
    direccion: "",
    codigo_postal: "",
    ciudad: "",
    departamento: "",
    pais: "",
    nombre_sector: ""
  };

  if (!parts.length) return parsed;
  parsed.direccion = parts[0];

  if (parts.length === 1) {
    parsed.ciudad = parts[0];
    parsed.direccion = "";
    return parsed;
  }

  if (parts.length >= 2) {
    const secondPart = parts[1];
    const normalizedSecond = normalizeText(secondPart);
    const matchingDept = departamentos.find((dept) => {
      const normalizedDept = normalizeText(dept.departamento);
      return (
        normalizedDept === normalizedSecond ||
        normalizedDept.includes(normalizedSecond) ||
        normalizedSecond.includes(normalizedDept)
      );
    });

    if (matchingDept) {
      parsed.ciudad = parts[0];
      parsed.departamento = secondPart;
      parsed.direccion = "";
      parsed.pais = parts[2] || parsed.pais;
      return parsed;
    }
  }

  for (let index = 1; index < parts.length; index += 1) {
    const section = parts[index];
    const zipMatch = section.match(/(\d{4,6})\s+(.+)/);

    if (zipMatch) {
      parsed.codigo_postal = zipMatch[1];
      parsed.ciudad = zipMatch[2].trim();
      parsed.departamento = (parts[index + 1] || parsed.departamento).trim();
      parsed.pais = (parts[index + 2] || parsed.pais).trim();
      break;
    }

    if (!parsed.ciudad && /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-()]+$/.test(section)) {
      if (parts[index + 1] && /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-()]+$/.test(parts[index + 1])) {
        parsed.ciudad = section;
        parsed.departamento = parts[index + 1];
        parsed.pais = parts[index + 2] || "";
        break;
      }
      parsed.ciudad = section;
    }
  }

  if (!parsed.ciudad && parts[1]) {
    parsed.ciudad = parts[1];
  }

  if (parsed.ciudad && normalizeText(parsed.ciudad) === normalizeText(parsed.direccion)) {
    parsed.direccion = "";
  }

  Object.keys(parsed).forEach((key) => {
    if (typeof parsed[key] === "string") {
      parsed[key] = parsed[key].trim();
    }
  });

  return parsed;
};

function CreateVoluntariadoForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [fotos, setFotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [imageResetToken, setImageResetToken] = useState(0);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaHoraInicio: "",
    horas: 1,
    maxParticipantes: 10,
    categoria_id: "",
    ubicacion: { latitud: undefined, longitud: undefined, direccion: "", ciudad_id: "", nombre_sector: "" }
  });

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const incrementImageResetToken = useCallback(() => {
    setImageResetToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [categoriasData, departamentosData] = await Promise.all([
          getCategorias(),
          getDepartamentos()
        ]);
        if (isMounted) {
          setCategorias(categoriasData || []);
          setDepartamentos(departamentosData || []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al cargar datos iniciales", error);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedDepartamento) {
      setCiudades([]);
      return;
    }

    let isMounted = true;
    const loadCities = async () => {
      try {
        const data = await getCiudadesByDepartamento(selectedDepartamento);
        if (isMounted) {
          setCiudades(data || []);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al cargar ciudades", error);
      }
    };

    loadCities();
    return () => {
      isMounted = false;
    };
  }, [selectedDepartamento]);

  const processFiles = useCallback(
    async (fileList) => {
      const filesArr = Array.from(fileList || []);
      if (!filesArr.length) return;

      if (fotos.length + filesArr.length > DROPZONE_MAX_PHOTOS) {
        const available = DROPZONE_MAX_PHOTOS - fotos.length;
        await WrongAlert({
          title: "Límite excedido",
          message: `Solo puedes agregar ${available} imagen(es) más.`
        });
        return;
      }

      for (const file of filesArr) {
        if (file.size > DROPZONE_MAX_FILE_SIZE_BYTES) {
          await WrongAlert({
            title: "Archivo muy grande",
            message: `${file.name} supera ${DROPZONE_MAX_FILE_SIZE_LABEL}.`
          });
          return;
        }
      }

      try {
        const previews = await Promise.all(filesArr.map(readFileData));
        setFotos((prev) => [...prev, ...filesArr]);
        setPreviewImages((prev) => [...prev, ...previews]);
        clearError("fotos");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al procesar imágenes", error);
        await WrongAlert({
          title: "Error",
          message: "No se pudieron procesar las imágenes"
        });
      }
    },
    [clearError, fotos.length]
  );

  const handleInputChange = useCallback(
    (event) => {
      const { name, value } = event.target;
      if (name.startsWith("ubicacion.")) {
        const key = name.split(".")[1];
        setFormData((prev) => {
          const nextUbicacion = { ...prev.ubicacion, [key]: value };
          if (key === "nombre_sector" && value.trim() && !prev.ubicacion.direccion?.trim()) {
            nextUbicacion.direccion = value;
          }
          return { ...prev, ubicacion: nextUbicacion };
        });
        if (key === "nombre_sector" && value.trim()) {
          clearError("ubicacion.direccion");
        }
      } else {
        const numericFields = ["horas", "maxParticipantes", "categoria_id"];
        const parsedValue = numericFields.includes(name) ? parseInt(value, 10) || "" : value;
        setFormData((prev) => ({ ...prev, [name]: parsedValue }));
      }
      clearError(name);
    },
    [clearError]
  );

  const handleSelectChange = useCallback(
    (name, selected) => {
      const value = selected ? selected.value : "";
      if (name === "departamento") {
        setSelectedDepartamento(value);
        setCiudades([]);
        setFormData((prev) => ({
          ...prev,
          ubicacion: { ...prev.ubicacion, ciudad_id: "" }
        }));
      } else if (name === "ubicacion.ciudad_id") {
        setFormData((prev) => ({
          ...prev,
          ubicacion: { ...prev.ubicacion, ciudad_id: value }
        }));
      } else if (name === "categoria_id") {
        setFormData((prev) => ({ ...prev, categoria_id: value }));
      }

      clearError(name);
    },
    [clearError]
  );

  const handleClearAllImages = useCallback(() => {
    setFotos([]);
    setPreviewImages([]);
    incrementImageResetToken();
    clearError("fotos");
  }, [clearError, incrementImageResetToken]);

  const removeImage = useCallback(
    (index) => {
      setFotos((prev) => prev.filter((_, i) => i !== index));
      setPreviewImages((prev) => {
        const next = prev.filter((_, i) => i !== index);
        if (!next.length) {
          incrementImageResetToken();
        }
        return next;
      });
    },
    [incrementImageResetToken]
  );

  const openImageModal = useCallback((image, index) => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    setSelectedImageModal({ ...image, index, scrollY });
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    else if (formData.titulo.length > 255) newErrors.titulo = "Máx 255 caracteres";

    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!formData.fechaHoraInicio) newErrors.fechaHoraInicio = "La fecha y hora son obligatorias";
    else if (new Date(formData.fechaHoraInicio) <= new Date()) {
      newErrors.fechaHoraInicio = "La fecha debe ser futura";
    }
    if (!formData.horas || formData.horas < 1) newErrors.horas = "Las horas deben ser mínimo 1";
    if (!formData.maxParticipantes || formData.maxParticipantes < 1) {
      newErrors.maxParticipantes = "Mínimo 1 participante";
    } else if (formData.maxParticipantes > 100) {
      newErrors.maxParticipantes = "Máximo 100 participantes";
    }
    if (!formData.categoria_id) newErrors.categoria_id = "La categoría es obligatoria";
    const hasDireccion = formData.ubicacion.direccion.trim();
    const hasSector = formData.ubicacion.nombre_sector.trim();
    if (!formData.ubicacion.ciudad_id) {
      newErrors["ubicacion.ciudad_id"] = "La ciudad es obligatoria";
    }
    if (!hasDireccion && !hasSector) {
      newErrors["ubicacion.direccion"] = "La dirección es obligatoria";
      newErrors["ubicacion.nombre_sector"] = "El barrio/sector es obligatorio";
    }
    if (!fotos || fotos.length === 0) newErrors.fotos = "Debes subir al menos una foto";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fotos, formData]);


  const resetForm = useCallback(() => {
    setFormData({
      titulo: "",
      descripcion: "",
      fechaHoraInicio: "",
      horas: 1,
      maxParticipantes: 10,
      categoria_id: "",
      ubicacion: { latitud: "", longitud: "", direccion: "", ciudad_id: "", nombre_sector: "" }
    });
    setSelectedDepartamento("");
    setCiudades([]);
    handleClearAllImages();
    setErrors({});
  }, [handleClearAllImages]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!validateForm()) {
        await WrongAlert({
          title: "Formulario incompleto",
          message: "Por favor completa todos los campos obligatorios"
        });
        return;
      }

      if (!user || user.rol !== "CREADOR") {
        await WrongAlert({
          title: "Permisos insuficientes",
          message: "Debes estar autenticado con rol CREADOR para crear voluntariados"
        });
        return;
      }

      setLoading(true);

      try {
        const finalDireccion = (formData.ubicacion.direccion || formData.ubicacion.nombre_sector || "").trim();
        const payload = {
          ...formData,
          ubicacion: {
            ...formData.ubicacion,
            direccion: finalDireccion,
            ciudad_id: parseInt(formData.ubicacion.ciudad_id, 10)
          }
        };

        // eslint-disable-next-line no-console
        console.log("Payload de creación de voluntariado:", payload);
        const result = await createVoluntariado(payload, fotos);
        await SuccessAlert({
          title: "¡Voluntariado creado!",
          timer: 1500
        });

        resetForm();
        if (onSuccess) onSuccess(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al crear voluntariado", error);
        await WrongAlert({
          title: "Error al crear voluntariado",
          message: error?.message || "Ocurrió un error al intentar crear el voluntariado"
        });
      } finally {
        setLoading(false);
      }
    },
    [fotos, formData, onSuccess, resetForm, user, validateForm]
  );

  const categoriaOptions = useMemo(
    () =>
      categorias.map((cat) => ({
        value: cat.id_categoria,
        label: cat.nombre
      })),
    [categorias]
  );

  const selectedCategoriaValue = useMemo(() => {
    if (!formData.categoria_id) return null;
    const match = categorias.find((cat) => cat.id_categoria === formData.categoria_id);
    return match ? { value: formData.categoria_id, label: match.nombre } : null;
  }, [categorias, formData.categoria_id]);

  const ciudadDetectadaLabel = useMemo(() => {
    if (!formData.ubicacion.ciudad_id || !ciudades.length) return "";
    const match = ciudades.find((ciudad) => ciudad.id_ciudad === formData.ubicacion.ciudad_id);
    return match?.ciudad || "";
  }, [ciudades, formData.ubicacion.ciudad_id]);

  const hasCreatorAccess = user?.rol === "CREADOR";

  const autoSelectLocationFromParsed = useCallback(
    async (parsed) => {
      if (!parsed) return;
      const parsedDept = normalizeText(parsed.departamento);
      const parsedCity = normalizeText(parsed.ciudad);
      if (!parsedDept && !parsedCity) return;

      const findCityInDept = async (deptId) => {
        const citiesData = await getCiudadesByDepartamento(deptId);
        const match = citiesData.find((city) => {
          const normalizedCity = normalizeText(city.ciudad);
          return (
            normalizedCity === parsedCity ||
            normalizedCity.includes(parsedCity) ||
            parsedCity.includes(normalizedCity)
          );
        });
        return { match, citiesData };
      };

      if (parsedDept) {
        const departmentMatch = departamentos.find((dept) => normalizeText(dept.departamento) === parsedDept);
        if (departmentMatch) {
          setSelectedDepartamento(departmentMatch.id_departamento);
          try {
            const { match, citiesData } = await findCityInDept(departmentMatch.id_departamento);
            setCiudades(citiesData);
            if (match) {
              setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, ciudad_id: match.id_ciudad }
              }));
              clearError("ubicacion.ciudad_id");
            }
            return;
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error autocompletando ciudad", error);
          }
        }
      }

      if (parsedCity) {
        for (const dept of departamentos) {
          try {
            const { match, citiesData } = await findCityInDept(dept.id_departamento);
            if (match) {
              setSelectedDepartamento(dept.id_departamento);
              setCiudades(citiesData);
              setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, ciudad_id: match.id_ciudad }
              }));
              clearError("ubicacion.ciudad_id");
              break;
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error buscando ciudad por departamento", error);
          }
        }
      }
    },
    [clearError, departamentos]
  );

  const handleMapSelect = useCallback(
    async ({ latitud, longitud, direccion }) => {
      setFormData((prev) => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          latitud: roundCoord(latitud),
          longitud: roundCoord(longitud),
          direccion: direccion ? direccion.trim() : ""
        }
      }));

      if (!direccion) return;

      const parsed = parseAddressString(direccion, departamentos);

      // eslint-disable-next-line no-console
      console.log("Dirección parseada:", parsed);

      setFormData((prev) => {
        const parsedDireccion = parsed.direccion?.trim() || "";
        const parsedSector = parsed.nombre_sector?.trim() || "";

        const direccionFinal =
          parsedDireccion !== ""
            ? parsedDireccion
            : parsedSector || ""; 

        return {
          ...prev,
          ubicacion: {
            ...prev.ubicacion,
            direccion: direccionFinal,
            nombre_sector: parsedSector || prev.ubicacion.nombre_sector
          }
        };
      });

      if (parsed.direccion || parsed.nombre_sector) {
        clearError("ubicacion.direccion");
        clearError("ubicacion.nombre_sector");
      }

      try {
        await autoSelectLocationFromParsed(parsed);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error auto-seleccionando ubicación", error);
      }
    },
    [autoSelectLocationFromParsed, clearError, departamentos]
  );



  if (!hasCreatorAccess) {
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

  return (
    <>
      <div className="create-voluntariado-form-container">
        <form onSubmit={handleSubmit} className="create-voluntariado-form">
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
                      clearError("fechaHoraInicio");
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
          <div className="ubicacion-section">
            <h3>Ubicación del Voluntariado</h3>
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
            {ciudadDetectadaLabel && (
              <p className="secondary-text" style={{ marginBottom: "1rem" }}>
                Ciudad detectada automáticamente: {ciudadDetectadaLabel}
              </p>
            )}

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

          <ImageDropzone
            label="Fotos del Voluntariado *"
            previewImages={previewImages}
            error={errors.fotos}
            onFilesSelected={processFiles}
            onRemoveImage={removeImage}
            onClearAll={handleClearAllImages}
            onOpenPreview={openImageModal}
            resetTrigger={imageResetToken}
          />

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