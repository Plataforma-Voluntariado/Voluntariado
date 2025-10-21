import Swal from "sweetalert2";

const SuccessAlert = ({ title = "¡Éxito!", message = "Operación realizada correctamente" }) => {
  console.log("SuccessAlert llamado con:", { title, message });
  
  return Swal.fire({
    icon: "success",
    title: title,
    text: message,
    confirmButtonColor: "#28a745",
    confirmButtonText: "Aceptar",
    showConfirmButton: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom',
      content: 'swal2-content-custom',
      confirmButton: 'swal2-confirm-custom'
    },
    buttonsStyling: true,
    focusConfirm: true
  }).then((result) => {
    console.log("SweetAlert resultado:", result);
    return result;
  });
};

export default SuccessAlert;
