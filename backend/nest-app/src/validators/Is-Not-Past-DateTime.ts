import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotPastDateTime(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotPastDateTime',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = new Date(value);
          if (isNaN(date.getTime())) return false; 

          const now = new Date();
          return date >= now; 
        },
        defaultMessage() {
          return 'La fecha y hora no puede ser pasada.';
        },
      },
    });
  };
}
