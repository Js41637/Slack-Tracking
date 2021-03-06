/**
 * @module Utilities
 */ /** for typedoc */

 export function getScaledBorderRadius(iconSize: number): number {
  const rounding = process.platform === 'darwin' ? 6.0 : 2.0;

  // Linearly scale the border radius based on 36px == 6px border, but clamp
  // the scale at 2.5x so we don't turn into a circle at hugebig sizes
  const scale = Math.min((iconSize / 36.0), 2.5);
  return Math.floor(scale * rounding /*px*/);
}
