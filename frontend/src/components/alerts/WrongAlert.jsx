import Swal from "sweetalert2";

const WrongAlert = ({ title = "Error", message = "Ocurrió un error inesperado"}) => {
  return Swal.fire({
    icon: "error",
    title: title,
    text: message,
    confirmButtonColor: "#d33",
    confirmButtonText: "Entendido",
  });
};

export default WrongAlert;
