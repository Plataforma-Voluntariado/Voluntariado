import React, { useState, useEffect } from "react";
import "./CreateVoluntariadoForm.css";
import { getCategorias } from "../../services/categoria/categoriaService";
import { getDepartamentos, getCiudadesByDepartamento } from "../../services/ubicacion/ubicacionService";
import { createVoluntariado, verifyAuth } from "../../services/voluntariado/voluntariadoService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

function CreateVoluntariadoForm({ onSuccess, onCancel }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        titulo: "",
        descripcion: "",
        fechaHoraInicio: "",
        horas: 1,
        maxParticipantes: 10,
        categoria_id: "",
        ubicacion: {
            latitud: -2.9001285, // Coordenadas por defecto (Popayán)
            longitud: -76.6124805,
            direccion: "",
            ciudad_id: "",
            nombre_lugar: "",
            barrio: "",
            nombre_sector: ""
        }
    });

    const [categorias, setCategorias] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [selectedDepartamento, setSelectedDepartamento] = useState("");
    const [fotos, setFotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [selectedImageModal, setSelectedImageModal] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        console.log("Cargando datos iniciales...");
        loadCategorias();
        loadDepartamentos();
    }, []);

    // Cargar ciudades cuando se selecciona un departamento
    useEffect(() => {
        if (selectedDepartamento) {
            loadCiudades(selectedDepartamento);
        } else {
            setCiudades([]);
            setFormData(prev => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, ciudad_id: "" }
            }));
        }
    }, [selectedDepartamento]);

    // Manejar tecla Escape para cerrar modal
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && selectedImageModal) {
                closeImageModal();
            }
        };

        if (selectedImageModal) {
            document.addEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
            document.body.style.overflow = 'unset';
        };
    }, [selectedImageModal]);

    const loadCategorias = async () => {
        try {
            const data = await getCategorias();
            console.log("Categorías recibidas:", data);
            setCategorias(data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
            // Datos de prueba para testing
            setCategorias([
                { id_categoria: 1, nombre: "Medio Ambiente" },
                { id_categoria: 2, nombre: "Educación" },
                { id_categoria: 3, nombre: "Salud" },
                { id_categoria: 4, nombre: "Deporte" },
                { id_categoria: 5, nombre: "Cultura" }
            ]);
        }
    };

    const loadDepartamentos = async () => {
        try {
            const data = await getDepartamentos();
            console.log("Departamentos recibidos:", data);
            setDepartamentos(data);
        } catch (error) {
            console.error("Error cargando departamentos:", error);
            // Datos de prueba para testing si el backend no está disponible
            setDepartamentos([
                { id_departamento: 1, departamento: "Cauca" },
                { id_departamento: 2, departamento: "Valle del Cauca" },
                { id_departamento: 3, departamento: "Nariño" }
            ]);
        }
    };

    const loadCiudades = async (departamentoId) => {
        try {
            const data = await getCiudadesByDepartamento(departamentoId);
            console.log("Ciudades recibidas:", data);
            setCiudades(data);
        } catch (error) {
            console.error("Error cargando ciudades:", error);
            // Datos de prueba para testing
            if (departamentoId == 1) { // Cauca
                setCiudades([
                    { id_ciudad: 1, ciudad: "Popayán" },
                    { id_ciudad: 2, ciudad: "Santander de Quilichao" },
                    { id_ciudad: 3, ciudad: "Puerto Tejada" }
                ]);
            } else if (departamentoId == 2) { // Valle del Cauca
                setCiudades([
                    { id_ciudad: 4, ciudad: "Cali" },
                    { id_ciudad: 5, ciudad: "Palmira" },
                    { id_ciudad: 6, ciudad: "Buenaventura" }
                ]);
            } else {
                setCiudades([
                    { id_ciudad: 7, ciudad: "Pasto" },
                    { id_ciudad: 8, ciudad: "Ipiales" }
                ]);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith("ubicacion.")) {
            const ubField = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                ubicacion: {
                    ...prev.ubicacion,
                    [ubField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === "horas" || name === "maxParticipantes" || name === "categoria_id" 
                    ? parseInt(value) || "" 
                    : value
            }));
        }

        // Limpiar errores cuando se modifica el campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleDepartamentoChange = (e) => {
        const departamentoId = e.target.value;
        setSelectedDepartamento(departamentoId);
    };

    const processFiles = (files) => {
        const fileArray = Array.from(files);
        const currentCount = fotos.length;
        const newCount = currentCount + fileArray.length;
        
        // Validar límite total (imágenes existentes + nuevas)
        if (newCount > 5) {
            const available = 5 - currentCount;
            Swal.fire({
                icon: 'warning',
                title: 'Límite excedido',
                text: `Solo puedes agregar ${available} imagen(es) más. Tienes ${currentCount} de 5 permitidas.`
            });
            return;
        }

        // Validar tamaño de archivos (max 5MB cada uno)
        const maxSize = 5 * 1024 * 1024; // 5MB
        for (let file of fileArray) {
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Archivo muy grande',
                    text: `La foto ${file.name} excede el tamaño máximo de 5MB`
                });
                return;
            }
        }

        // Combinar fotos existentes con las nuevas
        const allPhotos = [...fotos, ...fileArray];
        setFotos(allPhotos);

        // Generar vistas previas solo para las nuevas imágenes
        const newPreviews = [];
        fileArray.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews[index] = {
                    name: file.name,
                    url: e.target.result
                };
                // Actualizar cuando todas las nuevas imágenes estén cargadas
                if (newPreviews.filter(p => p).length === fileArray.length) {
                    setPreviewImages(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
        
        // Limpiar error de fotos si se seleccionaron archivos
        if (fileArray.length > 0 && errors.fotos) {
            setErrors(prev => ({ ...prev, fotos: "" }));
        }
    };

    const handleFotosChange = (e) => {
        // Para el input de archivo, reemplazamos todas las imágenes
        const fileArray = Array.from(e.target.files);
        
        if (fileArray.length > 5) {
            Swal.fire({
                icon: 'warning',
                title: 'Límite excedido',
                text: 'Máximo 5 fotos permitidas'
            });
            return;
        }

        // Validar tamaño de archivos
        const maxSize = 5 * 1024 * 1024; // 5MB
        for (let file of fileArray) {
            if (file.size > maxSize) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Archivo muy grande',
                    text: `La foto ${file.name} excede el tamaño máximo de 5MB`
                });
                return;
            }
        }

        // Reemplazar todas las fotos
        setFotos(fileArray);

        // Generar nuevas vistas previas
        const previews = [];
        fileArray.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                previews[index] = {
                    name: file.name,
                    url: e.target.result
                };
                // Actualizar cuando todas las imágenes estén cargadas
                if (previews.filter(p => p).length === fileArray.length) {
                    setPreviewImages([...previews]);
                }
            };
            reader.readAsDataURL(file);
        });
        
        // Limpiar error de fotos
        if (fileArray.length > 0 && errors.fotos) {
            setErrors(prev => ({ ...prev, fotos: "" }));
        }
    };

    // Funciones para drag & drop
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const files = e.dataTransfer.files;
        if (files) {
            processFiles(files);
        }
    };

    const removeImage = (index) => {
        const newFotos = fotos.filter((_, i) => i !== index);
        const newPreviews = previewImages.filter((_, i) => i !== index);
        setFotos(newFotos);
        setPreviewImages(newPreviews);
        
        // Si no hay fotos, limpiar el input
        if (newFotos.length === 0) {
            const input = document.getElementById('fotos');
            if (input) input.value = '';
        }
    };

    const clearAllImages = () => {
        setFotos([]);
        setPreviewImages([]);
        const input = document.getElementById('fotos');
        if (input) input.value = '';
    };

    const openImageModal = (image, index) => {
        setSelectedImageModal({ ...image, index });
    };

    const closeImageModal = () => {
        setSelectedImageModal(null);
    };

    const handleModalKeyPress = (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = "El título es obligatorio";
        } else if (formData.titulo.length > 255) {
            newErrors.titulo = "El título no puede superar 255 caracteres";
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = "La descripción es obligatoria";
        }

        if (!formData.fechaHoraInicio) {
            newErrors.fechaHoraInicio = "La fecha y hora de inicio son obligatorias";
        } else {
            const fechaInicio = new Date(formData.fechaHoraInicio);
            const ahora = new Date();
            if (fechaInicio <= ahora) {
                newErrors.fechaHoraInicio = "La fecha debe ser futura";
            }
        }

        if (!formData.horas || formData.horas < 1) {
            newErrors.horas = "Las horas deben ser mínimo 1";
        }

        if (!formData.maxParticipantes || formData.maxParticipantes < 1) {
            newErrors.maxParticipantes = "Debe haber mínimo 1 participante";
        } else if (formData.maxParticipantes > 100) {
            newErrors.maxParticipantes = "Máximo 100 participantes";
        }

        if (!formData.categoria_id) {
            newErrors.categoria_id = "La categoría es obligatoria";
        }

        if (!formData.ubicacion.direccion.trim()) {
            newErrors["ubicacion.direccion"] = "La dirección es obligatoria";
        }

        if (!formData.ubicacion.ciudad_id) {
            newErrors["ubicacion.ciudad_id"] = "La ciudad es obligatoria";
        }

        if (!fotos || fotos.length === 0) {
            newErrors.fotos = "Debe subir al menos una foto";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            Swal.fire({
                icon: 'error',
                title: 'Formulario incompleto',
                text: 'Por favor corrige los errores en el formulario'
            });
            return;
        }

        // Verificar autenticación y rol
        if (!user) {
            Swal.fire({
                icon: 'error',
                title: 'No autenticado',
                text: 'Debes iniciar sesión para crear voluntariados'
            });
            return;
        }

        if (user.rol !== 'CREADOR') {
            Swal.fire({
                icon: 'error',
                title: 'Permisos insuficientes',
                text: 'Solo los usuarios con rol CREADOR pueden crear voluntariados'
            });
            return;
        }

        setLoading(true);

        try {
            console.log("Usuario actual:", user);
            
            // Verificar autenticación antes de proceder
            console.log("Verificando autenticación...");
            await verifyAuth();
            
            console.log("Enviando formulario con datos:", formData);
            console.log("Número de fotos:", fotos.length);
            const result = await createVoluntariado(formData, fotos);
            
            Swal.fire({
                icon: 'success',
                title: '¡Voluntariado creado!',
                text: 'Tu voluntariado ha sido registrado exitosamente',
                timer: 2000,
                showConfirmButton: false
            });

            // Limpiar formulario
            setFormData({
                titulo: "",
                descripcion: "",
                fechaHoraInicio: "",
                horas: 1,
                maxParticipantes: 10,
                categoria_id: "",
                ubicacion: {
                    latitud: -2.9001285,
                    longitud: -76.6124805,
                    direccion: "",
                    ciudad_id: "",
                    nombre_lugar: "",
                    barrio: "",
                    nombre_sector: ""
                }
            });
            setFotos([]);
            setPreviewImages([]);
            setSelectedDepartamento("");
            
            // Limpiar el input de archivos
            const fileInput = document.getElementById('fotos');
            if (fileInput) fileInput.value = '';

            if (onSuccess) {
                onSuccess(result);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al crear voluntariado',
                text: error || 'Ocurrió un error inesperado'
            });
        } finally {
            setLoading(false);
        }
    };

    // Mostrar mensaje si no es creador
    if (!user || user.rol !== 'CREADOR') {
        return (
            <div className="create-voluntariado-form-container">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <h2>Acceso Restringido</h2>
                    <p>Solo los usuarios con rol CREADOR pueden acceder a esta función.</p>
                    <p>Tu rol actual: {user?.rol || 'No autenticado'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="create-voluntariado-form-container">
            <form onSubmit={handleSubmit} className="create-voluntariado-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="titulo">Título *</label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleInputChange}
                            className={errors.titulo ? "error" : ""}
                            maxLength="255"
                            placeholder="Ingresa el título del voluntariado"
                        />
                        {errors.titulo && <span className="error-text">{errors.titulo}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="categoria_id">Categoría *</label>
                        <select
                            id="categoria_id"
                            name="categoria_id"
                            value={formData.categoria_id}
                            onChange={handleInputChange}
                            className={errors.categoria_id ? "error" : ""}
                        >
                            <option value="">Selecciona una categoría</option>
                            {categorias.map(categoria => (
                                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.categoria_id && <span className="error-text">{errors.categoria_id}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="descripcion">Descripción *</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        className={errors.descripcion ? "error" : ""}
                        rows="4"
                        placeholder="Describe el voluntariado, objetivos y actividades a realizar"
                    />
                    {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fechaHoraInicio">Fecha y Hora de Inicio *</label>
                        <input
                            type="datetime-local"
                            id="fechaHoraInicio"
                            name="fechaHoraInicio"
                            value={formData.fechaHoraInicio}
                            onChange={handleInputChange}
                            className={errors.fechaHoraInicio ? "error" : ""}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        {errors.fechaHoraInicio && <span className="error-text">{errors.fechaHoraInicio}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="horas">Duración (horas) *</label>
                        <input
                            type="number"
                            id="horas"
                            name="horas"
                            value={formData.horas}
                            onChange={handleInputChange}
                            className={errors.horas ? "error" : ""}
                            min="1"
                            max="24"
                        />
                        {errors.horas && <span className="error-text">{errors.horas}</span>}
                        {formData.fechaHoraInicio && formData.horas && (
                            <small style={{color: '#667eea', marginTop: '0.25rem', display: 'block'}}>
                                Duración: {formData.horas} hora{formData.horas > 1 ? 's' : ''} desde {new Date(formData.fechaHoraInicio).toLocaleString()}
                            </small>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxParticipantes">Máximo Participantes *</label>
                        <input
                            type="number"
                            id="maxParticipantes"
                            name="maxParticipantes"
                            value={formData.maxParticipantes}
                            onChange={handleInputChange}
                            className={errors.maxParticipantes ? "error" : ""}
                            min="1"
                            max="100"
                        />
                        {errors.maxParticipantes && <span className="error-text">{errors.maxParticipantes}</span>}
                    </div>
                </div>

                <div className="ubicacion-section">
                    <h3>Ubicación del Voluntariado</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="departamento">Departamento *</label>
                            <select
                                id="departamento"
                                value={selectedDepartamento}
                                onChange={handleDepartamentoChange}
                            >
                                <option value="">Selecciona un departamento</option>
                                {departamentos.map(depto => (
                                    <option key={depto.id_departamento} value={depto.id_departamento}>
                                        {depto.departamento}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="ubicacion.ciudad_id">Ciudad *</label>
                            <select
                                id="ubicacion.ciudad_id"
                                name="ubicacion.ciudad_id"
                                value={formData.ubicacion.ciudad_id}
                                onChange={handleInputChange}
                                className={errors["ubicacion.ciudad_id"] ? "error" : ""}
                                disabled={!selectedDepartamento}
                            >
                                <option value="">Selecciona una ciudad</option>
                                {ciudades.map(ciudad => (
                                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                                        {ciudad.ciudad}
                                    </option>
                                ))}
                            </select>
                            {errors["ubicacion.ciudad_id"] && <span className="error-text">{errors["ubicacion.ciudad_id"]}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="ubicacion.direccion">Dirección *</label>
                        <input
                            type="text"
                            id="ubicacion.direccion"
                            name="ubicacion.direccion"
                            value={formData.ubicacion.direccion}
                            onChange={handleInputChange}
                            className={errors["ubicacion.direccion"] ? "error" : ""}
                            placeholder="Dirección completa del lugar"
                        />
                        {errors["ubicacion.direccion"] && <span className="error-text">{errors["ubicacion.direccion"]}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="ubicacion.nombre_lugar">Nombre del Lugar</label>
                            <input
                                type="text"
                                id="ubicacion.nombre_lugar"
                                name="ubicacion.nombre_lugar"
                                value={formData.ubicacion.nombre_lugar}
                                onChange={handleInputChange}
                                placeholder="Ej: Parque Central, Colegio XYZ"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="ubicacion.barrio">Barrio/Sector</label>
                            <input
                                type="text"
                                id="ubicacion.barrio"
                                name="ubicacion.barrio"
                                value={formData.ubicacion.barrio}
                                onChange={handleInputChange}
                                placeholder="Nombre del barrio o sector"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="fotos">Fotos del Voluntariado *</label>
                    
                    {/* Zona de Drag & Drop */}
                    <div 
                        className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''} ${errors.fotos ? 'error' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fotos').click()}
                    >
                        <div className="drag-drop-content">
                            <div className="upload-icon">📷</div>
                            <div className="upload-text">
                                <p className="primary-text">
                                    {previewImages.length > 0 
                                        ? `Arrastra más imágenes aquí o ` 
                                        : `Arrastra tus imágenes aquí o `
                                    }
                                    <span className="click-text">
                                        {previewImages.length > 0 
                                            ? 'haz clic para reemplazar todas'
                                            : 'haz clic para seleccionar'
                                        }
                                    </span>
                                </p>
                                <p className="secondary-text">
                                    {previewImages.length > 0 
                                        ? `Puedes agregar ${5 - previewImages.length} más • Hasta 5MB cada una • JPG, PNG, GIF`
                                        : 'Máximo 5 fotos • Hasta 5MB cada una • JPG, PNG, GIF'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        <input
                            type="file"
                            id="fotos"
                            accept="image/*"
                            multiple
                            onChange={handleFotosChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    
                    {errors.fotos && <span className="error-text">{errors.fotos}</span>}
                    
                    {/* Vista previa de imágenes */}
                    {previewImages.length > 0 && (
                        <div className="image-preview-container">
                            <div className="preview-header">
                                <p className="preview-title">
                                    Imágenes seleccionadas ({previewImages.length}/5)
                                </p>
                                <button
                                    type="button"
                                    className="clear-all-btn"
                                    onClick={clearAllImages}
                                    title="Limpiar todas las imágenes"
                                >
                                    🗑️ Limpiar todo
                                </button>
                            </div>
                            <div className="preview-info">
                                <small>💡 Puedes arrastrar más imágenes para agregar (hasta {5 - previewImages.length} más)</small>
                            </div>
                            <div className="image-preview-grid">
                                {previewImages.map((image, index) => (
                                    <div key={index} className="image-preview-item">
                                        <div 
                                            className="image-container"
                                            onClick={() => openImageModal(image, index)}
                                            title="Hacer clic para ver en tamaño completo"
                                        >
                                            <img 
                                                src={image.url} 
                                                alt={`Preview ${index + 1}`} 
                                                className="preview-image"
                                            />
                                            <div className="image-overlay">
                                                <span className="zoom-icon">🔍</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage(index);
                                            }}
                                            title="Eliminar imagen"
                                        >
                                            ✕
                                        </button>
                                        <p className="image-name">{image.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="form-actions">
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="btn-cancel">
                            Cancelar
                        </button>
                    )}
                    <button type="submit" disabled={loading} className="btn-submit">
                        {loading ? "Creando..." : "Crear Voluntariado"}
                    </button>
                </div>
            </form>

            {/* Modal de Vista Previa de Imagen */}
            {selectedImageModal && (
                <div className="image-modal-overlay" onClick={closeImageModal}>
                    <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="image-modal-close" 
                            onClick={closeImageModal}
                            title="Cerrar (Esc)"
                        >
                            ✕
                        </button>
                        <div className="image-modal-header">
                            <h3>Vista Previa de Imagen</h3>
                            <span className="image-counter-left">
                                {selectedImageModal.index + 1} de {previewImages.length}
                            </span>
                        </div>
                        <div className="image-modal-body">
                            <div className="image-wrapper">
                                <img 
                                    src={selectedImageModal.url} 
                                    alt={selectedImageModal.name}
                                    className="modal-image"
                                    onLoad={(e) => {
                                        // Asegurar que la imagen se muestre completa
                                        const img = e.target;
                                        const container = img.parentElement;
                                        if (container) {
                                            const containerRect = container.getBoundingClientRect();
                                            const imgRect = img.getBoundingClientRect();
                                            
                                            if (imgRect.height > containerRect.height || imgRect.width > containerRect.width) {
                                                img.style.maxWidth = '100%';
                                                img.style.maxHeight = '100%';
                                                img.style.width = 'auto';
                                                img.style.height = 'auto';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="image-modal-footer">
                            <p className="modal-image-name">{selectedImageModal.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateVoluntariadoForm;