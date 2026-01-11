import type { Range } from '$lib/types/range';

export function formatRepRange(range: Range<number> | null): string {
  if (!range) return '';

  if (range.min !== null && range.max !== null) {
    if (range.min === range.max) return `${range.min}`;
    return `${range.min}-${range.max}`;
  }
  if (range.min !== null) {
    return `${range.min}+`;
  }
  if (range.max !== null) {
    return `max ${range.max}`;
  }
  return '';
}
