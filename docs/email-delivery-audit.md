# Email delivery audit

The ADRAR owner created a new Resend key named `adrar-vercel-mail` with sending-only permission. The key was stored as the production-only `RESEND_API_KEY` secret in Vercel and a production redeploy was started. The secret value is intentionally absent from this document, source control, tests, and user-facing output.

Before transactional email is enabled, the deployment and authenticated provider request must be verified without sending a message to a user. The configured sender domain must also be validated in Resend before production account emails are released.
