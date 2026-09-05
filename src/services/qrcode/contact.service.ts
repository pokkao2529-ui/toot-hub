/**
 * Contact Card (vCard & MECARD) Generator Service
 * Optimizes contact QR codes for LINE Scanner, iOS Camera, and Android
 */

export interface ContactOptions {
  name: string;
  phone?: string;
  email?: string;
  org?: string;
  title?: string;
  format?: 'mecard' | 'vcard'; // mecard is recommended for LINE and mobile scanners
}

function escapeMecardString(str: string): string {
  return str.replace(/([\\;,:"\\])/g, '\\$1');
}

/**
 * Generates MECARD payload (Best compatibility for LINE and Asian smartphones)
 */
export function generateMecardPayload(options: ContactOptions): string {
  const { name, phone = '', email = '', org = '' } = options;

  if (!name.trim() && !phone.trim()) return '';

  let mecard = `MECARD:N:${escapeMecardString(name.trim())};`;

  if (org.trim()) {
    mecard += `ORG:${escapeMecardString(org.trim())};`;
  }
  if (phone.trim()) {
    mecard += `TEL:${phone.replace(/[^0-9+]/g, '')};`;
  }
  if (email.trim()) {
    mecard += `EMAIL:${escapeMecardString(email.trim())};`;
  }

  mecard += ';';
  return mecard;
}

/**
 * Generates RFC-compliant vCard 3.0 with CRLF and UTF-8 charset
 */
export function generateVCardPayload(options: ContactOptions): string {
  const { name, phone = '', email = '', org = '', title = '' } = options;

  if (!name.trim() && !phone.trim()) return '';

  const cleanName = name.trim();
  const cleanPhone = phone.trim();
  const cleanEmail = email.trim();
  const cleanOrg = org.trim();

  // Strict CRLF (\r\n) is required by RFC 2426
  let lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  lines.push(`FN;CHARSET=UTF-8:${cleanName}`);
  lines.push(`N;CHARSET=UTF-8:;${cleanName};;;`);

  if (cleanOrg) {
    lines.push(`ORG;CHARSET=UTF-8:${cleanOrg}`);
  }
  if (title) {
    lines.push(`TITLE;CHARSET=UTF-8:${title}`);
  }
  if (cleanPhone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${cleanPhone}`);
  }
  if (cleanEmail) {
    lines.push(`EMAIL;TYPE=INTERNET:${cleanEmail}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}
