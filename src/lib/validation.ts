const DISCORD_ID_REGEX = /^\d{17,20}$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_REGEX = /^[a-z0-9_-]{1,64}$/;
const SAFE_TEXT_REGEX = /^[\w\s\-.,!?'"(){}\[\]:;/<>=&%@#+*$/]{1,500}$/;

export function isDiscordId(value: unknown): boolean {
  return typeof value === 'string' && DISCORD_ID_REGEX.test(value);
}

export function isUuid(value: unknown): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export function isSlug(value: unknown): boolean {
  return typeof value === 'string' && SLUG_REGEX.test(value);
}

export function sanitizeText(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLen).replace(/[<>]/g, '');
}

export function sanitizeConfig(obj: unknown): Record<string, unknown> | null {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return null;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (typeof key === 'string' && key.length <= 64) {
      if (typeof val === 'string') result[key] = sanitizeText(val, 1000);
      else if (typeof val === 'number' || typeof val === 'boolean') result[key] = val;
      else if (val === null) result[key] = null;
      else if (typeof val === 'object' && !Array.isArray(val)) {
        const nested = sanitizeConfig(val);
        if (nested) result[key] = nested;
      }
    }
  }
  return result;
}

export function validateId(id: unknown, type: 'discord' | 'uuid' | 'slug' = 'uuid'): string | null {
  if (!id || typeof id !== 'string') return null;
  const clean = id.trim();
  if (type === 'discord' && !isDiscordId(clean)) return null;
  if (type === 'uuid' && !isUuid(clean)) return null;
  if (type === 'slug' && !isSlug(clean)) return null;
  return clean;
}