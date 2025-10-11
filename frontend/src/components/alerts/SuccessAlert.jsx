import Swal from "sweetalert2";

const SuccessAlert = ({ title = "¡Éxito!", message = "Operación realizada correctamente" }) => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: message,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Aceptar",
  });
};

export default SuccessAlert;
