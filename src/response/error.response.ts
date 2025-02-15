export interface ErrorResponse {
  body: object;
  statusCode: number;
}

export const NotFound404ErrorResponse: ErrorResponse = {
  body: null,
  statusCode: 404
};

export function errorResponse(body: object, httpCode: number): ErrorResponse {
  return {
    body: body,
    statusCode: httpCode
  };
}
