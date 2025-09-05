import { plainToInstance } from 'class-transformer';

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const generateRandomString = (length: number): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const truncateString = (
  str: string,
  length: number,
  suffix = '...',
): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
};

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(deepClone) as T;
  if (obj instanceof Object) {
    const copy = {} as Record<string, unknown>;
    Object.keys(obj).forEach((key) => {
      copy[key] = deepClone((obj as Record<string, unknown>)[key]);
    });
    return copy as T;
  }
  return obj;
};

export function toDto<T, V>(cls: new () => T, entity: V): T {
  return plainToInstance(cls, entity, { excludeExtraneousValues: true });
}

export function mapToLanguageEnum(language: string): string {
  switch (language.toLowerCase()) {
    case 'tr':
    case 'tr_tr':
    case 'turkish':
      return 'tr_TR';
    case 'en':
    case 'en_us':
    case 'english':
      return 'en_US';
    default:
      return 'en_US';
  }
}

export function getNextDisplayNameUpdateDate(lastUpdate: Date): Date {
  const nextUpdate = new Date(lastUpdate);
  nextUpdate.setDate(nextUpdate.getDate() + 30);
  return nextUpdate;
}

export function generateUniqueUsername(baseUsername: string): string[] {
  const suggestions = [baseUsername];
  for (let i = 1; i <= 10; i++) {
    suggestions.push(`${baseUsername}${i}`);
    suggestions.push(`${baseUsername}_${i}`);
  }

  const randomSuffix = Math.floor(Math.random() * 9999);
  suggestions.push(`${baseUsername}${randomSuffix}`);
  return suggestions;
}

export async function keepTryingUntilResolved<T>(
  fn: () => Promise<T> | T,
  options?: {
    retryCount?: number;
    delayMs?: number;
    throwIfFails?: boolean;
    errorFactory?: () => Error;
    fallback?: () => Promise<T> | T;
    debug?: boolean;
  },
): Promise<T | null> {
  const {
    retryCount = 10,
    delayMs = 1000,
    throwIfFails = true,
    errorFactory,
    fallback,
    debug = false,
  } = options ?? {};

  let attempt = 0;

  while (attempt < retryCount) {
    const result = await fn();

    if (debug) {
      console.log(
        `[keepTryingUntilResolved] Attempt ${attempt + 1}/${retryCount} → Result:`,
        result,
      );
    }

    if (result) {
      if (debug) {
        console.log(
          `[keepTryingUntilResolved] ✅ Success on attempt ${attempt + 1}`,
        );
      }
      return result;
    }

    attempt++;

    if (attempt >= retryCount) break;

    if (debug) {
      console.log(`[keepTryingUntilResolved] ⏳ Retrying in ${delayMs}ms...`);
    }

    await sleep(delayMs);
  }

  if (fallback) {
    if (debug) {
      console.log(
        `[keepTryingUntilResolved] ⚠️ All retries failed, running fallback...`,
      );
    }
    return fallback();
  }

  if (debug) {
    console.log(
      `[keepTryingUntilResolved] ❌ Failed after ${retryCount} attempts`,
    );
  }

  if (throwIfFails) {
    throw (
      errorFactory?.() ??
      new Error(`keepTryingUntilResolved failed after ${retryCount} attempts`)
    );
  }

  return null;
}
