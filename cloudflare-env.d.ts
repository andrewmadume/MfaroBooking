declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    SANDBOX_WEBHOOK_SECRET?: string;
  }
}
