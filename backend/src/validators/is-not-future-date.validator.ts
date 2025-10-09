import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const dateValue = new Date(value); // convertir string a Date
          if (isNaN(dateValue.getTime())) return false; // no es una fecha válida
          const today = new Date();
          today.setHours(0, 0, 0, 0); // ignorar horas
          return dateValue <= today; // no puede ser futura
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no puede ser una fecha futura`;
        },
      },
    });
  };
}
