import Swal from "sweetalert2";

const TextAreaAlert = async ({
  title = "Agregar observación",
  message = "Por favor, escribe una observación antes de continuar.",
  confirmText = "Enviar",
  cancelText = "Cancelar",
  placeholder = "Escribe aquí tu observación...",
}) => {
  const { value: text } = await Swal.fire({
    title: title,
    text: message,
    input: "textarea",
    inputPlaceholder: placeholder,
    inputAttributes: {
      "aria-label": "Observaciones del administrador",
    },
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    inputValidator: (value) => {
      if (!value) {
        return "Debes escribir una observación antes de continuar.";
      }
    },
  });

  if (text) {
    return { confirmed: true, text };
  } else {
    return { confirmed: false, text: "" };
  }
};

export default TextAreaAlert;
