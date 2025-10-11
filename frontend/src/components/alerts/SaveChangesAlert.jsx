import Swal from "sweetalert2";

const SaveChangesAlert = async ({
  title = "¿Guardar cambios?",
  message = "Se actualizará la información",
}) => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#d33",
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    await Swal.fire({
      icon: "success",
      title: "¡Guardado!",
      text: "Los cambios se han guardado correctamente",
      confirmButtonColor: "#28a745",
    });
    return true;
  }

  return false;
};

export default SaveChangesAlert;
