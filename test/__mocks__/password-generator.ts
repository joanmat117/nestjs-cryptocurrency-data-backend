let callCount = 0;

export function generatePasswordWithOptions(_options?: {
  length?: number;
  memorable?: boolean;
}): string {
  callCount++;
  return `alpha bravo charlie${callCount}`;
}
