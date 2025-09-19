export function getErrorMessage(e: unknown): string | undefined {
  if (typeof e !== "object" || e === null) return undefined;
  // Support Axios-like error shape
  const resp = (e as { response?: { data?: { message?: unknown } } }).response;
  const msg = resp?.data?.message;
  return typeof msg === "string" ? msg : undefined;
}

