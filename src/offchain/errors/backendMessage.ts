const MAX_LENGTH = 200;

/**
 * Why a non-2xx response failed, in the backend's own words: the `message` of a
 * Gearbox backend error body, the whole body when it is not one, and nothing
 * when it said nothing at all.
 **/
export function backendMessage(body: string | undefined): string | undefined {
  if (!body) {
    return undefined;
  }
  const message = parsedMessage(body) ?? body.trim();
  return message ? truncate(message) : undefined;
}

/**
 * The `message` of a Gearbox backend error body, or nothing when the body is
 * not one.
 **/
function parsedMessage(body: string): string | undefined {
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof parsed.message === "string"
    ) {
      return parsed.message;
    }
  } catch {}
  return undefined;
}

function truncate(text: string): string {
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}…` : text;
}
