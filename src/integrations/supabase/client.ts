// This is a mock Supabase client that returns empty data
// It's used as a temporary solution while migrating away from Supabase

console.warn('Using mock Supabase client - this is a temporary solution during migration');

class MockSupabaseClient {
  from(table: string) {
    return {
      select: (columns?: string) => this.buildQuery(),
      insert: (data: any) => this.buildQuery(),
      update: (data: any) => this.buildQuery(),
      delete: () => this.buildQuery(),
      upsert: (data: any) => this.buildQuery(),
      eq: (column: string, value: any) => this.buildQuery(),
      neq: (column: string, value: any) => this.buildQuery(),
      gt: (column: string, value: any) => this.buildQuery(),
      lt: (column: string, value: any) => this.buildQuery(),
      gte: (column: string, value: any) => this.buildQuery(),
      lte: (column: string, value: any) => this.buildQuery(),
      like: (column: string, value: any) => this.buildQuery(),
      ilike: (column: string, value: any) => this.buildQuery(),
      is: (column: string, value: any) => this.buildQuery(),
      in: (column: string, values: any[]) => this.buildQuery(),
      contains: (column: string, value: any) => this.buildQuery(),
      containedBy: (column: string, value: any) => this.buildQuery(),
      rangeLt: (column: string, range: any) => this.buildQuery(),
      rangeGt: (column: string, range: any) => this.buildQuery(),
      rangeGte: (column: string, range: any) => this.buildQuery(),
      rangeLte: (column: string, range: any) => this.buildQuery(),
      rangeAdjacent: (column: string, range: any) => this.buildQuery(),
      overlaps: (column: string, value: any) => this.buildQuery(),
      textSearch: (column: string, query: string, options?: { config?: string }) => this.buildQuery(),
      filter: (column: string, operator: string, value: any) => this.buildQuery(),
      match: (query: any) => this.buildQuery(),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      order: (column: string, options?: { ascending?: boolean }) => this.buildQuery(),
      limit: (count: number) => this.buildQuery(),
      range: (from: number, to: number) => this.buildQuery(),
      abortSignal: (signal: AbortSignal) => this.buildQuery(),
      count: (options?: { head?: boolean; exact?: boolean }) => Promise.resolve({ count: 0, error: null }),
    };
  }

  rpc(fn: string, params?: any) {
    return Promise.resolve({ data: null, error: null });
  }

  auth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signIn: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (callback: any) => {
      // Return an unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } }, error: null };
    },
    updateUser: () => Promise.resolve({ data: { user: null }, error: null }),
  };

  storage = {
    from: (bucket: string) => ({
      upload: (path: string, file: any) => Promise.resolve({ data: null, error: null }),
      download: (path: string) => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' }, error: null }),
      remove: (paths: string[]) => Promise.resolve({ data: null, error: null }),
      list: (prefix?: string) => Promise.resolve({ data: [], error: null }),
    }),
  };

  private buildQuery() {
    return {
      select: () => this.buildQuery(),
      insert: (data: any) => this.buildQuery(),
      update: (data: any) => this.buildQuery(),
      delete: () => this.buildQuery(),
      upsert: (data: any) => this.buildQuery(),
      eq: (column: string, value: any) => this.buildQuery(),
      neq: (column: string, value: any) => this.buildQuery(),
      gt: (column: string, value: any) => this.buildQuery(),
      lt: (column: string, value: any) => this.buildQuery(),
      gte: (column: string, value: any) => this.buildQuery(),
      lte: (column: string, value: any) => this.buildQuery(),
      like: (column: string, value: any) => this.buildQuery(),
      ilike: (column: string, value: any) => this.buildQuery(),
      is: (column: string, value: any) => this.buildQuery(),
      in: (column: string, values: any[]) => this.buildQuery(),
      contains: (column: string, value: any) => this.buildQuery(),
      containedBy: (column: string, value: any) => this.buildQuery(),
      rangeLt: (column: string, range: any) => this.buildQuery(),
      rangeGt: (column: string, range: any) => this.buildQuery(),
      rangeGte: (column: string, range: any) => this.buildQuery(),
      rangeLte: (column: string, range: any) => this.buildQuery(),
      rangeAdjacent: (column: string, range: any) => this.buildQuery(),
      overlaps: (column: string, value: any) => this.buildQuery(),
      textSearch: (column: string, query: string, options?: { config?: string }) => this.buildQuery(),
      filter: (column: string, operator: string, value: any) => this.buildQuery(),
      match: (query: any) => this.buildQuery(),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      order: (column: string, options?: { ascending?: boolean }) => this.buildQuery(),
      limit: (count: number) => this.buildQuery(),
      range: (from: number, to: number) => this.buildQuery(),
      abortSignal: (signal: AbortSignal) => this.buildQuery(),
      then: (onfulfilled: any) => Promise.resolve({ data: [], error: null }).then(onfulfilled),
    };
  }
}

export const supabase = new MockSupabaseClient();

// Add the missing refreshSession function
export const refreshSession = async () => {
  console.log('Mock refreshSession called');
  return { data: { session: null }, error: null };
}; 