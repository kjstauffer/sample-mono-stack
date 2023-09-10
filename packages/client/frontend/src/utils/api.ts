/* eslint-disable @typescript-eslint/naming-convention */

export type ApiResponse<ResponseData> = {
  /** OK status of the API call */
  ok: boolean;

  /** The returned JSON data, if successful */
  data?: ResponseData;

  /** Error to show when ok is false */
  error?: string;
};

type ApiError = {
  error: string;
};

/**
 * A type-guard to assert an unknown object is of type `ApiError`.
 */
const isApiError = (data: unknown): data is ApiError => {
  return typeof data === `object` && (data as Partial<ApiError>).error !== undefined;
};

/**
 * Using `fetch`, perform a JSON POST to an endpoint on the application's domain.
 */
const apiPost = async <ResponseData>(endPoint: string, params: unknown) => {
  const baseURI = `https://${CONFIG.domain}`;

  const response: ApiResponse<ResponseData> = {
    ok: false,
  };

  const res = await fetch(`${baseURI}${endPoint}`, {
    method: `POST`,
    body: JSON.stringify(params),
    headers: { 'Content-Type': `application/json` },
  });

  if (res.ok) {
    await res
      .json()
      .then((data) => {
        response.data = data as ResponseData;
        response.ok = true;
      })
      .catch(() => {
        response.error = `networkError`;
      });

    return response;
  }

  response.error = `serverError`;

  await res.json().then((data) => {
    if (isApiError(data)) {
      response.error = data.error;
    }
  });

  return response;
};

export { apiPost };
