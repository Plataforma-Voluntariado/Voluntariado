import React, { useState, useEffect } from "react";
import "./CreateVoluntariadoForm.css";
import { getCategorias } from "../../services/categoria/categoriaService";
import { getDepartamentos, getCiudadesByDepartamento } from "../../services/ubicacion/ubicacionService";
import { createVoluntariado, verifyAuth } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const MAX_PHOTOS = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_COORDS = { latitud: -2.9001285, longitud: -76.6124805 };

function CreateVoluntariadoForm({ onSuccess, onCancel }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaHoraInicio: "",
    horas: 1,
    maxParticipantes: 10,
    categoria_id: "",
    ubicacion: { ...DEFAULT_COORDS, direccion: "", ciudad_id: "", nombre_lugar: "", barrio: "", nombre_sector: "" }
  });

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

  useEffect(() => {
    (async () => {
      try { setCategorias(await getCategorias()); } 
      catch { setCategorias([
        { id_categoria: 1, nombre: "Medio Ambiente" },
        { id_categoria: 2, nombre: "Educación" },
        { id_categoria: 3, nombre: "Salud" }
      ]); }

      try { setDepartamentos(await getDepartamentos()); }
      catch { setDepartamentos([
        { id_departamento: 1, departamento: "Cauca" },
        { id_departamento: 2, departamento: "Valle del Cauca" }
      ]); }
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
        // fallback simple por departamento
        if (selectedDepartamento === "1") setCiudades([{ id_ciudad: 1, ciudad: "Popayán" }]);
        else if (selectedDepartamento === "2") setCiudades([{ id_ciudad: 4, ciudad: "Cali" }]);
        else setCiudades([{ id_ciudad: 7, ciudad: "Pasto" }]);
      }
    })();
  }, [selectedDepartamento]);

  // Manejo global de tecla Escape para cerrar modal
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setSelectedImageModal(null); };
    if (selectedImageModal) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedImageModal]);

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
      Swal.fire({ icon: "warning", title: "Límite excedido", text: `Solo puedes agregar ${available} imagen(es) más.` });
      return;
    }
    for (const f of filesArr) {
      if (f.size > MAX_SIZE) {
        Swal.fire({ icon: "warning", title: "Archivo muy grande", text: `${f.name} supera 5MB.` });
        return;
      }
    }
    try {
      const previews = await Promise.all(filesArr.map(readFileData));
      setFotos(prev => [...prev, ...filesArr]);
      setPreviewImages(prev => [...prev, ...previews]);
      setErrors(prev => ({ ...prev, fotos: "" }));
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron procesar las imágenes" });
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

  const handleDepartamentoChange = (e) => {
    setSelectedDepartamento(e.target.value);
    setFormData(prev => ({ ...prev, ubicacion: { ...prev.ubicacion, ciudad_id: "" } }));
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

  const closeImageModal = () => {
    const scrollY = selectedImageModal?.scrollY || 0;
    document.body.style.position = "";
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
    setSelectedImageModal(null);
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
    if (!formData.ubicacion.ciudad_id) newErrors["ubicacion.ciudad_id"] = "La ciudad es obligatoria";
    if (!fotos || fotos.length === 0) newErrors.fotos = "Debes subir al menos una foto";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      titulo: "", descripcion: "", fechaHoraInicio: "", horas: 1, maxParticipantes: 10, categoria_id: "",
      ubicacion: { ...DEFAULT_COORDS, direccion: "", ciudad_id: "", nombre_lugar: "", barrio: "", nombre_sector: "" }
    });
    setFotos([]); setPreviewImages([]); setSelectedDepartamento("");
    const fileInput = document.getElementById("fotos"); if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({ icon: "error", title: "Formulario incompleto", text: "Por favor corrige los errores" });
      return;
    }
    if (!user) { Swal.fire({ icon: "error", title: "No autenticado", text: "Debes iniciar sesión" }); return; }
    if (user.rol !== "CREADOR") { Swal.fire({ icon: "error", title: "Permisos insuficientes", text: "Solo rol CREADOR" }); return; }

    setLoading(true);
    try {
      await verifyAuth();
      const result = await createVoluntariado(formData, fotos);
      Swal.fire({ icon: "success", title: "¡Voluntariado creado!", timer: 1500, showConfirmButton: false });
      resetForm();
      if (onSuccess) onSuccess(result);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error al crear voluntariado", text: err?.message || "Ocurrió un error" });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <div className="create-voluntariado-form-container">
        <form onSubmit={handleSubmit} className="create-voluntariado-form">
          {/* Título y categoría */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input id="titulo" name="titulo" value={formData.titulo} onChange={handleInputChange} maxLength="255" className={errors.titulo ? "error" : ""} placeholder="Ingresa el título" />
              {errors.titulo && <span className="error-text">{errors.titulo}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="categoria_id">Categoría *</label>
              <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className={errors.categoria_id ? "error" : ""}>
                <option value="">Selecciona una categoría</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
              {errors.categoria_id && <span className="error-text">{errors.categoria_id}</span>}
            </div>
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="4" className={errors.descripcion ? "error" : ""} placeholder="Describe el voluntariado" />
            {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
          </div>

          {/* Fecha / horas / participantes */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaHoraInicio">Fecha y Hora de Inicio *</label>
              <input id="fechaHoraInicio" name="fechaHoraInicio" type="datetime-local" value={formData.fechaHoraInicio} onChange={handleInputChange} min={new Date().toISOString().slice(0, 16)} className={errors.fechaHoraInicio ? "error" : ""} />
              {errors.fechaHoraInicio && <span className="error-text">{errors.fechaHoraInicio}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="horas">Duración (horas) *</label>
              <input id="horas" name="horas" type="number" value={formData.horas} onChange={handleInputChange} min="1" max="24" className={errors.horas ? "error" : ""} />
              {errors.horas && <span className="error-text">{errors.horas}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="maxParticipantes">Máximo Participantes *</label>
              <input id="maxParticipantes" name="maxParticipantes" type="number" value={formData.maxParticipantes} onChange={handleInputChange} min="1" max="100" className={errors.maxParticipantes ? "error" : ""} />
              {errors.maxParticipantes && <span className="error-text">{errors.maxParticipantes}</span>}
            </div>
          </div>

          {/* Ubicación */}
          <div className="ubicacion-section">
            <h3>Ubicación del Voluntariado</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departamento">Departamento *</label>
                <select id="departamento" value={selectedDepartamento} onChange={handleDepartamentoChange}>
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map(d => <option key={d.id_departamento} value={d.id_departamento}>{d.departamento}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ubicacion.ciudad_id">Ciudad *</label>
                <select id="ubicacion.ciudad_id" name="ubicacion.ciudad_id" value={formData.ubicacion.ciudad_id} onChange={handleInputChange} disabled={!selectedDepartamento} className={errors["ubicacion.ciudad_id"] ? "error" : ""}>
                  <option value="">Selecciona una ciudad</option>
                  {ciudades.map(c => <option key={c.id_ciudad} value={c.id_ciudad}>{c.ciudad}</option>)}
                </select>
                {errors["ubicacion.ciudad_id"] && <span className="error-text">{errors["ubicacion.ciudad_id"]}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="ubicacion.direccion">Dirección *</label>
              <input id="ubicacion.direccion" name="ubicacion.direccion" value={formData.ubicacion.direccion} onChange={handleInputChange} className={errors["ubicacion.direccion"] ? "error" : ""} placeholder="Dirección completa" />
              {errors["ubicacion.direccion"] && <span className="error-text">{errors["ubicacion.direccion"]}</span>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ubicacion.nombre_lugar">Nombre del Lugar</label>
                <input id="ubicacion.nombre_lugar" name="ubicacion.nombre_lugar" value={formData.ubicacion.nombre_lugar} onChange={handleInputChange} placeholder="Ej: Parque Central" />
              </div>
              <div className="form-group">
                <label htmlFor="ubicacion.barrio">Barrio/Sector</label>
                <input id="ubicacion.barrio" name="ubicacion.barrio" value={formData.ubicacion.barrio} onChange={handleInputChange} placeholder="Barrio o sector" />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="form-group">
            <label>Fotos del Voluntariado *</label>
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
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13L12 9L8 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 9V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
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

      {selectedImageModal && (
        <div className="image-modal-overlay" onClick={closeImageModal} role="dialog" aria-modal="true">
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <div>
                <h3>Vista Previa</h3>
                <small style={{opacity: 0.7, fontSize: '0.8em'}}>Arrastra para mover • Ctrl + Rueda para zoom</small>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                <span>{selectedImageModal.index + 1} de {previewImages.length}</span>
                <button 
                  className="image-modal-close" 
                  onClick={closeImageModal} 
                  aria-label="Cerrar"
                  style={{
                    position: 'relative',
                    top: 0,
                    right: 0,
                    margin: 0
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div 
              className="image-modal-body" 
              style={{
                maxHeight: '80vh',
                overflowY: 'auto',
                overflowX: 'auto',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
              }}
              onWheel={(e) => {
                if (e.ctrlKey) {
                  e.preventDefault();
                  const img = e.currentTarget.querySelector('img');
                  const currentScale = parseFloat(img.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1');
                  const delta = e.deltaY > 0 ? 0.9 : 1.1;
                  const newScale = Math.min(Math.max(currentScale * delta, 0.5), 3);
                  img.style.transform = `scale(${newScale})`;
                  img.style.transformOrigin = 'center';
                }
              }}
            >
              <style jsx>{`
                .image-modal-body::-webkit-scrollbar {
                  display: none; /* Chrome, Safari, Opera */
                }
              `}</style>
              <img 
                src={selectedImageModal.url} 
                alt={selectedImageModal.name} 
                className="modal-image" 
                style={{
                  maxWidth: 'none',
                  maxHeight: 'none',
                  width: 'auto',
                  height: 'auto',
                  cursor: 'grab'
                }}
                onMouseDown={(e) => {
                  e.target.style.cursor = 'grabbing';
                  const startX = e.pageX - e.target.offsetLeft;
                  const startY = e.pageY - e.target.offsetTop;
                  const scrollLeft = e.target.parentElement.scrollLeft;
                  const scrollTop = e.target.parentElement.scrollTop;
                  
                  const handleMouseMove = (e) => {
                    const x = e.pageX - e.target.offsetLeft;
                    const y = e.pageY - e.target.offsetTop;
                    const walkX = (x - startX) * 2;
                    const walkY = (y - startY) * 2;
                    e.target.parentElement.scrollLeft = scrollLeft - walkX;
                    e.target.parentElement.scrollTop = scrollTop - walkY;
                  };
                  
                  const handleMouseUp = () => {
                    e.target.style.cursor = 'grab';
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              />
            </div>
            <div className="image-modal-footer"><p>{selectedImageModal.name}</p></div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateVoluntariadoForm;
