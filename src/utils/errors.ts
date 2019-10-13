import { BaseError } from '@reignmodule/utils';

const errorClasses = {};

[
  {
    status: 400,
    name: 'BAD_REQUEST',
    description: (meta: { message: string; } | undefined) =>
      `${(meta && meta.message) || 'Some params may be missing'}`,
  },
  {
    status: 401,
    name: 'UNAUTHORIZED',
    description: (meta: { message: string; } | undefined) =>
      `${(meta && meta.message) || 'Unauthorized'}`,
  },
  {
    status: 404,
    name: 'NOT_FOUND',
    description: (meta: { type: any; id: any; }) =>
      `Can't found ${meta.type || 'resource'} with id ${meta.id}`,
  },
  {
    status: 413,
    name: 'PAYLOAD_TOO_LARGE',
    description: 'The payload Too Large',
  }, {
    status: 415,
    name: 'UNSUPPORTED_MEDIA_TYPE',
    description: 'Unsupported Media Type',
  },
  {
    status: 460,
    name: 'INTERNAL_ERROR',
    description: (meta: { message: string; } | undefined) =>
      `${(meta && meta.message) || 'Internal error'}`,
  },
  {
    status: 500,
    name: 'UNEXPECTED_ERROR',
    description: 'Unexpected error',
  },
  {
    status: 503,
    name: 'SERVICE_UNAVAILABLE',
    description: 'Service Unavailable',
  },
  {
    status: 500,
    name: 'EXIST_FILE',
    description: 'File exist in DB',
  },
  {
    status: 500,
    name: 'FILE_ERROR',
    description: 'Error in file',
  },
].forEach((error) => {
  // @ts-ignore
  errorClasses[error.name] = class extends BaseError {
    constructor(metadata: {}) {
      // @ts-ignore
      super(error.status, error.status, error.description, metadata);
    }
  };
});

export const errors: any = {
  ...errorClasses,
  BaseError,
};
