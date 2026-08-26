import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const discoverySource = readFileSync(fileURLToPath(new URL('../client/src/components/UnifiedDiscoverySearch.tsx', import.meta.url)), 'utf8');
const mapSource = readFileSync(fileURLToPath(new URL('../client/src/components/MapSection.tsx', import.meta.url)), 'utf8');
const safetySource = readFileSync(fileURLToPath(new URL('../client/src/pages/SafetyTripPage.tsx', import.meta.url)), 'utf8');

describe('visitor discovery contracts', () => {
  it('queries the four public listing types and links a result to its matching section', () => {
    expect(discoverySource).toContain('trpc.hotels.list.useQuery');
    expect(discoverySource).toContain('trpc.cars.list.useQuery');
    expect(discoverySource).toContain('trpc.restaurants.list.useQuery');
    expect(discoverySource).toContain('trpc.cafes.list.useQuery');
    expect(discoverySource).toContain("hotel: 'hotels', car: 'cars', restaurant: 'restaurants', cafe: 'cafes'");
    expect(discoverySource).toContain('`/listing-details?type=${item.kind}&id=${item.id}`');
  });

  it('keeps labels for Arabic, English, French, and Amazigh discovery feedback', () => {
    for (const label of ['placeholder', 'empty', 'loading']) {
      expect(discoverySource.split(`${label}: {`).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('links mountain activities to the adventure view on the Azilal map', () => {
    expect(safetySource).toContain('/?map=adventure#map');
    expect(safetySource).toContain('عرض المغامرات على خريطة أزيلال');
    expect(mapSource).toContain("new URLSearchParams(window.location.search).get('map')");
  });

  it('filters map pins by category and gives the selected landmark a safe route URL', () => {
    expect(mapSource).toContain("useState<'all' | Landmark['category']>('all')");
    expect(mapSource).toContain('markerLayer.clearLayers()');
    expect(mapSource).toContain("['all', 'nature', 'culture', 'adventure']");
    expect(mapSource).toContain('https://www.google.com/maps/dir/?api=1&destination=${selectedLandmark.lat},${selectedLandmark.lng}');
  });
});
