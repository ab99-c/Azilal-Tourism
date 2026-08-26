import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (relativePath: string) => readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
const source = read('../client/src/components/LocalProductsSection.tsx');
const categoriesSource = read('../client/src/components/CategoriesSection.tsx');
const navbarSource = read('../client/src/components/Navbar.tsx');
const appSource = read('../client/src/App.tsx');
const pageSource = read('../client/src/pages/LocalProductsPage.tsx');

describe('local products and associations dedicated page', () => {
  it('routes products to a standalone page and removes it from the homepage', () => {
    expect(categoriesSource).not.toContain('<LocalProductsSection />');
    expect(categoriesSource).toContain("title: 'cat.localProducts'");
    expect(categoriesSource).toContain("page: true");
    expect(categoriesSource).toContain("window.location.assign('/products')");
    expect(navbarSource).toContain("{ key: 'nav.localProducts', href: '/products', page: true }");
    expect(appSource).toContain("const isLocalProductsPage = currentPath === '/products'");
    expect(appSource).toContain('<LocalProductsPage />');
    expect(pageSource).toContain('<LocalProductsSection />');
    expect(source).toContain('id="local-products"');
    expect(source).not.toContain('<Leaf');
  });

  it('keeps the page multilingual and avoids invented sellers or contact details', () => {
    for (const marker of ['منتجات أدرار والجمعيات المحلية', 'ADRAR products and local associations', 'Produits ADRAR et associations locales', 'ⵉⵎⵥⵍⴰⵢ']) {
      expect(source).toContain(marker);
    }
    expect(source).toContain('ستظهر العروض والجهات الموثقة هنا قريباً.');
    expect(source).not.toMatch(/rating|review|testimonial|\+212|06\d{8}/i);
    expect(source).toContain('href="/#contact"');
  });
});
