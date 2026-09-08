/**
 * Wi-Fi QR Code Formatter Service
 * Compliant with ZXing standard and mobile OS Wi-Fi join protocols
 */

export interface WifiQROptions {
  ssid: string;
  password?: string;
  encryption?: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

/**
 * Escapes special characters for ZXing WiFi QR standard
 * Special chars: \ ; , : "
 */
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"\\])/g, '\\$1');
}

export function generateWifiPayload(options: WifiQROptions): string {
  const { ssid, password = '', encryption = 'WPA', hidden = false } = options;

  if (!ssid.trim()) return '';

  const escSsid = escapeWifiString(ssid.trim());
  const escPass = escapeWifiString(password);

  // Standard format for iOS and Android: WIFI:S:MySSID;T:WPA;P:MyPassword;;
  let payload = `WIFI:S:${escSsid};T:${encryption};`;

  if (encryption !== 'nopass' && escPass) {
    payload += `P:${escPass};`;
  }

  if (hidden) {
    payload += `H:true;`;
  }

  payload += ';';
  return payload;
}
