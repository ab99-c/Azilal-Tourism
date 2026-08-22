export type SupportedLanguage = 'ar' | 'en' | 'fr' | 'ber';

/**
 * Convert common Moroccan phone formats into the international digits expected
 * by wa.me. Existing international numbers are preserved as digits only.
 */
export function normalizeWhatsAppNumber(value: string | null | undefined): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;

  let digits = raw.replace(/\D/g, '');
  if (raw.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith('212')) return digits;
  if (digits.startsWith('0') && digits.length >= 10) return `212${digits.slice(1)}`;
  if (/^[5-7]\d{8}$/.test(digits)) return `212${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return digits;
  return null;
}

export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string | null {
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function getCustomerWhatsAppMessage(lang: SupportedLanguage, itemName: string): string {
  if (lang === 'en') return `Hello, this is ${itemName} on ADRAR. We are contacting you about your booking.`;
  if (lang === 'fr') return `Bonjour, ici ${itemName} sur ADRAR. Nous vous contactons au sujet de votre réservation.`;
  if (lang === 'ber') return `ⴰⵣⵓⵍ, ⴷ ${itemName} ⵙⴳ ADRAR. ⵏⵙⵙⵉⵡⵍ ⴰⴽ ⵅⴼ ⵓⵙⵏⴷⵇ ⵏⵏⴽ.`;
  return `السلام عليكم، معاك ${itemName} من ADRAR. كنتاصلوا معاك بخصوص الحجز ديالك.`;
}

export function getWhatsAppMessage(
  lang: SupportedLanguage,
  itemName: string,
  kind: 'hotel' | 'restaurant' | 'cafe' | 'car',
): string {
  const kindLabel = {
    ar: { hotel: 'الفندق', restaurant: 'المطعم', cafe: 'المقهى', car: 'السيارة' },
    en: { hotel: 'hotel', restaurant: 'restaurant', cafe: 'café', car: 'car' },
    fr: { hotel: "l'hôtel", restaurant: 'le restaurant', cafe: 'le café', car: 'la voiture' },
    ber: { hotel: 'ⴰⵙⵏⴷⵇ', restaurant: 'ⵉⵎⵙⵙⴽ', cafe: 'ⴰⵇⵀⵡⴰ', car: 'ⵜⴰⵙⵍⵍⴰⵙⵜ' },
  }[lang][kind];

  if (lang === 'en') return `Hello, I found ${itemName} on ADRAR and would like more information about ${kindLabel}.`;
  if (lang === 'fr') return `Bonjour, j'ai trouvé ${itemName} sur ADRAR et je souhaite plus d'informations sur ${kindLabel}.`;
  if (lang === 'ber') return `ⴰⵣⵓⵍ, ⵓⴼⵉⵖ ${itemName} ⴳ ADRAR, ⵔⵉⵖ ⵉⵙⴰⵍⵏ ⵅⴼ ${kindLabel}.`;
  return `السلام عليكم، لقيت ${itemName} فـ ADRAR وبغيت معلومات أكثر على ${kindLabel}.`;
}
