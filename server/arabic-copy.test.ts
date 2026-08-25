import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const discoverySource = readFileSync(fileURLToPath(new URL('../client/src/components/UnifiedDiscoverySearch.tsx', import.meta.url)), 'utf8');
const planningSource = readFileSync(fileURLToPath(new URL('../client/src/components/VisitorPlanningSection.tsx', import.meta.url)), 'utf8');
const pageSource = readFileSync(fileURLToPath(new URL('../client/src/pages/VisitorPlanningPage.tsx', import.meta.url)), 'utf8');

const colloquialMarkers = ['باش ', 'ديال', 'ديالك', 'بغيت', 'قلب ', 'شوف ', 'ما لقيناش', 'كنوجدّو', 'قبل ما تمشي', 'فـ ADRAR'];

describe('Arabic interface copy', () => {
  it('uses Modern Standard Arabic in the discovery and planning copy', () => {
    for (const marker of colloquialMarkers) {
      expect(discoverySource).not.toContain(marker);
      expect(planningSource).not.toContain(marker);
      expect(pageSource).not.toContain(marker);
    }
    expect(discoverySource).toContain('اعثر على الإقامة أو وسيلة النقل أو المطعم الذي تبحث عنه');
    expect(discoverySource).toContain('يجمع بحث واحد العروض المتاحة في ADRAR');
    expect(planningSource).toContain('استخدم ADRAR لمقارنة الخيارات');
    expect(pageSource).toContain('خطّط لزيارتك إلى أزيلال بهدوء');
  });

  it('keeps the English, French, and Amazigh variants in the same components', () => {
    for (const source of [discoverySource, planningSource, pageSource]) {
      expect(source).toContain('en:');
      expect(source).toContain('fr:');
      expect(source).toContain('ber:');
    }
  });
});
