import React, { useEffect, useState, useCallback } from "react";
import "./UserManagementLayout.css";
import { GetUsersByRole } from "../../../services/auth/UserManagementService";
import UserManagementItem from "../../../components/Admin/UserManagementItem/UserManagementItem";
import { useVerificacionArchivoAdminSocket } from "../../../hooks/useVerificacionArchivoSocketAdmin";

function UserManagementLayout({ rol, admin }) {
  const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    const filteredUsers = await GetUsersByRole(rol);
    setUsers(filteredUsers);
  }, [rol]);

  //Cargar usuarios al montar o cambiar rol
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useVerificacionArchivoAdminSocket(admin?.userId, (evento) => {
    const { tipo } = evento;
    if (["subido", "aprobado", "rechazado"].includes(tipo)) {
      fetchUsers();
    }
  });


  if (!users.length) {
    return (
      <p className="user-management-empty">
        No hay usuarios pendientes con el rol {rol.toLowerCase()}.
      </p>
    );
  }

  return (
    <div className="user-management-layout">
      {users.map((user) => (
        <UserManagementItem key={user.idVerificacion} data={user} />
      ))}
    </div>
  );
}

export default UserManagementLayout;
