import Swal from "sweetalert2";

const ConfirmAlert = async ({
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  zIndex = 10000,
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
    customClass: {
      container: 'swal-high-z-index'
    },
    didOpen: () => {
      const container = document.querySelector('.swal2-container');
      if (container) {
        container.style.zIndex = zIndex;
      }
    }
  });

  return result.isConfirmed;
};

export default ConfirmAlert;
