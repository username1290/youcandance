import { describe, it, expect } from 'vitest';
import { getSizeFromMeasurement, getRecommendedSize } from '../core/sizingLogic';

describe('Sizing Logic', () => {
  describe('getSizeFromMeasurement', () => {
    it('returns correct size for girth', () => {
      expect(getSizeFromMeasurement('girth', 78)).toBe('XS');
      expect(getSizeFromMeasurement('girth', 82)).toBe('S');
      expect(getSizeFromMeasurement('girth', 88)).toBe('M');
    });

    it('returns XXS for very small measurements', () => {
      expect(getSizeFromMeasurement('girth', 70)).toBe('XXS');
    });

    it('returns XXXL for very large measurements', () => {
      expect(getSizeFromMeasurement('girth', 120)).toBe('XXXL');
    });
  });

  describe('getRecommendedSize', () => {
    it('returns the largest size from measurements', () => {
      const dancer = { girth: 78, waist: 82, hips: 88 }; // XS, XL, XS -> XL
      expect(getRecommendedSize(dancer)).toBe('XL');
    });

    it('handles edge cases', () => {
      const dancer = { girth: 70, waist: 60, hips: 85 }; // XXS, XXS, XS -> XS
      expect(getRecommendedSize(dancer)).toBe('XS');
    });
  });
});