import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const destinations = readFileSync('client/src/components/DestinationsSection.tsx', 'utf8');
const featured = readFileSync('client/src/components/FeaturedSection.tsx', 'utf8');

describe('trustworthy discovery labels', () => {
  it('does not present fixed destination ratings as real reviews', () => {
    expect(destinations).not.toContain('>\n                  4.8');
    expect(destinations).toContain('Natural destination');
    expect(destinations).toContain('وجهة طبيعية');
  });

  it('uses a neutral discovery label instead of decorative review stars', () => {
    expect(featured).toContain("import { ArrowRight } from 'lucide-react';");
    expect(featured).not.toContain('fill-[#c8a951]');
    expect(featured).toContain("t('featured.localLabel')");
  });
});
