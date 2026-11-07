const WINDOW_MS = 10 * 60 * 1000;
const PER_KEY_LIMIT = 10;
const GLOBAL_LIMIT = 100;
const MAX_TRACKED_KEYS = 5000;

type RateLimitState = {
  buckets: Map<string, number[]>;
  globalBucket: number[];
};

const globalForRateLimit = globalThis as unknown as {
  rateLimitState: RateLimitState | undefined;
};

export function getRateLimitKey(headers: { get(name: string): string | null }): string {
  const candidates = [
    headers.get('cf-connecting-ip'),
    headers.get('x-forwarded-for')?.split(',')[0],
    headers.get('x-real-ip'),
  ];
  const address = candidates.map((value) => value?.trim()).find(Boolean) ?? 'unknown';

  return address.slice(0, 128);
}

export function consumeRateLimit(key: string, now = Date.now()): boolean {
  const state = getState();

  if (state.buckets.size >= MAX_TRACKED_KEYS) {
    pruneBuckets(state, now);
  }

  const keyBucket = pruneTimestamps(state.buckets.get(key) ?? [], now);
  const globalBucket = pruneTimestamps(state.globalBucket, now);
  const blocked = keyBucket.length >= PER_KEY_LIMIT || globalBucket.length >= GLOBAL_LIMIT;

  state.globalBucket = globalBucket;
  state.buckets.set(key, keyBucket);

  if (blocked) {
    return false;
  }

  keyBucket.push(now);
  globalBucket.push(now);
  return true;
}

function getState(): RateLimitState {
  return (globalForRateLimit.rateLimitState ??= {
    buckets: new Map(),
    globalBucket: [],
  });
}

function pruneBuckets(state: RateLimitState, now: number) {
  for (const [key, timestamps] of state.buckets) {
    const recent = pruneTimestamps(timestamps, now);

    if (recent.length === 0) {
      state.buckets.delete(key);
    } else {
      state.buckets.set(key, recent);
    }
  }
}

function pruneTimestamps(timestamps: number[], now: number) {
  return timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
}
