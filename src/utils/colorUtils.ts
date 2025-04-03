// Modern color palette that works well with our UI
const MODERN_COLORS = [
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#FF5722', // Deep Orange
  '#00BCD4', // Cyan
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
];

// Function to generate a unique color that's not already used
export const generateUniqueColor = (usedColors: string[]): string => {
  const availableColors = MODERN_COLORS.filter(color => !usedColors.includes(color));
  
  if (availableColors.length > 0) {
    return availableColors[0];
  }
  
  // If all colors are used, generate a new one that's visually distinct
  const hue = Math.random() * 360;
  return `hsl(${hue}, 70%, 60%)`;
};

// Function to check if a color is too similar to existing colors
export const isColorTooSimilar = (color: string, usedColors: string[]): boolean => {
  const colorHSL = hexToHSL(color);
  
  return usedColors.some(usedColor => {
    const usedHSL = hexToHSL(usedColor);
    return (
      Math.abs(colorHSL.h - usedHSL.h) < 30 && // Similar hue
      Math.abs(colorHSL.s - usedHSL.s) < 20 && // Similar saturation
      Math.abs(colorHSL.l - usedHSL.l) < 20    // Similar lightness
    );
  });
};

// Helper function to convert hex to HSL
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}; 