# Vercel deployment

The `mfarobooking` project uses native Next.js (`next build --webpack`), not the Cloudflare/Vinext build used by the existing Sites deployment.

Server-only variables: `SUPABASE_GATEWAY_URL`, `SUPABASE_GATEWAY_ANON_KEY`, `MFARO_DATABASE_KEY`. Set `NEXT_PUBLIC_VERCEL_AUTH=true` for the branded Supabase email/password authentication form. None of the database credentials belong in browser code.

The Vercel build replaces `cloudflare:workers` with the server environment adapter in `lib/vercel-runtime.ts`. All booking data still uses the existing private, allowlisted Supabase database gateway and transaction checks.

Vercel does not supply Sites' ChatGPT identity headers. Therefore the API validates an HttpOnly, Secure, SameSite=Lax Supabase access-token cookie against Supabase's user endpoint before using its user ID. Caller-supplied Sites identity headers are ignored on Vercel. Sessions expire after one hour; sign in again afterward. Email/password signup and email confirmation are governed by the connected Supabase project's Auth settings.

Supabase account IDs differ from ChatGPT/Sites account IDs. Existing workspaces under the Sites identity remain available through the original online app; they are not automatically reassigned to a new Supabase account. Newly registered Vercel accounts receive their own isolated demo workspaces. Data ownership must be explicitly mapped before moving an existing real business between identities.

Email confirmation links use the Supabase project's URL configuration. After confirming an email, return to the Vercel sign-in page if the confirmation redirect is not yet configured for the Vercel domain.
