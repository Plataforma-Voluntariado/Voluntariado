import toast from "react-hot-toast";

export const SuccessAlert = ({
  title = "Éxito",
  message = "Operación realizada correctamente",
  timer = 1500,
  position = "top-right",
} = {}) => {
  return new Promise((resolve) => {
    toast.success(
      <div>
        <strong>{title}</strong>
        <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>{message}</div>
      </div>,
      {
        duration: timer,
        position,
        style: {
          background: "#e0f2fe",
          color: "#075985", 
          border: "1px solid #38bdf8",
          padding: "10px 16px",
          borderRadius: "8px",
          fontSize: "0.95rem",
          fontWeight: 500,
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)", 
        },
        iconTheme: {
          primary: "#0ea5e9", 
          secondary: "#e0f2fe", 
        },
      }
    );

    setTimeout(resolve, timer);
  });
};

export const WrongAlert = ({
  title = "Error",
  message = "Ha ocurrido un error",
  timer = 3000,
  position = "top-right",
} = {}) => {
  return new Promise((resolve) => {
    toast.error(
      <div>
        <strong>{title}</strong>
        <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>{message}</div>
      </div>,
      {
        duration: timer,
        position,
        style: {
          background: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #fca5a5",
          padding: "10px 16px",
          borderRadius: "8px",
          fontSize: "0.95rem",
          fontWeight: 500,
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#fef2f2",
        },
      }
    );

    setTimeout(resolve, timer);
  });
};
