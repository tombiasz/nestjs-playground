import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError, ZodObject } from 'zod';

const genericValidationError = {
  message: 'validation error',
  code: HttpStatus.BAD_REQUEST,
};

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          ...genericValidationError,
          issues: error.issues,
        });
      }

      throw new BadRequestException(genericValidationError);
    }

    return value;
  }
}
