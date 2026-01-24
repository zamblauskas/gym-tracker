import { logger } from '$lib/logger';

export async function log<T>(message: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  const res = await fn();
  const end = performance.now();
  logger.info(`Finished: ${message}`, { res, duration: end - start });
  return res;
}
