import {
  OffchainInvalidJsonError,
  OffchainRequestFailedError,
} from "./errors/index.js";

export async function fetchOffchainResponse(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (cause) {
    throw new OffchainRequestFailedError(url, cause);
  }
}

export async function readOffchainJson(
  url: string,
  response: Response,
): Promise<unknown> {
  try {
    return await response.json();
  } catch (cause) {
    throw new OffchainInvalidJsonError(url, response.status, cause);
  }
}
