import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexHtml = readFileSync(fileURLToPath(new URL('../client/index.html', import.meta.url)), 'utf8');
const planningSource = readFileSync(fileURLToPath(new URL('../client/src/components/VisitorPlanningSection.tsx', import.meta.url)), 'utf8');

describe('content and SEO safeguards', () => {
  it('does not claim an unverified ADRAR contact email in structured data', () => {
    expect(indexHtml).not.toContain('info@adrar-tourism.ma');
  });

  it('keeps visitor-planning content available in all supported site languages', () => {
    for (const token of ['ar:', 'en:', 'fr:', 'ber:']) {
      expect(planningSource).toContain(token);
    }
    expect(planningSource).toContain('Confirm your dates');
    expect(planningSource).toContain('Coordinate with the owner');
  });
});
