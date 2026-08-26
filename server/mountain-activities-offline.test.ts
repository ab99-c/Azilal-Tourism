import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const offlineCard = readFileSync('client/src/components/MountainActivitiesOfflineCard.tsx', 'utf8');
const safetyPage = readFileSync('client/src/pages/SafetyTripPage.tsx', 'utf8');

describe('mountain activities offline mode', () => {
  it('stores a versioned, general activity guide only after the user chooses to save it', () => {
    expect(offlineCard).toContain("const STORAGE_KEY = 'adrar-mountain-activities-offline-v1'");
    expect(offlineCard).toContain("number: '141'");
    expect(offlineCard).toContain("number: '150'");
    expect(offlineCard).toContain("number: '177'");
    expect(offlineCard).toContain("number: '190'");
    expect(offlineCard).toContain('localStorage.setItem(STORAGE_KEY');
    expect(offlineCard).toContain('const saveGuide = () =>');
    expect(offlineCard).toContain('version: 1');
    expect(offlineCard).toContain('This is general activity information');
  });

  it('restores the guide and provides a delete action', () => {
    expect(offlineCard).toContain('localStorage.getItem(STORAGE_KEY)');
    expect(offlineCard).toContain('const deleteGuide = () =>');
    expect(offlineCard).toContain('emergencyContacts');
    expect(offlineCard).toContain('href={`tel:${contact.number}`}');
    expect(offlineCard).toContain('أرقام الطوارئ والإنقاذ');
    expect(offlineCard).toContain('localStorage.removeItem(STORAGE_KEY)');
    expect(offlineCard).toContain('يمكنك الرجوع إلى هذه المعلومات عند انقطاع الإنترنت');
  });

  it('is scoped to the mountain Safety Trip page', () => {
    expect(safetyPage).toContain("import MountainActivitiesOfflineCard from '@/components/MountainActivitiesOfflineCard'");
    expect(safetyPage).toContain('<MountainActivitiesOfflineCard />');
  });
});
