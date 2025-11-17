import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import LocationPickerMap from "../../Map/LocationPickerMap/LocationPickerMap";
import ImageDropzone, { DROPZONE_MAX_PHOTOS as MAX_PHOTOS, DROPZONE_MAX_FILE_SIZE_BYTES } from "../../CreateVoluntariadoForm/ImageDropzone/ImageDropzone";
import ImagePreviewModal from "../../CreateVoluntariadoForm/ImagePreviewModal/ImagePreviewModal";

const MAX_SIZE = DROPZONE_MAX_FILE_SIZE_BYTES;

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

function EditVoluntariadoModal({ voluntariado, onClose, onSuccess }) {
  const [categorias, setCategorias] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFotos, setNewFotos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [imageResetToken, setImageResetToken] = useState(0);
  const [keptExistingPhotoIds, setKeptExistingPhotoIds] = useState(
    voluntariado.fotos?.map((f) => f.id_foto) || []
  );
  
  // IDs de las fotos existentes que se mantendrán se manejan en keptExistingPhotoIds

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

      // Previews iniciales con fotos existentes
      const existingPreviews = (voluntariado.fotos || []).map((f, idx) => ({
        name: f.nombre || `Foto ${idx + 1}`,
        url: f.url,
        existing: true,
        id_foto: f.id_foto,
      }));
      setPreviewImages(existingPreviews);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  // No mostramos selects de ciudad/departamento en UI, pero mantenemos datos
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

  const processFiles = useCallback(
    async (fileList) => {
      const filesArr = Array.from(fileList || []);
      if (!filesArr.length) return;

      const existingCount = keptExistingPhotoIds.length;
      const totalAfter = existingCount + newFotos.length + filesArr.length;
      if (totalAfter > MAX_PHOTOS) {
        const available = Math.max(0, MAX_PHOTOS - existingCount - newFotos.length);
        await WrongAlert({
          title: "Límite excedido",
          message: available > 0
            ? `Solo puedes agregar ${available} imagen(es) más.`
            : `Ya alcanzaste el máximo de ${MAX_PHOTOS} fotos.`,
        });
        return;
      }

      for (const file of filesArr) {
        if (file.size > MAX_SIZE) {
          await WrongAlert({
            title: "Archivo muy grande",
            message: `${file.name} supera 5MB.`,
          });
          return;
        }
      }

      try {
        const previews = await Promise.all(filesArr.map(readFileData));
        const marked = previews.map((p) => ({ ...p, existing: false }));
        setNewFotos((prev) => [...prev, ...filesArr]);
        setPreviewImages((prev) => [...prev, ...marked]);
        clearError("fotos");
      } catch (error) {
        console.error("Error al procesar imágenes", error);
        await WrongAlert({
          title: "Error",
          message: "No se pudieron procesar las imágenes",
        });
      }
    },
    [clearError, newFotos.length, keptExistingPhotoIds]
  );

  const handleClearAllImages = useCallback(() => {
    if (keptExistingPhotoIds.length === 0) {
      WrongAlert({
        title: "Debe haber al menos una foto",
        message: "Mantén al menos una imagen en el voluntariado.",
      });
      return;
    }
    setNewFotos([]);
    setPreviewImages((prev) => prev.filter((p) => p.existing));
    incrementImageResetToken();
    clearError("fotos");
  }, [clearError, incrementImageResetToken, keptExistingPhotoIds.length]);

  const removeImage = useCallback(
    (index) => {
      setPreviewImages((prev) => {
        const image = prev[index];
        if (!image) return prev;
        const totalNow = keptExistingPhotoIds.length + newFotos.length;
        const totalAfter = image.existing ? totalNow - 1 : totalNow - 1;
        if (totalAfter < 1) {
          WrongAlert({
            title: "Debe haber al menos una foto",
            message: "No puedes eliminar todas las imágenes.",
          });
          return prev;
        }
        // Si es existente, quitar su id de la lista a mantener
        if (image.existing && image.id_foto) {
          setKeptExistingPhotoIds((ids) => ids.filter((id) => id !== image.id_foto));
        } else {
          // Es nueva: eliminar el archivo correspondiente
          const newIndexWithinNew = prev
            .slice(0, index)
            .filter((p) => !p.existing).length;
          setNewFotos((files) => files.filter((_, i) => i !== newIndexWithinNew));
        }

        const next = prev.filter((_, i) => i !== index);
        if (!next.length) incrementImageResetToken();
        return next;
      });
    },
    [incrementImageResetToken, keptExistingPhotoIds.length, newFotos.length]
  );

  const openImageModal = useCallback((image, index) => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    setSelectedImageModal({ ...image, index, scrollY });
  }, []);

  const ciudadDetectadaLabel = useMemo(() => {
    if (!formData.ubicacion.ciudad_id || !ciudades.length) return "";
    const match = ciudades.find((ciudad) => ciudad.id_ciudad === formData.ubicacion.ciudad_id);
    return match?.ciudad || "";
  }, [ciudades, formData.ubicacion.ciudad_id]);

  const autoSelectLocationFromParsed = useCallback(
    async (parsed) => {
      if (!parsed) return;
      const parsedDept = normalizeText(parsed.departamento);
      const parsedCity = normalizeText(parsed.ciudad);
      if (!parsedDept && !parsedCity) return;

      const findCityInDept = async (deptId) => {
        try {
          const cities = await getCiudadesByDepartamento(deptId);
          const found = cities.find((c) => normalizeText(c.ciudad) === parsedCity);
          if (found) {
            setFormData((prev) => ({
              ...prev,
              ubicacion: { ...prev.ubicacion, ciudad_id: found.id_ciudad },
            }));
          }
        } catch (e) {
          console.error("Error buscando ciudad por departamento", e);
        }
      };

      if (parsedDept) {
        const matchDept = departamentos.find((d) => normalizeText(d.departamento) === parsedDept);
        if (matchDept) {
          setSelectedDepartamento(matchDept.id_departamento);
          await findCityInDept(matchDept.id_departamento);
          return;
        }
      }

      if (parsedCity) {
        for (const dept of departamentos) {
          try {
            const cities = await getCiudadesByDepartamento(dept.id_departamento);
            const found = cities.find((c) => normalizeText(c.ciudad) === parsedCity);
            if (found) {
              setSelectedDepartamento(dept.id_departamento);
              setCiudades(cities);
              setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, ciudad_id: found.id_ciudad },
              }));
              return;
            }
          } catch (e) {
            // continuar
          }
        }
      }
    },
    [departamentos]
  );

  const handleMapSelect = useCallback(
    async ({ latitud, longitud, direccion }) => {
      setFormData((prev) => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          latitud: roundCoord(latitud),
          longitud: roundCoord(longitud),
          direccion: direccion ? direccion.trim() : "",
        },
      }));

      if (!direccion) return;

      const parsed = parseAddressString(direccion, departamentos);
      setFormData((prev) => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          nombre_sector: parsed.nombre_sector || prev.ubicacion.nombre_sector,
        },
      }));

      if (parsed.ciudad || parsed.departamento) {
        try {
          await autoSelectLocationFromParsed(parsed);
        } catch (e) {
          console.error("No se pudo autoseleccionar la ciudad", e);
        }
      }
    },
    [autoSelectLocationFromParsed, departamentos]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalFotos = keptExistingPhotoIds.length + newFotos.length;
    if (totalFotos < 1) {
      setErrors((prev) => ({ ...prev, fotos: "Debes mantener al menos una foto" }));
      await WrongAlert({ title: "Faltan fotos", message: "Debes mantener al menos una foto" });
      return;
    }

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      await WrongAlert({ title: "Error", message: "El título es requerido" });
      return;
    }
    if (!formData.descripcion.trim()) {
      await WrongAlert({ title: "Error", message: "La descripción es requerida" });
      return;
    }
    if (!formData.ubicacion.ciudad_id) {
      await WrongAlert({ title: "Ubicación incompleta", message: "La ciudad es obligatoria" });
      return;
    }

    try {
      setLoading(true);
      const finalDireccion = (formData.ubicacion.direccion || formData.ubicacion.nombre_sector || "").trim();
      const payload = {
        ...formData,
        ubicacion: {
          ...formData.ubicacion,
          direccion: finalDireccion,
          ciudad_id: parseInt(formData.ubicacion.ciudad_id, 10),
        },
      };
      await updateVoluntariado(voluntariado.id_voluntariado, payload, newFotos, keptExistingPhotoIds);
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

  // Opciones de selects de ubicación ya no se muestran en UI, omitidas

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

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Selecciona en el mapa</label>
              <LocationPickerMap
                initialLat={formData.ubicacion.latitud}
                initialLng={formData.ubicacion.longitud}
                onSelect={handleMapSelect}
                height={300}
              />
              <p className="help-text" style={{ marginTop: "0.5rem" }}>
                Haz clic en el mapa para elegir la ubicación. Se autocompleta la dirección y se guardan las coordenadas.
              </p>
            </div>

            {ciudadDetectadaLabel && (
              <p className="help-text" style={{ marginBottom: "1rem" }}>
                Ciudad detectada automáticamente: {ciudadDetectadaLabel}
              </p>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Barrio/Sector *</label>
                <input
                  type="text"
                  name="nombre_sector"
                  value={formData.ubicacion.nombre_sector}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ubicacion: { ...prev.ubicacion, nombre_sector: e.target.value },
                    }))
                  }
                  placeholder="Barrio o sector"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Nuevas fotos (opcional)</h3>
            <ImageDropzone
              label="Arrastra o selecciona nuevas fotos"
              maxPhotos={MAX_PHOTOS}
              previewImages={previewImages}
              error={errors.fotos}
              onFilesSelected={processFiles}
              onRemoveImage={removeImage}
              onClearAll={handleClearAllImages}
              onOpenPreview={openImageModal}
              resetTrigger={imageResetToken}
            />
            <small className="help-text">
              Total: {keptExistingPhotoIds.length + newFotos.length} / {MAX_PHOTOS} fotos. Máximo 5MB por foto.
            </small>
          </div>

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
      <ImagePreviewModal image={selectedImageModal} onClose={() => setSelectedImageModal(null)} />
    </div>
  );
}

export default EditVoluntariadoModal;
