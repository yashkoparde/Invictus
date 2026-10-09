/**
 * Validation utilities for emails and social platform handles/URLs.
 * Restricts disposable/proxy/burner email domains and prevents putting
 * social profile URLs/handles (GitHub, LinkedIn, LeetCode, etc.) into email fields.
 */

// Popular disposable, temp mail and proxy domains
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "trashmail.com",
  "yopmail.com",
  "throwawaymail.com",
  "temp-mail.org",
  "fakeinbox.com",
  "mytemp.email",
  "dropmail.me",
  "mohmal.com",
  "burnermail.io",
  "inboxkitten.com",
  "maildrop.cc",
  "crazymailing.com",
  "emailondeck.com",
  "tempail.com",
  "generator.email",
  "guerrillamailblock.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "bccto.me",
  "chacuo.net"
]);

// Patterns indicating social URLs or usernames entered in place of an email
const SOCIAL_IN_EMAIL_PATTERNS = [
  /github\.com/i,
  /linkedin\.com/i,
  /twitter\.com/i,
  /x\.com/i,
  /instagram\.com/i,
  /facebook\.com/i,
  /leetcode\.com/i,
  /codeforces\.com/i,
  /^@?[a-zA-Z0-9_-]+\/(.*)/, // repo path like user/repo
];

export function validateEmail(emailInput: string): { isValid: boolean; error?: string } {
  const trimmed = emailInput.trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required." };
  }

  // Check if someone pasted a URL or social platform identifier
  for (const pattern of SOCIAL_IN_EMAIL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: "Please enter a valid personal or institutional email, not a GitHub, LinkedIn, or social profile URL.",
      };
    }
  }

  // Basic email structure validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email format (e.g., student@college.edu or name@gmail.com)." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email address structure." };
  }

  const domain = parts[1].toLowerCase();

  // Block proxy / disposable domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Temporary or proxy email providers are not permitted. Please use your genuine college or personal email.",
    };
  }

  // Prevent GitHub or LinkedIn domains masquerading as email (e.g. user@github.com / user@linkedin.com)
  if (domain === "github.com" || domain === "linkedin.com" || domain.endsWith(".github.com") || domain.endsWith(".linkedin.com")) {
    return {
      isValid: false,
      error: "GitHub and LinkedIn domain emails are restricted. Please provide your actual personal or university email.",
    };
  }

  return { isValid: true };
}

/**
 * Validates and normalizes GitHub link or username
 */
export function validateGithub(input: string): { isValid: boolean; sanitized: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { isValid: true, sanitized: "" };

  let val = trimmed.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
  val = val.replace(/^@/, "");
  val = val.split("/")[0].trim(); // Take username part

  // Github username rules: max 39 chars, alphanumeric and single hyphens
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(val)) {
    return { isValid: false, sanitized: val, error: "Please enter a valid GitHub username or profile link." };
  }

  return { isValid: true, sanitized: val };
}

/**
 * Validates and normalizes LinkedIn link
 */
export function validateLinkedin(input: string): { isValid: boolean; sanitized: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { isValid: true, sanitized: "" };

  if (!trimmed.includes("linkedin.com") && !trimmed.startsWith("in/")) {
    // If just handle given
    return { isValid: true, sanitized: `https://linkedin.com/in/${trimmed.replace(/^\/+/, "")}` };
  }

  const fullUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  if (!/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i.test(fullUrl)) {
    return { isValid: false, sanitized: fullUrl, error: "Please enter a valid LinkedIn URL (e.g. linkedin.com/in/username)." };
  }

  return { isValid: true, sanitized: fullUrl };
}
