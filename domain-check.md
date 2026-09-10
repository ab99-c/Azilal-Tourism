
## Vercel domain replacement status

Vercel project: `azilal-tourism`.

Added `adrartoursime.tours` to Production successfully. Vercel also created `www.adrartoursime.tours` with a 308 redirect from the apex. Both are currently **Invalid Configuration** because DNS at the registrar is not yet updated.

Required DNS shown by Vercel:
- Apex: Type `A`, Name/Host `@`, Value `216.198.79.1`
- WWW: Type `CNAME`, Name/Host `www`, Value `0526240c200ef6ef.vercel-dns-017.com`

The old `www.adrar-tourism.ma` mapping and its redirect were removed from the Vercel project after explicit user confirmation. No DNS records were changed at Spaceship because registrar access was not available in the current browser session.
