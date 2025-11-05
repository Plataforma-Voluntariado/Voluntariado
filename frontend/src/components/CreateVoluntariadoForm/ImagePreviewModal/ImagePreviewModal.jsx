import { useEffect } from "react";
import './ImagePreviewModal.css'

const ImagePreviewModal = ({ image, onClose }) => {

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (image?.scrollY !== undefined) {
        document.body.style.position = "";
        document.body.style.top = "";
        window.scrollTo(0, image.scrollY);
      }
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>✕</button>
        <img src={image.url} alt={image.name} className="image-modal-img" />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
