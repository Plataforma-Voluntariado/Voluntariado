import Swal from "sweetalert2";

const ConfirmAlert = async ({
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
}) => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
};

export default ConfirmAlert;
