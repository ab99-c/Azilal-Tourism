import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync('client/src/App.tsx', 'utf8');
const section = readFileSync('client/src/components/AnswerReadySection.tsx', 'utf8');
const index = readFileSync('client/index.html', 'utf8');
const schema = readFileSync('client/src/lib/seoSchema.ts', 'utf8');

describe('SEO, GEO and AEO signals', () => {
  it('renders a multilingual answer-ready section on the public homepage', () => {
    expect(app).toContain("import AnswerReadySection from './components/AnswerReadySection';");
    expect(app).toContain('<AnswerReadySection />');
    expect(section).toContain('هل يمكن استعمال دليل الأنشطة دون إنترنت؟');
    expect(section).toContain('What can visitors discover in Azilal?');
  });

  it('keeps public structured data factual and avoids placeholder business entities', () => {
    expect(index).toContain('FAQPage');
    expect(index).toContain('max-image-preview:large');
    expect(schema).toContain('export const SEO_ENTITIES: SeoEntity[] = [];');
    expect(schema).not.toContain('info@adrar-tourism.ma');
    expect(schema).not.toContain('adrar.azilal');
  });
});
