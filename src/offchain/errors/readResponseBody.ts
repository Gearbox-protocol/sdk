/**
 * Body of a failed response as text, or nothing when it cannot be read: a
 * failure explaining a failure is not itself worth throwing.
 **/
export async function readResponseBody(
  response: Response,
): Promise<string | undefined> {
  try {
    return await response.text();
  } catch {
    return undefined;
  }
}
