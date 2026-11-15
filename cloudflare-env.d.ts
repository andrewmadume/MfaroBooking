declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SANDBOX_WEBHOOK_SECRET?: string;
    SUPABASE_GATEWAY_URL?: string;
    SUPABASE_GATEWAY_ANON_KEY?: string;
    MFARO_DATABASE_KEY?: string;
  }
}
