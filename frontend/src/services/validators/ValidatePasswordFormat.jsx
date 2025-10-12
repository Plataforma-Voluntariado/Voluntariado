export function ValidatePasswordFormat(password) {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength)
    return { valid: false, message: "Debe tener al menos 8 caracteres." };
  if (!hasUppercase)
    return { valid: false, message: "Debe incluir al menos una letra mayúscula." };
  if (!hasLowercase)
    return { valid: false, message: "Debe incluir al menos una letra minúscula." };
  if (!hasNumber)
    return { valid: false, message: "Debe incluir al menos un número." };
  if (!hasSpecialChar)
    return { valid: false, message: "Debe incluir un carácter especial." };

  return { valid: true };
}