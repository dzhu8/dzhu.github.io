/**
 * Utility function to calculate card rotation angles based on a three-row pattern:
 * Row 1: Original angles (-2deg, 2deg alternating)
 * Row 2: No rotation (0deg)
 * Row 3: Opposite angles (2deg, -2deg alternating)
 * Row 4: Back to original pattern, and so on...
 */
export function getCardRotation(index: number): number {
  // Determine which group of 3 rows we're in (0-based)
  const rowGroupIndex = Math.floor(index / 2); // Since we have 2 cards per row
  const rowInGroup = rowGroupIndex % 3; // 0, 1, or 2
  const isEvenCard = index % 2 === 0;

  switch (rowInGroup) {
    case 0: // First row in group: original pattern
      return isEvenCard ? -2 : 2;
    case 1: // Second row in group: no rotation
      return 0;
    case 2: // Third row in group: opposite pattern
      return isEvenCard ? 2 : -2;
    default:
      return 0;
  }
}

/**
 * Get the CSS transform string for a card at a given index
 */
export function getCardTransform(index: number): string {
  const rotation = getCardRotation(index);
  return `rotate(${rotation}deg)`;
}

/**
 * Get the hover transform string for a card at a given index
 */
export function getCardHoverTransform(index: number): string {
  const rotation = getCardRotation(index);
  const hoverRotation = rotation === 0 ? 0 : rotation / 2; // Half the rotation for hover
  return `rotate(${hoverRotation}deg) translateY(-4px)`;
}
