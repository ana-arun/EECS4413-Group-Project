Admin configuration
-------------------

This project supports promoting a user to admin automatically when they log in using the configured admin email.

- Environment variable: `ADMIN_EMAIL`
  - Default: `campustech@my.yorku.ca` (fallback)
  - To change the admin email, set `ADMIN_EMAIL` in your environment before starting the backend server. Example:

```bash
export ADMIN_EMAIL="owner@yourdomain.com"
node server.js
```

Billing storage
---------------
- The app only stores billing metadata (card brand, last 4 digits, expiry month/year). It does NOT store full card numbers or CVV. This is intentional for demo purposes. For production payment processing, integrate a PCI-compliant provider (Stripe, Braintree, etc.) and do not store full card details on your servers.
