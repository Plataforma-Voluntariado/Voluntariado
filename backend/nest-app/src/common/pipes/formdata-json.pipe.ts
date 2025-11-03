import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FormDataJsonPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body' || !value) {
      return value;
    }

    // El campo 'ubicacion' es un string JSON que necesita ser convertido
    if (typeof value.ubicacion === 'string') {
      try {
        value.ubicacion = JSON.parse(value.ubicacion);
      } catch (e) {
        // Esto captura si el usuario envía un JSON malformado
        throw new BadRequestException('El campo "ubicacion" debe ser una cadena JSON válida.');
      }
    }
    
    // Devolvemos el objeto con 'ubicacion' como un objeto real.
    // Esto permite que el ValidationPipe posterior ejecute @ValidateNested() correctamente.
    return value;
  }
}