// Password rules, shared by registration, Change Password and their forms' hints. Pure, so a form
// can show them without the API behind it; the server (here, the mock) checks them again.

/**
 * Password rules shared by registration and Change Password (and their forms' hints): at least
 * 8 characters with a letter and a digit. The server (here, the mock) checks them again.
 */
export const PASSWORD_RULES = { minLength: 8 } as const;

/** The most common passwords that pass the rules: refused when changing one (03.06). */
const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  "password1",
  "password123",
  "qwerty123",
  "abc12345",
  "letmein1",
  "welcome1",
  "admin123",
  "iloveyou1",
]);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

/** Each password rule on its own, for the forms' requirement lists. */
export interface PasswordChecks {
  minLength: boolean;
  letter: boolean;
  digit: boolean;
}

export function passwordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= PASSWORD_RULES.minLength,
    letter: /\p{L}/u.test(password),
    digit: /\d/.test(password),
  };
}

export function isValidPassword(password: string): boolean {
  return Object.values(passwordChecks(password)).every(Boolean);
}
