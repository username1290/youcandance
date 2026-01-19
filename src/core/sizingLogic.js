// Advanced Sizing Logic: Map metric measurements to common manufacturer size charts
// Based on standard US size charts for dance costumes (approximate mappings)

const sizeCharts = {
  // Girth (chest/bust) to size
  girth: {
    'XS': { min: 75, max: 80 },
    'S': { min: 81, max: 85 },
    'M': { min: 86, max: 90 },
    'L': { min: 91, max: 95 },
    'XL': { min: 96, max: 100 },
    'XXL': { min: 101, max: 110 }
  },
  // Waist to size
  waist: {
    'XS': { min: 60, max: 65 },
    'S': { min: 66, max: 70 },
    'M': { min: 71, max: 75 },
    'L': { min: 76, max: 80 },
    'XL': { min: 81, max: 85 },
    'XXL': { min: 86, max: 95 }
  },
  // Hips to size
  hips: {
    'XS': { min: 85, max: 90 },
    'S': { min: 91, max: 95 },
    'M': { min: 96, max: 100 },
    'L': { min: 101, max: 105 },
    'XL': { min: 106, max: 110 },
    'XXL': { min: 111, max: 120 }
  }
};

export const getSizeFromMeasurement = (measurementType, value) => {
  const chart = sizeCharts[measurementType];
  if (!chart) return 'Unknown';

  for (const [size, range] of Object.entries(chart)) {
    if (value >= range.min && value <= range.max) {
      return size;
    }
  }
  return value < chart.XS.min ? 'XXS' : 'XXXL';
};

export const getRecommendedSize = (dancer) => {
  const girthSize = getSizeFromMeasurement('girth', dancer.girth);
  const waistSize = getSizeFromMeasurement('waist', dancer.waist);
  const hipsSize = getSizeFromMeasurement('hips', dancer.hips);

  // Use the largest size as the recommended size
  const sizes = [girthSize, waistSize, hipsSize];
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const maxIndex = Math.max(...sizes.map(size => sizeOrder.indexOf(size)));
  return sizeOrder[maxIndex] || 'M';
};