import { promises as dns } from 'dns';

export async function verificarDominioCorreo(correo: string): Promise<boolean> {
  try {
    const dominio = correo.split('@')[1];
    if (!dominio) return false;

    const registrosMx = await dns.resolveMx(dominio);
    return registrosMx && registrosMx.length > 0;
  } catch (error) {
    // Si no hay registros MX o el dominio no existe
    return false;
  }
}
