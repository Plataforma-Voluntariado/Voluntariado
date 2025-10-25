import React, { useEffect, useState } from "react";
import "./UserManagementLayout.css";
import { GetUsersByRole } from "../../services/auth/UserManagementService";
import UserManagementItem from "../../components/UserManagementItem/UserManagementItem";

function UserManagementLayout({ rol }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const filteredUsers = await GetUsersByRole(rol);
      setUsers(filteredUsers);
    };
    fetchUsers();
  }, [rol]);
    if (!users.length) {
    return (
      <p className="user-management-empty">
        No hay usuarios pendientes con el rol {rol.toLowerCase()}.
      </p>
    );
  }
  return <div className="user-management-layout">
        {users.map((user) => (
          <UserManagementItem key={user.idVerificacion} data={user} />
        ))}
      </div>
}

export default UserManagementLayout;
