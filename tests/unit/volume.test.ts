import { describe, expect, it } from 'vitest';
import {
  calculateSetVolume,
  calculateTotalVolume,
  formatVolume,
  type SetInput
} from '$lib/utils/volume';

describe('volume calculations', () => {
  describe('calculateSetVolume', () => {
    it('returns actual and potential volume for set with RIR', () => {
      const set: SetInput = { weight: 50, reps: 10, repsInReserve: 2 };
      const result = calculateSetVolume(set);

      expect(result.actual).toBe(500);
      expect(result.potential).toBe(600);
    });

    it('returns equal volumes when RIR is null', () => {
      const set: SetInput = { weight: 50, reps: 10, repsInReserve: null };
      const result = calculateSetVolume(set);

      expect(result.actual).toBe(500);
      expect(result.potential).toBe(500);
    });

    it('returns equal volumes when RIR is 0', () => {
      const set: SetInput = { weight: 50, reps: 10, repsInReserve: 0 };
      const result = calculateSetVolume(set);

      expect(result.actual).toBe(500);
      expect(result.potential).toBe(500);
    });
  });

  describe('calculateTotalVolume', () => {
    it('sums volumes across multiple sets', () => {
      const sets: SetInput[] = [
        { weight: 50, reps: 10, repsInReserve: 2 },
        { weight: 50, reps: 8, repsInReserve: 1 },
        { weight: 45, reps: 6, repsInReserve: null }
      ];
      const result = calculateTotalVolume(sets);

      expect(result.actual).toBe(500 + 400 + 270);
      expect(result.potential).toBe(600 + 450 + 270);
    });

    it('returns zero for empty sets', () => {
      const result = calculateTotalVolume([]);

      expect(result.actual).toBe(0);
      expect(result.potential).toBe(0);
    });
  });

  describe('formatVolume', () => {
    it('shows percentage when potential differs from actual', () => {
      const result = formatVolume({ actual: 1000, potential: 1200 });
      expect(result).toBe('1,000 kg • Potential: 1,200 kg (83%)');
    });

    it('shows simple format when actual equals potential', () => {
      const result = formatVolume({ actual: 1000, potential: 1000 });
      expect(result).toBe('1,000 kg');
    });

    it('handles zero volume', () => {
      const result = formatVolume({ actual: 0, potential: 0 });
      expect(result).toBe('0 kg');
    });
  });
});
