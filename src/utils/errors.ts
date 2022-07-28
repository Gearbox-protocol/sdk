interface IMetamaskError {
  code: number;
  message: string;
}

export const isMetamaskError = (e: any): e is IMetamaskError => {
  if (!e) return false;
  if (typeof e !== "object") return false;
  if (typeof e.code !== "number" || typeof e.message !== "string") return false;
  return true;
};
