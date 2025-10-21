import Swal from "sweetalert2";

const WrongAlert = async (props) => {
  const {
    title = "Error",
    message = "Ocurrió un error inesperado",
    timer = 2000,         
    position = "top-end", 
    icon = "error",
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

  return true; 
};

export default WrongAlert;
