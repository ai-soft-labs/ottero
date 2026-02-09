# Stripe Connect - Invoice Payments

## Overview

Ottero uses **Stripe Connect** to allow businesses (invoice issuers) to receive payments directly from their customers.

## Funds Flow

```
Customer pays $100 invoice
        ↓
    [Stripe]
        ↓
    Automatic split:
        ├── $99 → Invoice Issuer (connected account)
        └── $1  → Ottero (platform fee)
```

**Key Points:**
- Ottero never holds customer funds
- Stripe transfers directly to the invoice issuer
- Ottero receives only the platform fee ($1)

## How It Works

1. **Business connects Stripe** via OAuth (`/api/stripe/connect`)
2. **Customer clicks "Pay Invoice"** → redirected to Stripe Checkout
3. **Stripe processes payment** and automatically:
   - Sends funds to the business's Stripe account
   - Collects platform fee for Ottero
4. **Invoice marked as PAID** via webhook

## Technical Implementation

**Pattern:** Destination Charges with `transfer_data.destination`

```java
SessionCreateParams.PaymentIntentData.builder()
    .setTransferData(
        TransferData.builder()
            .setDestination(company.getStripeConnectedAccountId())
            .build())
    .setApplicationFeeAmount(100L)  // $1.00 platform fee
    .build()
```

## Stripe Connect Settings

| Setting | Value |
|---------|-------|
| Account Type | Standard (OAuth) |
| Funds Flow | Sellers collect directly |
| Onboarding | Hosted by Stripe |
| Account Management | Redirect to Stripe Dashboard |

## Related Files

- `StripeService.java` - Payment session creation
- `StripeConnectController.java` - OAuth flow
- `WebhookController.java` - Webhook handling
