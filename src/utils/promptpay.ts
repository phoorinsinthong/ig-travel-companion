/**
 * Official EMVCo Standard Thai QR Payment (PromptPay) Payload Generator
 * Complies with Bank of Thailand & PromptPay Specification
 * Generates genuine QR codes scannable by K PLUS, SCB EASY, Krungthai NEXT, etc.
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    crc ^= (code << 8) & 0xffff;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Clean phone number or national ID
  const sanitized = target.replace(/[^0-9]/g, '');

  let recipientSubTag = '';
  if (sanitized.length === 10 && sanitized.startsWith('0')) {
    // Thai Mobile Phone (e.g. 0812345678 -> 0066812345678)
    const intlNumber = '0066' + sanitized.substring(1);
    recipientSubTag = formatTag('01', intlNumber);
  } else if (sanitized.length === 13) {
    // Thai Citizen ID / Tax ID
    recipientSubTag = formatTag('02', sanitized);
  } else if (sanitized.length === 15) {
    // E-Wallet ID
    recipientSubTag = formatTag('03', sanitized);
  } else {
    // Default fallback to mobile formatting
    const intlNumber = sanitized.startsWith('66') ? '00' + sanitized : '0066' + sanitized;
    recipientSubTag = formatTag('01', intlNumber);
  }

  // Tag 29: Merchant Account Information
  const aid = formatTag('00', 'A000000677010111');
  const merchantInfo = formatTag('29', aid + recipientSubTag);

  // Point of Initiation Method: 11 = Static (no amount), 12 = Dynamic (with amount)
  const isDynamic = typeof amount === 'number' && amount > 0;
  const pointOfInitiation = formatTag('01', isDynamic ? '12' : '11');

  // Payload Format Indicator
  let payload = formatTag('00', '01') + pointOfInitiation + merchantInfo + formatTag('58', 'TH') + formatTag('53', '764');

  // Tag 54: Transaction Amount
  if (isDynamic && amount) {
    const formattedAmount = amount.toFixed(2);
    payload += formatTag('54', formattedAmount);
  }

  // Append Tag 63 placeholder and calculate CRC
  const toCompute = payload + '6304';
  const checksum = crc16(toCompute);

  return toCompute + checksum;
}
