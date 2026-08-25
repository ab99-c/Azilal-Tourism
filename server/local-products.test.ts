import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = readFileSync(fileURLToPath(new URL('../client/src/components/LocalProductsSection.tsx', import.meta.url)), 'utf8');
const categoriesSource = readFileSync(fileURLToPath(new URL('../client/src/components/CategoriesSection.tsx', import.meta.url)), 'utf8');

describe('local products and associations activity section', () => {
  it('is mounted inside the activities section with all language variants', () => {
    expect(categoriesSource).toContain('<LocalProductsSection />');
    for (const marker of ['منتجات أدرار والجمعيات المحلية', 'ADRAR products and local associations', 'Produits ADRAR et associations locales', 'ⵉⵎⵥⵍⴰⵢ']) {
      expect(source).toContain(marker);
    }
  });

  it('does not invent sellers, phone numbers, reviews, or ratings', () => {
    expect(source).toContain('ستظهر العروض والجهات الموثقة هنا قريباً.');
    expect(source).not.toMatch(/rating|review|testimonial|\+212|06\d{8}/i);
    expect(source).toContain('href="#contact"');
  });
});
