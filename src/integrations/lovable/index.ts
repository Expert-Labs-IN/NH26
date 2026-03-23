// This file has been deprecated. Lovable integration is no longer used.
// Authentication is now handled exclusively through Supabase.

export const lovable = {
  auth: {
    signInWithOAuth: async () => {
      throw new Error(
        "Lovable auth is deprecated. Use Supabase authentication instead.",
      );
    },
  },
};
