import { createClient } from '@supabase/supabase-js';

// Provide a graceful no-op stub during build or local runs without envs
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Minimal chainable stub that resolves to empty results for selects
type QueryResult<T = any> = { data: T; error: null };
const makeBuilder = <T = any>(data: T) => {
  const builder: any = {
    select: () => builder,
    order: () => builder,
    eq: () => builder,
    single: async (): Promise<QueryResult<T | null>> => ({ data: null as any, error: null }),
    then: (resolve: (result: QueryResult<T>) => void) => {
      resolve({ data, error: null });
    },
  };
  return builder;
};

export const supabase = url && anon
  ? createClient(url, anon)
  : { from: (_table: string) => makeBuilder<any[]>([]) } as const; 