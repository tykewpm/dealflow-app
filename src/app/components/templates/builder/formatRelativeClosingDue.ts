/**
 * Compact copy for task due dates relative to closing (Template Builder + inspector hints).
 */
export function formatRelativeClosingDue(daysFromClosing: number): string {
  if (daysFromClosing === 0) {
    return 'On closing day';
  }
  const n = Math.abs(daysFromClosing);
  const unit = n === 1 ? 'day' : 'days';
  if (daysFromClosing < 0) {
    return `${n} ${unit} before closing`;
  }
  return `${n} ${unit} after closing`;
}
