import Swal from "sweetalert2";

const RedirectAlert = async ({
  title = "¡Éxito!",
  message = "Redirigiéndote correctamente",
}) => {
  const result = await Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Aceptar",
  });

  if (result.isConfirmed) {
    return true;
  }

  return false;
};

export default RedirectAlert;

