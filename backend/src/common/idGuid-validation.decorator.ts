// validators/is-cuid.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Regex for CUID v2 (recommended)
//   - Starts with a lowercase letter
//   - Followed by 23 alphanumeric characters (total length = 24)
const CUID_V2_REGEX = /^[a-z][a-z0-9]{23}$/;

// Regex for CUID v1 (legacy)
//   - Starts with 'c' and is 24 characters long
const CUID_V1_REGEX = /^c[a-z0-9]{24,}$/;

export type CuidVersion = 1 | 2;

export interface IsCuidOptions extends ValidationOptions {
  version?: CuidVersion;
}

/**
 * Custom validation decorator that checks if a string is a valid CUID.
 *
 * @param options - Validation options, including an optional `version` (1 or 2). Defaults to v1.
 *
 * @example
 * class MyDto {
 *   @IsCuid()
 *   id: string;
 *
 *   @IsCuid({ version: 1 })
 *   legacyId: string;
 * }
 */
export function IsCUID(options: IsCuidOptions = {}) {
  const { version = 1, ...validationOptions } = options;

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsCUID',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean {
          if (typeof value !== 'string') return false;
          // default: version 1
          if (version === 1) {
            return CUID_V1_REGEX.test(value);
          }
          return CUID_V2_REGEX.test(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a CUID`;
        },
      },
    });
  };
}