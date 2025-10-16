export interface Auditor {
  address: string;
  name: string;
  addedAt: number;
  removed: boolean;
  removedAt: number | null;
}