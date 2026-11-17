// src/infra/supabase/client.ts
import { env } from '../../shared/config/env';

export interface SupabaseQueryResult {
  data: any;
  error: any;
}

export interface SupabaseQueryBuilder extends PromiseLike<SupabaseQueryResult> {
  select: (columns?: string) => SupabaseQueryBuilder;
  insert: (values: any) => SupabaseQueryBuilder;
  update: (values: any) => SupabaseQueryBuilder;
  eq: (column: string, value: any) => SupabaseQueryBuilder;
  single: () => Promise<SupabaseQueryResult>;
}

export interface SupabaseClientMock {
  from: (table: string) => SupabaseQueryBuilder;
}

export const createSupabaseClient = (): SupabaseClientMock => {
  const createBuilder = (): SupabaseQueryBuilder => {
    const builder: any = {
      select: () => builder,
      insert: () => builder,
      update: () => builder,
      eq: () => builder,
      single: async () => ({
        data: null,
        error: new Error("Supabase client placeholder - Configure SUPABASE_URL and SUPABASE_ANON_KEY for production"),
      }),
      then: (onfulfilled?: (value: SupabaseQueryResult) => any, onrejected?: (reason: any) => any) => {
        return Promise.resolve({
          data: null,
          error: null,
        }).then(onfulfilled, onrejected);
      },
    };
    return builder;
  };

  return {
    from: (_table: string) => createBuilder(),
  };
};

export const supabase = createSupabaseClient();
