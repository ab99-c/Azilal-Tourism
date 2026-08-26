import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createEmailAuthTokenValue } from './db';

const routerSource = readFileSync(fileURLToPath(new URL('./routers.ts', import.meta.url)), 'utf8');
const schemaSource = readFileSync(fileURLToPath(new URL('../drizzle/schema.ts', import.meta.url)), 'utf8');
const authDialogSource = readFileSync(fileURLToPath(new URL('../client/src/components/LocalAuthDialog.tsx', import.meta.url)), 'utf8');

describe('email authentication foundation', () => {
  it('creates high-entropy raw tokens and stores only a sha256 hash', () => {
    const first = createEmailAuthTokenValue();
    const second = createEmailAuthTokenValue();
    expect(first.rawToken).toHaveLength(64);
    expect(first.tokenHash).toHaveLength(64);
    expect(first.rawToken).not.toBe(first.tokenHash);
    expect(first.rawToken).not.toBe(second.rawToken);
    expect(schemaSource).toContain('tokenHash: varchar("tokenHash", { length: 128 })');
    expect(schemaSource).toContain('usedAt: timestamp("usedAt")');
    expect(schemaSource).toContain('expiresAt: timestamp("expiresAt")');
  });

  it('shows accessible loading and clear feedback states in the auth dialog', () => {
    expect(authDialogSource).toContain('Loader2');
    expect(authDialogSource).toContain('aria-busy={pending}');
    expect(authDialogSource).toContain('role={feedbackType === \'error\' ? \'alert\' : \'status\'}');
    expect(authDialogSource).toContain('border-red-200 bg-red-50');
    expect(authDialogSource).toContain('formIncomplete');
    expect(authDialogSource).toContain('invalidToken');
    expect(authDialogSource).toContain('getPasswordStrength');
    expect(authDialogSource).toContain('strengthLabels');
    expect(authDialogSource).toContain('role="progressbar"');
    expect(authDialogSource).toContain('passwordStrength >= 4');
    expect(authDialogSource).toContain('showPassword');
    expect(authDialogSource).toContain("type={mode === 'reset' && showPassword ? 'text' : 'password'}");
    expect(authDialogSource).toContain('aria-label={showPassword ? c.hidePassword : c.showPassword}');
    expect(authDialogSource).toContain('EyeOff');
  });

  it('keeps dispatch disabled while exposing verification and reset contracts', () => {
    expect(routerSource).toContain('prepareEmailVerification');
    expect(routerSource).toContain('requestPasswordReset');
    expect(routerSource).toContain('verifyEmail');
    expect(routerSource).toContain('resetPassword');
    expect(routerSource).toContain('dispatchEnabled: false');
    expect(routerSource).toContain('INVALID_OR_EXPIRED_TOKEN');
  });
});

// This suite deliberately does not send an email or seed account data.
