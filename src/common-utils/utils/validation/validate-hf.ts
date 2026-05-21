export const MIN_HF_LIMITED = 10100n;

export interface ValidateHFProps {
  hf: number | undefined;
  hfCheck?: boolean;
}

export interface ValidateHFResult {
  message: "hfTooLow";
}

export function validateHF({
  hf,
  hfCheck = true,
}: ValidateHFProps): ValidateHFResult | null {
  if (hfCheck && (hf === undefined || hf <= MIN_HF_LIMITED))
    return { message: "hfTooLow" };
  return null;
}
