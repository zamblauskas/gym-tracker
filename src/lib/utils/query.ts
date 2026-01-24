import {
  createMutation as mutation,
  createQuery as query,
  QueryClient,
  useQueryClient,
  type CreateMutationResult,
  type CreateQueryResult,
  type QueryKey
} from '@tanstack/svelte-query';

import { log } from '$lib/utils/log';
import { logger } from '$lib/logger';

export function fetchQuery<TData>({
  key,
  fn
}: {
  key: QueryKey;
  fn: () => Promise<TData>;
}): CreateQueryResult<TData> {
  return query(() => ({
    queryKey: key,
    queryFn: () => log(`fetching [${key}]`, () => fn())
  }));
}

export function createMutation<TData>({
  fn,
  invalidateKeys
}: {
  fn: (data: TData) => Promise<string>;
  invalidateKeys: QueryKey[];
}): CreateMutationResult<string, Error, TData> {
  const client = useQueryClient();
  return mutation(() => ({
    mutationFn: async (data) => {
      return log(`creating`, () => fn(data));
    },
    onSettled: async () => {
      await invalidateQueries(client, invalidateKeys);
    }
  }));
}

export function updateMutation<TUpdate, TData>({
  key,
  fn,
  invalidateKeys,
  merge
}: {
  key: QueryKey;
  fn: (data: TUpdate) => Promise<void>;
  invalidateKeys: QueryKey[];
  merge?: (previousData: TData, update: TUpdate) => TData;
}): CreateMutationResult<void, Error, TUpdate> {
  const client = useQueryClient();
  return mutation(() => ({
    mutationFn: async (update: TUpdate) => {
      return log(`updating [${key}]`, () => fn(update));
    },
    onMutate: (update) => {
      return client.setQueryData<TData>(key, (previousData) => {
        if (!previousData) {
          return;
        }
        if (merge) {
          return merge(previousData, update);
        } else {
          return {
            ...previousData,
            ...update
          };
        }
      });
    },
    onSettled: async () => {
      await invalidateQueries(client, invalidateKeys);
    }
  }));
}

export function deleteMutation({
  fn,
  invalidateKeys
}: {
  fn: () => Promise<void>;
  invalidateKeys: QueryKey[];
}): CreateMutationResult<void, Error> {
  const client = useQueryClient();
  return mutation(() => ({
    mutationFn: async () => {
      return log(`deleting`, () => fn());
    },
    onSettled: async () => {
      await invalidateQueries(client, invalidateKeys);
    }
  }));
}

async function invalidateQueries(client: QueryClient, keys: QueryKey[]) {
  logger.debug(`Invalidating queries ${keys.map((key) => '[' + key + ']').join(', ')}`);
  for (const queryKey of keys) {
    await client.invalidateQueries({ queryKey });
  }
}
