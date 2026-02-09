# Production Configuration Checklist


---

## AWS Secrets Manager (`QuickLedger` secret)

- [ x] `aws.spring.datasource.url` - Production MySQL JDBC URL
- [x ] `aws.spring.datasource.username` - Database username
- [ x] `aws.spring.datasource.password` - Database password
- [x ] `aws.stripe.api.key` - Stripe Live Secret Key (`sk_live_...`)
- [ x] `aws.stripe.webhook.secret` - Stripe webhook signing secret (`whsec_...`)
- [ ] `aws.stripe.client.id` - Stripe Connect Client ID (`ca_...`)

---

## Stripe Production Environment

- [x ] Generate Live API keys from Stripe Dashboard → Developers → API keys
- [x ] Create production webhook endpoint: `https://api.ottero.com.au/api/stripe/webhook`
- [x ] Enable webhook events:
  - [x ] `checkout.session.completed`
  - [x ] `customer.subscription.created`
  - [x ] `customer.subscription.updated`
  - [x ] `customer.subscription.deleted`
  - [x ] `invoice.payment_succeeded`
  - [x ] `invoice.payment_failed`
  - [x ] `account.updated`
- [ x] Create production Products and Prices (get `price_live_...` IDs)
- [ ] Configure Stripe Connect OAuth redirect URI: `https://dashboard.ottero.com.au/settings/payments`
- [ ] Test payment flow in live mode with small amount

---

## Auth0 Production Tenant (`ottero.au.auth0.com`)

### Application Settings
- [x] Allowed Callback URLs: `https://ottero.com.au/callback`
- [x] Allowed Logout URLs: `https://ottero.com.au`
- [x] Allowed Web Origins: `https://ottero.com.au`
- [x] Allowed Origins (CORS): `https://ottero.com.au`

### API Configuration
- [ ] Verify API Identifier is correct
- [ ] Configure token expiration as needed

### Social Connections
- [ ] Configure Google OAuth with production credentials
- [ ] Configure Apple OAuth with production credentials (if used)
- [ ] Configure any other social providers with production credentials

### Actions/Webhooks
- [x] Set up Auth0 Action webhook secret
- [x] Add `AUTH0_WEBHOOK_SECRET` to AWS Secrets Manager

---

## Kubernetes ConfigMaps

### Frontend Config (`09-frontend-config-prod.yaml`)
- [x ] Set `AUTH0_DOMAIN` to `ottero.au.auth0.com`
- [x ] Set `AUTH0_CLIENT_ID` to production SPA Client ID
- [x ] Set `AUTH0_AUDIENCE` to production API identifier
- [x ] Set `STRIPE_PRICE_BASIC` to production price ID (`price_live_...`)

---

## Kubernetes Secrets (`02-secrets.yaml`)

- [x ] `mysql-root-password` - Set strong MySQL root password
- [x ] `ottero-db-password` - Set strong application DB password
- [x ] `ghcr-login` - Configure GitHub Container Registry credentials

---

## Backend Deployment (`05-backend.yaml`)

- [x ] Set `SPRING_PROFILES_ACTIVE` to `prod`
- [ ] Update container image to production tag
- [ ] Verify environment variables reference correct secrets/configmaps

---

## Application Properties Review

- [x] Verify `application.frontend.url` is `https://ottero.com.au`
- [x] Verify `auth0.domain` default is correct
- [x] Keeping `spring.jpa.hibernate.ddl-auto` as `update`
- [x] Ensure `spring.jpa.show-sql` is `false` in production

---

## Infrastructure & DNS

- [x] DNS: Using `ottero.com.au` (path-based routing, no subdomains needed)
- [x] Set up SSL/TLS certificates (Let's Encrypt / cert-manager)
- [x] Verify Ingress configuration (`07-ingress.yaml`)
- [x] Verify cluster-issuer for certificates (`08-cluster-issuer.yaml`)

---

## Database

- [x ] Set up production MySQL instance (or verify existing)
- [x ] Create production database schema
- [ ] Configure database backups
- [ ] Test database connectivity from K8s cluster

---

## Final Verification

- [ ] Deploy backend with `prod` profile
- [ ] Deploy frontend with production config
- [ ] Test user registration flow
- [ ] Test login flow (email + social)
- [ ] Test Stripe subscription flow
- [ ] Test Stripe Connect onboarding
- [ ] Verify webhook processing
- [ ] Monitor logs for errors

---

**Last Updated:** 2026-02-03
