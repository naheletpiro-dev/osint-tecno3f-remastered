/**
 * Modulo 11 CUIT Validator for Argentina (ARCA / AFIP)
 * Validates 11-digit CUIT/CUIL numbers according to official AFIP checksum algorithm.
 */
export function isValidCuit(cuitStr) {
  if (!cuitStr) return false;
  const clean = String(cuitStr).replace(/\D/g, '');
  if (clean.length !== 11) return false;

  // CUIT types in Argentina: 20, 23, 24, 27, 30, 33, 34
  const validTypes = ['20', '23', '24', '27', '30', '33', '34'];
  const type = clean.slice(0, 2);
  if (!validTypes.includes(type)) return false;

  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * multipliers[i];
  }

  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 9;

  return parseInt(clean[10], 10) === checkDigit;
}

export function formatCuitInput(cuitStr) {
  if (!cuitStr) return '';
  const clean = String(cuitStr).replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  if (clean.length <= 10) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return `${clean.slice(0, 2)}-${clean.slice(2, 10)}-${clean.slice(10, 11)}`;
}
