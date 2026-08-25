import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const bookingModalSource = readFileSync(fileURLToPath(new URL('../client/src/components/BookingModal.tsx', import.meta.url)), 'utf8');
const ownerCalendarSource = readFileSync(fileURLToPath(new URL('../client/src/components/AvailabilityManager.tsx', import.meta.url)), 'utf8');

describe('availability UI contract', () => {
  it('checks hotel and car availability before the booking can progress or submit', () => {
    expect(bookingModalSource).toContain('trpc.availability.check.useQuery');
    expect(bookingModalSource).toContain("'booking.datesUnavailable'");
    expect(bookingModalSource).toContain('BOOKING_DATES_UNAVAILABLE');
    expect(bookingModalSource).toContain('disabled={step === 1');
  });

  it('keeps guest availability feedback available in all supported languages', () => {
    for (const label of ['booking.datesAvailable', 'booking.datesUnavailable', 'booking.checkingAvailability']) {
      expect(bookingModalSource.split(label).length).toBeGreaterThanOrEqual(5);
    }
  });

  it('keeps the owner availability planner limited to hotel and car blocks', () => {
    expect(ownerCalendarSource).toContain("type AvailabilityType = 'car' | 'hotel'");
    expect(ownerCalendarSource).toContain('trpc.availability.createBlock.useMutation');
    expect(ownerCalendarSource).toContain('trpc.availability.removeBlock.useMutation');
    expect(ownerCalendarSource).toContain('endsAt <= startsAt');
  });
});
