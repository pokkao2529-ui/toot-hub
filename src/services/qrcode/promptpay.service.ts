/**
 * PromptPay EMVCo QR Code Generator Service
 * Conforms to Bank of Thailand PromptPay Standard (EMVCo Specification)
 */

function formatTLV(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * CRC16-CCITT calculation (Polynomial: 0x1021, Initial: 0xFFFF)
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
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

export interface PromptPayOptions {
  target: string; // Mobile phone number (e.g. 0812345678) or National ID/Tax ID (13 digits)
  amount?: number; // Optional amount in THB (e.g. 150.00)
}

export function sanitizePromptPayTarget(target: string): string {
  return target.replace(/[^0-9]/g, '');
}

export function generatePromptPayPayload(options: PromptPayOptions): string {
  const cleanTarget = sanitizePromptPayTarget(options.target);

  if (!cleanTarget) {
    throw new Error('กรุณาระบุเบอร์โทรศัพท์หรือเลขบัตรประชาชนสำหรับพร้อมเพย์');
  }

  // Determine target type
  let subTag = '';
  if (cleanTarget.length === 10 && cleanTarget.startsWith('0')) {
    // Mobile Phone (Convert 08x-xxx-xxxx to 00668xxxxxxxx)
    const mobileFormatted = `0066${cleanTarget.substring(1)}`;
    subTag = formatTLV('01', mobileFormatted);
  } else if (cleanTarget.length === 9) {
    // 9-digit mobile without leading zero
    const mobileFormatted = `0066${cleanTarget}`;
    subTag = formatTLV('01', mobileFormatted);
  } else if (cleanTarget.length === 13) {
    // National ID or Tax ID
    subTag = formatTLV('02', cleanTarget);
  } else if (cleanTarget.length === 15) {
    // E-Wallet ID
    subTag = formatTLV('03', cleanTarget);
  } else {
    throw new Error('รูปแบบพร้อมเพย์ไม่ถูกต้อง (ต้องเป็นเบอร์มือถือ 10 หลัก หรือเลขบัตรประชาชน 13 หลัก)');
  }

  // Merchant Account Information for PromptPay (AID: A000000677010111)
  const tag29AID = formatTLV('00', 'A000000677010111');
  const tag29Value = `${tag29AID}${subTag}`;
  const tag29 = formatTLV('29', tag29Value);

  // Payload Format Indicator (01)
  const tag00 = formatTLV('00', '01');

  // Point of Initiation Method: 11 = Static (no amount or reusable), 12 = Dynamic (amount specified)
  const pointOfInitiation = options.amount && options.amount > 0 ? '12' : '11';
  const tag01 = formatTLV('01', pointOfInitiation);

  // Country Code: TH
  const tag58 = formatTLV('58', 'TH');

  // Currency Code: 764 (THB)
  const tag53 = formatTLV('53', '764');

  // Amount (optional)
  let tag54 = '';
  if (options.amount && options.amount > 0) {
    tag54 = formatTLV('54', options.amount.toFixed(2));
  }

  // Combine segments before CRC
  const rawPayload = `${tag00}${tag01}${tag29}${tag53}${tag54}${tag58}6304`;

  // Calculate CRC16 checksum
  const checksum = crc16(rawPayload);

  return `${rawPayload}${checksum}`;
}
