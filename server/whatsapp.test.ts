import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl, getCustomerWhatsAppMessage, getWhatsAppMessage, normalizeWhatsAppNumber } from '../client/src/lib/whatsapp';

describe('WhatsApp helpers', () => {
  it('normalizes common Moroccan phone formats', () => {
    expect(normalizeWhatsAppNumber('0612 345 678')).toBe('212612345678');
    expect(normalizeWhatsAppNumber('+212 612 345 678')).toBe('212612345678');
    expect(normalizeWhatsAppNumber('00212612345678')).toBe('212612345678');
  });

  it('rejects empty or unusable phone values', () => {
    expect(normalizeWhatsAppNumber('')).toBeNull();
    expect(normalizeWhatsAppNumber('123')).toBeNull();
    expect(buildWhatsAppUrl(undefined, 'Hello')).toBeNull();
  });

  it('creates an encoded click-to-chat URL', () => {
    const url = buildWhatsAppUrl('0612345678', 'سلام، بغيت معلومات');
    expect(url).toContain('https://wa.me/212612345678?text=');
    expect(url).toContain(encodeURIComponent('سلام، بغيت معلومات'));
  });

  it('creates a localized customer booking message', () => {
    expect(getCustomerWhatsAppMessage('ar', 'فندق أدرار')).toContain('الحجز');
    expect(getCustomerWhatsAppMessage('en', 'ADRAR Hotel')).toContain('booking');
  });

  it('creates localized messages for each supported language', () => {
    expect(getWhatsAppMessage('ar', 'فندق أدرار', 'hotel')).toContain('ADRAR');
    expect(getWhatsAppMessage('en', 'ADRAR Hotel', 'hotel')).toContain('would like more information');
    expect(getWhatsAppMessage('fr', 'Hôtel ADRAR', 'hotel')).toContain("plus d'informations");
    expect(getWhatsAppMessage('ber', 'ⴰⵙⵏⴷⵇ', 'hotel')).toContain('ADRAR');
  });
});
