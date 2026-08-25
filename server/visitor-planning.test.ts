import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const appSource = readFileSync(fileURLToPath(new URL('../client/src/App.tsx', import.meta.url)), 'utf8');
const pageSource = readFileSync(fileURLToPath(new URL('../client/src/pages/VisitorPlanningPage.tsx', import.meta.url)), 'utf8');
const navbarSource = readFileSync(fileURLToPath(new URL('../client/src/components/Navbar.tsx', import.meta.url)), 'utf8');
const languageSource = readFileSync(fileURLToPath(new URL('../client/src/contexts/LanguageContext.tsx', import.meta.url)), 'utf8');

describe('visitor planning page routing', () => {
  it('does not mount the planning section in the homepage', () => {
    expect(appSource).not.toContain('<VisitorPlanningSection />');
    expect(appSource).toContain("currentPath === '/visitor-planning'");
    expect(appSource).toContain('<VisitorPlanningPage />');
  });

  it('keeps a clear dedicated route with a home escape path', () => {
    expect(pageSource).toContain('href="/"');
    expect(pageSource).toContain('<VisitorPlanningSection />');
    expect(pageSource).toContain('const pageCopy =');
  });

  it('exposes a translated navigation entry in all supported languages', () => {
    expect(navbarSource).toContain("href: '/visitor-planning'");
    expect(navbarSource).toContain('if (link.page)');
    for (const label of ['خطّط لزيارتك', 'Plan your visit', 'Planifier la visite', 'ⵙⵎⵓⵜⵜⵉ ⵉ ⵓⵔⴰⵔ']) {
      expect(languageSource).toContain(label);
    }
  });
});
