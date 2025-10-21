import Swal from "sweetalert2";

const RedirectAlert = async (props) => {
  const {
    title = "¡Éxito!",
    message = "Redirigiéndote correctamente",
    timer = 2000,
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
  });

  // Retorna true después de que desaparece
  return true;
};

export default RedirectAlert;
