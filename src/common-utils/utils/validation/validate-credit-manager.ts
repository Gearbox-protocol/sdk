export interface ValidateCreditManagerProps {
  creditManager: { isPaused: boolean };
  allowPausedCm?: boolean;
}

export interface ValidateCreditManagerResult {
  message: "paused";
}

export function validateCreditManager({
  creditManager,
  allowPausedCm,
}: ValidateCreditManagerProps): ValidateCreditManagerResult | null {
  if (creditManager.isPaused && !allowPausedCm) return { message: "paused" };

  return null;
}
