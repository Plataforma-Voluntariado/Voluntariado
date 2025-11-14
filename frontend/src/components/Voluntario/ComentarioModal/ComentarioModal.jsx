import React, { useState, useEffect, useRef, useId } from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";
import "./ComentarioModal.css";

const ComentarioModal = ({ abierto, onCerrar, onEnviar, inscripcion }) => {
  const [comentario, setComentario] = useState("");
  const [fotoIndex, setFotoIndex] = useState(0);
  const [verMas, setVerMas] = useState(false);
  const [comentarioTouched, setComentarioTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const voluntariado = inscripcion?.voluntariado || { fotos: [], descripcion: "", titulo: "", creador: {} };
  const fotos = voluntariado.fotos || [];
  const fallbackImagen = voluntariado.creador?.url_imagen || "https://via.placeholder.com/800x600?text=Voluntariado";
  const totalFotos = fotos.length > 0 ? fotos : [{ url: fallbackImagen }];
  const tituloId = useId();
  const descripcionId = useId();
  const comentarioId = useId();
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!abierto || totalFotos.length < 2) return;
    const interval = setInterval(() => {
      setFotoIndex((prev) => (prev + 1) % totalFotos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [abierto, totalFotos.length]);

  useEffect(() => {
    if (fotoIndex >= totalFotos.length) {
      setFotoIndex(0);
    }
  }, [fotoIndex, totalFotos.length]);

  // Reset estado y foco al abrir
  useEffect(() => {
    if (!abierto) return;
    setComentario("");
    setFotoIndex(0);
    setVerMas(false);
    setComentarioTouched(false);
    setSending(false);
    setError("");
    const focusTimeout = setTimeout(() => {
      textareaRef.current?.focus();
    }, 150);
    return () => clearTimeout(focusTimeout);
  }, [abierto]);


  useEffect(() => {
    if (!abierto) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCerrar?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  if (typeof document === "undefined") return null;

  const comentarioLimpio = comentario.trim();
  const comentarioValido = comentarioLimpio.length >= 10;
  const maxCaracteres = 500;
  const caracteresRestantes = maxCaracteres - comentario.length;
  const validationMessage = comentarioTouched && !comentarioValido
    ? "El comentario debe tener al menos 10 caracteres."
    : "";

  const handleEnviar = async () => {
    setComentarioTouched(true);
    if (!comentarioValido || sending) return;

    setError("");
    setSending(true);
    try {
      await Promise.resolve(onEnviar(comentarioLimpio));
      setComentario("");
      setComentarioTouched(false);
    } catch (err) {
      setError(err?.message || "No se pudo enviar el comentario. Inténtalo nuevamente.");
    } finally {
      setSending(false);
    }
  };

  const descripcion = (voluntariado.descripcion || "").trim();
  const palabras = descripcion.length ? descripcion.split(/\s+/) : [];
  const mostrarVerMas = palabras.length > 30;
  const textoMostrado = verMas
    ? descripcion
    : palabras.slice(0, 30).join(" ") + (mostrarVerMas ? "..." : "");

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onCerrar?.();
    }
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      aria-describedby={descripcionId}
    >
      <div
        ref={modalRef}
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-btn"
          onClick={onCerrar}
          type="button"
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>

        <div className="modal-body">
          <div className="carousel-pane">
            <div className="modal-carousel">
              <img
                src={totalFotos[fotoIndex].url}
                alt={`Imagen del voluntariado ${voluntariado.titulo}`}
                className="carousel-img"
              />

              {totalFotos.length > 1 && (
                <div className="carousel-dots" aria-hidden="true">
                  {totalFotos.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index === fotoIndex ? "active" : ""}`}
                    />
                  ))}
                </div>
              )}

              <div className="carousel-overlay">
                <h2 id={tituloId}>{voluntariado.titulo}</h2>
                <p
                  id={descripcionId}
                  className={`descripcion ${verMas ? "expandida" : ""}`}
                >
                  {textoMostrado}
                </p>

                {mostrarVerMas && (
                  <button
                    className="ver-mas-btn"
                    onClick={() => setVerMas((prev) => !prev)}
                    type="button"
                  >
                    {verMas ? "Ver menos" : "Ver más"}
                  </button>
                )}

                <div className="creator-info">
                  <img
                    src={voluntariado.creador?.url_imagen || fallbackImagen}
                    alt={`Foto de ${voluntariado.creador?.nombre || "creador"}`}
                  />
                  <div>
                    <p>
                      {voluntariado.creador?.nombre} {voluntariado.creador?.apellido}
                    </p>
                    <p>{voluntariado.creador?.correo}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-comment">
            <div className="comment-header">
              <h3>Deja tu comentario</h3>
              <p className="comment-subtitle">
                Cuéntanos tu experiencia para completar la verificación de horas.
              </p>
            </div>

            <label className="visually-hidden" htmlFor={comentarioId}>
              Escribe tu comentario
            </label>
            <textarea
              id={comentarioId}
              ref={textareaRef}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              maxLength={maxCaracteres}
              rows={6}
            />

            <div className="comment-feedback" role="status" aria-live="polite">
              <span className={`char-count ${caracteresRestantes < 50 ? "warning" : ""}`}>
                {caracteresRestantes} caracteres disponibles
              </span>
              {validationMessage && (
                <span className="comment-error">{validationMessage}</span>
              )}
              {error && (
                <span className="comment-error">{error}</span>
              )}
            </div>

            <div className="comment-actions">
              <button
                className="btn-send"
                onClick={handleEnviar}
                type="button"
                disabled={!comentarioValido || sending}
              >
                {sending ? "Enviando..." : "Enviar comentario"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ComentarioModal;
