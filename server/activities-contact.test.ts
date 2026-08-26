import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync('client/src/components/DestinationsSection.tsx', 'utf8');

describe('activity card contact action', () => {
  it('shows a visible contact icon and uses the translated contact label', () => {
    expect(source).toContain("import { MapPin, PhoneCall } from 'lucide-react'");
    expect(source).toContain('href="#contact"');
    expect(source).toContain("aria-label={contactLabels[lang]}");
    expect(source).toContain("<PhoneCall className=\"h-4 w-4\"");
    expect(source).toContain("<span>{contactLabels[lang]}</span>");
    expect(source).toContain("ar: 'اتصل الآن'");
  });

  it('does not invent phone numbers for activity places', () => {
    expect(source).not.toMatch(/\+212|06\d{8}|phone\s*:/i);
  });
});
