# Proyecto Frontend - Sistema de Registro e Inicio de Sesión

Este proyecto es un **frontend en React.js** que permite el registro, autenticación y manejo de sesión de usuarios utilizando **Context API** para la gestión del estado global (sin almacenamiento en `localStorage`).

---

## Estructura del Proyecto

```
/frontend
│
├── src
│   ├── assets/
│   │
│   ├── components/
│   │   ├── alerts/
│   │   │   ├── ConfirmAlert.jsx
│   │   │   ├── SaveChangesAlert.jsx
│   │   │   ├── SuccessAlert.jsx
│   │   │   └── WrongAlert.jsx
│   │   │
│   │   ├── LoginForm/
│   │   ├── NavigationBar/
│   │   ├── RegisterFormCreator/
│   │   └── RegisterFormVolunteer/
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── layouts/
│   │   ├── RegisterFormLayout/
│   │   └── VolunteersLayout/
│   │
│   ├── pages/
│   │   ├── HomePage/
│   │   ├── LoginPage/
│   │   ├── PasswordRecoveryPage/
│   │   └── RegisterPage/
│   │
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   │
│   ├── services/
│   │   └── ValidatePasswordFormat.jsx
│   │
│   ├── index.css
│   └── index.js
│
└── README.md
```

---

## Context API

El archivo `AuthContext.jsx` maneja el flujo de autenticación del usuario.  
Permite guardar la información del usuario durante la sesión, sin necesidad de persistirla en `localStorage`.

---

## Envíos de Datos (POST)

### ** Registro de Voluntario**
**Componente:** `RegisterFormVolunteer.jsx`  
**Ruta:** `/usuarios/registro`  
**Método:** `POST`  
**Estructura del cuerpo JSON:**

```json
{
  "correo": "usuario@correo.com",
  "contrasena": "Contraseña123*",
  "rol": "CREADOR",
  "tipo_entidad": "PUBLICA",
  "nombre_entidad": "Cruz Roja",
  "descripcion": "Cruz Roja sede Mocoa",
  "direccion": "El Centro Calle 7, Mocoa, Putumayo",
  "sitio_web": "www.cruzroja.com",
  "telefono": "3112157287",
  "id_ciudad": 1
}
```

**Validaciones:**
- Todos los campos son obligatorios.  
- Contraseña debe cumplir el formato:  
  **8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.**
- Se verifica que las contraseñas coincidan antes de enviar.  
- En caso de error, se usan las alertas de `components/alerts`.

---

## Sistema de Alertas (SweetAlert2)

Los componentes dentro de `src/components/alerts/` están diseñados para **reutilizar** las alertas visuales:

| Componente | Descripción |
|-------------|--------------|
| **ConfirmAlert.jsx** | Muestra alertas de confirmación antes de realizar acciones. |
| **SaveChangesAlert.jsx** | Se usa para confirmar guardado o cambios en formularios. |
| **SuccessAlert.jsx** | Notifica operaciones exitosas (registro, login, etc). |
| **WrongAlert.jsx** | Muestra mensajes de error o validaciones fallidas. |

Todos aceptan props como:
```jsx
WrongAlert({
  title: "Error de validación",
  message: "Por favor completa todos los campos."
});
```

---

## Validación de Contraseña

**Archivo:** `services/ValidatePasswordFormat.jsx`  
Verifica que la contraseña cumpla con los siguientes requisitos:

- Mínimo **8 caracteres**
- Al menos **una letra mayúscula**
- Al menos **una letra minúscula**
- Al menos **un número**
- Al menos **un carácter especial**

Si no cumple, se muestra una alerta de tipo `WrongAlert`.

---

## Rutas Principales (`index.js`)

El enrutamiento principal se maneja con **React Router DOM**:

```jsx
<BrowserRouter>
  <Routes>
    <Route path="home" element={<HomePage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="register" element={<RegisterPage />} />
    <Route path="recover" element={<PasswordRecoveryPage />} />
    <Route path="*" element={<HomePage />} />
  </Routes>
</BrowserRouter>
```

Las rutas que requieren autenticación estarán protegidas con `ProtectedRoute.jsx`.

---

## Próximos Pasos

- Integrar el flujo completo de **inicio de sesión** con el backend.  
- Implementar **ProtectedRoute** para limitar acceso a páginas privadas.  
- Mostrar datos del usuario autenticado usando `AuthContext`.  
- Añadir **alertas personalizadas** según respuesta del servidor.

---

## Imágenes sugeridas

1. Captura del formulario de registro.  
2. Ejemplo de una alerta (SweetAlert2).  
3. Diagrama del flujo de autenticación (opcional).  
4. Vista general del proyecto en ejecución.
