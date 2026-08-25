# Vercel WAF audit

- Project: `azilal-tourism` on the Hobby plan.
- The production deployment is healthy and the public website must remain accessible.
- Vercel exposes a Firewall area in the project dashboard, but the active MCP integration does not expose a mutation for firewall rules.
- The official Vercel CLI supports global `rate_limit` firewall rules, including a request path condition, an IP key, and a chosen window/action.
- The first production rule is published and enabled: requests whose path starts with `/api/trpc/auth` are limited by IP to 30 requests per 600 seconds, returning HTTP 429 when exceeded. Public tourism pages and other API paths are not included.
