import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const appSource = readFileSync(fileURLToPath(new URL('../client/src/App.tsx', import.meta.url)), 'utf8');
const navbarSource = readFileSync(fileURLToPath(new URL('../client/src/components/Navbar.tsx', import.meta.url)), 'utf8');

describe('site stability guards', () => {
  it('mounts protected dashboards only after authenticated user state is available', () => {
    expect(appSource).toContain('function AuthenticatedDashboards()');
    expect(appSource).toContain('if (loading || !user) return null;');
    expect(appSource).toContain('<AuthenticatedDashboards />');
    expect(appSource).not.toContain('              <CarOwnerDashboard />\n              <GuestDashboard />');
    expect(appSource).toContain('if (loading || !user) return null;');
  });

  it('does not treat the first authenticated session read as a fresh login dialog trigger', () => {
    expect(navbarSource).toContain('const authHasResolved = useRef(false);');
    expect(navbarSource).toContain('if (!authHasResolved.current)');
    expect(navbarSource).toContain('prevAuth.current = isAuthenticated;');
  });

  it('keeps the mobile menu below the viewport instead of using an unresolved percentage', () => {
    expect(navbarSource).toContain("maxHeight: 'calc(100dvh - 4.5rem)'");
    expect(navbarSource).not.toContain("maxHeight: 'calc(100dvh - 100%)'");
  });
});
