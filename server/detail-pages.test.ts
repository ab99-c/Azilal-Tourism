import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const app = readFileSync('client/src/App.tsx', 'utf8');
const destinations = readFileSync('client/src/components/DestinationsSection.tsx', 'utf8');
const featured = readFileSync('client/src/components/FeaturedSection.tsx', 'utf8');
const detail = readFileSync('client/src/pages/DetailPage.tsx', 'utf8');
const listingDetail = readFileSync('client/src/pages/ListingDetailPage.tsx', 'utf8');
const booking = readFileSync('client/src/components/BookingModal.tsx', 'utf8');

describe('trustworthy destination detail pages', () => {
  it('registers the details route and provides reusable localized content', () => {
    expect(app).toContain("const isDetailPage = currentPath === '/details'");
    expect(app).toContain('<DetailPage />');
    expect(detail).toContain("const detailData = {");
    expect(detail).toContain("ar: { title: 'بحيرة بين الويدان'");
    expect(detail).toContain("en: { title: 'Bin el Ouidane Lake'");
    expect(detail).toContain("fr: { title: 'Lac de Bin el Ouidane'");
  });

  it('links featured and destination cards to real detail URLs', () => {
    expect(destinations).toContain('href={`/details?type=destination&slug=${dest.slug}`}');
    expect(featured).toContain('href={`/details?type=destination&slug=${feature.slug}`}');
    expect(featured).not.toContain('href="#"');
  });

  it('supports database-backed listing details and transparent booking guidance', () => {
    expect(app).toContain("const isListingDetailPage = currentPath === '/listing-details'");
    expect(app).toContain('<ListingDetailPage />');
    expect(listingDetail).toContain('trpc.hotels.list.useQuery');
    expect(listingDetail).toContain('trpc.cars.list.useQuery');
    expect(listingDetail).toContain('trpc.restaurants.list.useQuery');
    expect(listingDetail).toContain('trpc.cafes.list.useQuery');
    expect(booking).toContain("'booking.cancellation'");
    expect(booking).toContain('سياسة الإلغاء تختلف حسب المالك');
  });

  it('does not invent public reviews or ratings in the detail view', () => {
    expect(detail).toContain('لا يوجد تقييم منشور لهذه الوجهة حالياً');
    expect(detail).not.toContain('4.8');
    expect(detail).not.toContain('Star');
  });
});
