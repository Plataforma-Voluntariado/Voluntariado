import { TipoDocumento } from '../entity/verificacion-archivo.entity';

export const mensajesPorTipo = {
  [TipoDocumento.CEDULA]: 'de tu cédula',
  [TipoDocumento.RUT]: 'de Registro Unico Tributario',
};
