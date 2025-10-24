import Swal from "sweetalert2";

const SuccessAlert = async (props) => {
  const {
    title = "¡Éxito!",
    message = "Operación realizada correctamente",
    timer = 2500,
    position = "top-end",
    icon = "success",
  } = props;

  await Swal.fire({
    toast: true,
    position,
    icon,
    title,
    text: message,
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    background: "#fff",
    color: "#333",
    iconColor: "#28a745",
    customClass: {
      popup: 'swal2-toast-custom',
      title: 'swal2-title-custom',
      content: 'swal2-content-custom',
    },
  });

  return true;
};

export default SuccessAlert;
