export interface BaseResponse {
  body: object | string;
  statusCode: number;
  headers: object;
}

export async function baseResponse(
  body: object | string,
  httpCode: number,
  headers: object
): Promise<BaseResponse> {
  return {
    body: body,
    statusCode: httpCode,
    headers: headers
  };
}
