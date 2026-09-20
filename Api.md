# PayOnce API

## 1. Purpose

This document defines the backend API required to move the PayOnce VTU mobile prototype from local demo state to a production-ready Nigerian bill-payment application.

The mobile app should never call VTU providers, banks, card processors, or utility providers directly. It should call the PayOnce API. The API owns authentication, wallet accounting, transaction state, provider selection, verification, retries, webhooks, and audit logs.

Recommended base URL:

```text
/api/v1
```

The existing Express service should expose these routes from `artifacts/api-server`.

## 2. Core principles

1. **Wallet balances are server-authoritative.** The client may display a cached balance, but it must never calculate or mutate the real balance.
2. **Every money movement is a ledger entry.** Wallet funding, purchases, refunds, fees, commissions, and reversals must be traceable.
3. **Every write request is idempotent.** Payment and funding requests require an `Idempotency-Key`.
4. **Providers are hidden behind adapters.** The API should expose PayOnce concepts, not provider-specific request formats.
5. **Transactions are asynchronous.** A successful API response means the request was accepted, not necessarily that the external service has completed.
6. **Webhooks are verified and replay-safe.** Provider callbacks must be authenticated, stored, and processed idempotently.
7. **The app uses one consistent error format.** Validation and provider failures should be safe to show to users.
8. **No secrets belong in the mobile app.** Provider credentials, signing keys, and payment credentials remain server-side.

## 3. User-facing features and required API support

| Mobile feature | Backend responsibility |
| --- | --- |
| Onboarding | Return app configuration and supported services |
| Login and registration | Create sessions, verify phone/email, enforce rate limits |
| Wallet balance | Return available, pending, and ledger balances |
| Fund wallet | Create funding intents, confirm card/bank events, credit wallet after verified settlement |
| Airtime | Validate network/phone, quote, submit purchase, receive provider status |
| Data | List plans, quote, submit purchase, receive provider status |
| Electricity | List providers, verify meter, quote, vend token, return token when available |
| Cable TV | List providers/packages, verify smartcard, quote, renew subscription |
| Education | List exam services, validate candidate/profile, issue PIN or token |
| Transactions | Paginated history, filters, detail, receipt |
| Notifications | Read/unread list and read state |
| Profile | Read/update user information |
| Referral | Referral code, invite tracking, reward ledger |
| Security | Password/PIN changes, biometric preference, sessions/login activity |
| Support | FAQs, support tickets, transaction reports |

## 4. Authentication and sessions

Use a managed identity provider such as Clerk for user identity and session management. The PayOnce API validates the provider-issued bearer token on every protected route.

```http
Authorization: Bearer <access-token>
```

The mobile app should not implement password hashing, JWT signing, refresh-token storage, or local account authentication.

### Public routes

- `GET /api/v1/config`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/verify`
- `POST /api/v1/auth/login` only if the selected identity provider requires an API login endpoint

### Protected routes

All routes below require a valid bearer token unless stated otherwise.

### Authentication requirements

- Rate-limit login, registration, OTP, password reset, PIN, meter verification, and card-funding requests.
- Never log passwords, OTPs, transaction PINs, card numbers, CVVs, provider tokens, or bearer tokens.
- Store only provider user IDs and the minimum profile data required by PayOnce.
- Require step-up authentication for changing transaction PIN, changing a password, and high-risk wallet actions.

## 5. Standard response formats

### Success

Single resource:

```json
{
  "data": {
    "id": "tx_01J...",
    "status": "pending"
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

Collection:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "hasNextPage": false
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

### Error

```json
{
  "error": {
    "code": "INVALID_PHONE_NUMBER",
    "message": "Enter a valid Nigerian phone number.",
    "field": "phoneNumber",
    "details": {}
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

Recommended error codes:

```text
AUTH_REQUIRED
AUTH_INVALID
VALIDATION_ERROR
RATE_LIMITED
INSUFFICIENT_FUNDS
INVALID_PHONE_NUMBER
INVALID_METER_NUMBER
INVALID_SMARTCARD_NUMBER
CUSTOMER_NOT_FOUND
PROVIDER_UNAVAILABLE
DUPLICATE_REQUEST
TRANSACTION_NOT_FOUND
TRANSACTION_NOT_RETRYABLE
PAYMENT_NOT_CONFIRMED
INTERNAL_ERROR
```

## 6. API resources

### User

```ts
type User = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  avatarUrl?: string;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
};
```

### Wallet

```ts
type Wallet = {
  id: string;
  currency: "NGN";
  availableBalance: number;
  pendingBalance: number;
  ledgerBalance: number;
  updatedAt: string;
};
```

Amounts should be represented as integer kobo in database and API internals. If the mobile API returns naira values for display, the unit must be explicit:

```json
{
  "amount": 35000,
  "currency": "NGN",
  "unit": "kobo",
  "displayAmount": "₦350.00"
}
```

### Transaction

```ts
type TransactionStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "reversed";

type Transaction = {
  id: string;
  reference: string;
  type: "airtime" | "data" | "electricity" | "tv" | "education" | "wallet_funding";
  provider: string;
  status: TransactionStatus;
  amount: number;
  fee: number;
  total: number;
  currency: "NGN";
  recipient?: string;
  providerReference?: string;
  failureCode?: string;
  failureMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};
```

## 7. Endpoint catalog

### 7.1 App configuration

#### `GET /api/v1/config`

Returns feature flags, supported service types, minimum/maximum purchase values, and maintenance state.

Response:

```json
{
  "data": {
    "currency": "NGN",
    "maintenanceMode": false,
    "services": ["airtime", "data", "electricity", "tv", "education"],
    "features": {
      "cardFunding": true,
      "bankTransferFunding": true,
      "referrals": true
    }
  }
}
```

### 7.2 Profile

- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/me/security`
- `PATCH /api/v1/me/security`
- `GET /api/v1/me/sessions`
- `DELETE /api/v1/me/sessions/:sessionId`

`PATCH /api/v1/me` accepts only editable profile fields:

```json
{
  "firstName": "Abdulazeez",
  "lastName": "Sodiq",
  "email": "sodiq@example.com"
}
```

### 7.3 Wallet

- `GET /api/v1/wallet`
- `GET /api/v1/wallet/ledger`
- `GET /api/v1/wallet/ledger/:entryId`

Ledger filters:

```text
GET /api/v1/wallet/ledger?page=1&pageSize=20&type=debit&from=2026-09-01&to=2026-09-30
```

The ledger is append-only. Corrections are represented by reversal or adjustment entries instead of editing an old entry.

### 7.4 Wallet funding

#### `POST /api/v1/wallet/funding-intents`

Creates a funding intent for card or bank transfer funding.

Request:

```json
{
  "amount": 1000000,
  "currency": "NGN",
  "method": "card",
  "unit": "kobo"
}
```

Response:

```json
{
  "data": {
    "fundingIntentId": "fund_01J...",
    "reference": "PF-20260920-ABC123",
    "amount": 1000000,
    "currency": "NGN",
    "status": "requires_action",
    "checkoutUrl": "https://payment-provider.example/checkout/..."
  }
}
```

For bank transfer funding, return a dedicated virtual account:

```json
{
  "data": {
    "fundingIntentId": "fund_01J...",
    "status": "awaiting_transfer",
    "account": {
      "bankName": "Wema Bank",
      "accountNumber": "0123456789",
      "accountName": "PayOnce / Abdulazeez Sodiq",
      "expiresAt": "2026-09-20T23:59:59Z"
    }
  }
}
```

#### `GET /api/v1/wallet/funding/:fundingIntentId`

Returns the current funding status.

#### `POST /api/v1/wallet/funding/:fundingIntentId/cancel`

Cancels an unpaid funding intent where supported.

Never credit the wallet based only on a client redirect. Credit only after a verified provider webhook or a server-side provider confirmation.

### 7.5 Beneficiaries

- `GET /api/v1/beneficiaries`
- `POST /api/v1/beneficiaries`
- `PATCH /api/v1/beneficiaries/:beneficiaryId`
- `DELETE /api/v1/beneficiaries/:beneficiaryId`

Request:

```json
{
  "name": "Mum",
  "phoneNumber": "08057782264",
  "network": "glo"
}
```

Beneficiary data is convenience data. It must not be trusted as proof of recipient ownership or used to skip verification.

### 7.6 Networks, plans, and providers

- `GET /api/v1/catalog/networks`
- `GET /api/v1/catalog/data-plans?network=mtn`
- `GET /api/v1/catalog/electricity-providers`
- `GET /api/v1/catalog/tv-providers`
- `GET /api/v1/catalog/tv-providers/:providerId/packages`
- `GET /api/v1/catalog/education-services`

Catalog data should be cached server-side for a short period and refreshed from provider adapters on a schedule. The app should not hardcode plans or prices in production.

### 7.7 Airtime

#### `POST /api/v1/airtime/quotes`

Request:

```json
{
  "network": "mtn",
  "phoneNumber": "08034567890",
  "amount": 100000,
  "unit": "kobo"
}
```

Response:

```json
{
  "data": {
    "quoteId": "quote_01J...",
    "service": "airtime",
    "amount": 100000,
    "fee": 0,
    "total": 100000,
    "expiresAt": "2026-09-20T10:05:00Z"
  }
}
```

#### `POST /api/v1/airtime/purchases`

Request:

```json
{
  "quoteId": "quote_01J...",
  "phoneNumber": "08034567890",
  "network": "mtn",
  "amount": 100000,
  "unit": "kobo",
  "saveBeneficiary": true
}
```

Headers:

```http
Idempotency-Key: 5f0d8b6c-...
```

Response: `201 Created` with a `Transaction` in `pending` or `processing` state.

### 7.8 Data

- `POST /api/v1/data/quotes`
- `POST /api/v1/data/purchases`

Quote request:

```json
{
  "network": "mtn",
  "planCode": "mtn-1gb-7d",
  "phoneNumber": "08034567890"
}
```

The API should return a `planCode` from the catalog rather than requiring the mobile app to submit a plan name and price as trusted values.

Purchase request:

```json
{
  "quoteId": "quote_01J...",
  "network": "mtn",
  "planCode": "mtn-1gb-7d",
  "phoneNumber": "08034567890"
}
```

### 7.9 Electricity

#### `POST /api/v1/electricity/meters/verify`

Request:

```json
{
  "provider": "aedc",
  "meterNumber": "12345678901",
  "meterType": "prepaid"
}
```

Response:

```json
{
  "data": {
    "verificationId": "meter_01J...",
    "valid": true,
    "customer": {
      "name": "Abdulazeez Sodiq",
      "address": "Demo Address",
      "meterNumber": "12345678901",
      "meterType": "prepaid"
    }
  }
}
```

#### `POST /api/v1/electricity/quotes`

Requires a valid `verificationId`.

#### `POST /api/v1/electricity/payments`

Request:

```json
{
  "verificationId": "meter_01J...",
  "provider": "aedc",
  "meterNumber": "12345678901",
  "amount": 500000,
  "unit": "kobo"
}
```

The response returns a transaction. When the provider returns a token, expose it only on the transaction detail or a secure result payload.

### 7.10 Cable TV

#### `POST /api/v1/tv/customers/verify`

Request:

```json
{
  "provider": "gotv",
  "smartcardNumber": "4612345678"
}
```

Response includes customer name, current package, due date, and available package codes.

- `POST /api/v1/tv/quotes`
- `POST /api/v1/tv/subscriptions`

Subscription request:

```json
{
  "verificationId": "tv_01J...",
  "provider": "gotv",
  "smartcardNumber": "4612345678",
  "packageCode": "gotv-max"
}
```

### 7.11 Education

- `GET /api/v1/education/services`
- `POST /api/v1/education/quotes`
- `POST /api/v1/education/purchases`

Request:

```json
{
  "service": "jamb",
  "profileCode": "1234567890",
  "quantity": 1
}
```

The API should return issued PINs or tokens only after a successful provider response and should provide a secure receipt endpoint for later access.

### 7.12 Transactions

- `GET /api/v1/transactions`
- `GET /api/v1/transactions/:transactionId`
- `GET /api/v1/transactions/:transactionId/receipt`
- `POST /api/v1/transactions/:transactionId/retry`
- `POST /api/v1/transactions/:transactionId/report`

Filters:

```text
GET /api/v1/transactions?page=1&pageSize=20&status=successful&type=data
```

Retry rules:

- Only failed transactions that are known to be safe to retry may be retried.
- A retry creates a new transaction linked with `retryOfTransactionId`.
- Never submit the same provider purchase twice because a client timed out.

Report request:

```json
{
  "category": "service_not_received",
  "message": "The data bundle has not arrived."
}
```

### 7.13 Notifications

- `GET /api/v1/notifications`
- `POST /api/v1/notifications/:notificationId/read`
- `POST /api/v1/notifications/read-all`

Notification records should be created for completed purchases, wallet funding, failed transactions, upcoming TV renewals, promotions, and support updates.

Push notifications can be added later. The in-app notification API should remain the source of truth.

### 7.14 Referrals

- `GET /api/v1/referrals`
- `POST /api/v1/referrals/validate`
- `GET /api/v1/referrals/earnings`

Validate request:

```json
{
  "code": "SODIQ123"
}
```

Referral rewards should be posted to a separate ledger entry only after the referred user completes the qualifying action.

### 7.15 Support

- `GET /api/v1/support/faqs`
- `GET /api/v1/support/tickets`
- `POST /api/v1/support/tickets`
- `GET /api/v1/support/tickets/:ticketId`
- `POST /api/v1/support/tickets/:ticketId/messages`

Ticket request:

```json
{
  "subject": "Airtime not received",
  "category": "airtime",
  "transactionId": "tx_01J...",
  "message": "The purchase shows successful but airtime has not arrived."
}
```

### 7.16 Transaction PIN

Every wallet debit and other high-risk money movement should require transaction-PIN verification:

- Airtime purchases
- Data purchases
- Electricity payments
- Cable TV subscriptions
- Education PIN purchases
- Wallet funding where the selected funding method requires confirmation

The production API must not accept or store a raw transaction PIN in the mobile app. Use one of these patterns:

1. The client sends the PIN through a TLS-protected authenticated request and the server verifies a securely hashed PIN.
2. The client requests a short-lived step-up challenge and sends a one-time `pinVerificationToken` with the purchase request.
3. The payment provider handles step-up authentication for card funding while PayOnce still verifies its own transaction PIN for wallet debits.

Recommended endpoints:

- `POST /api/v1/me/transaction-pin`
- `POST /api/v1/me/transaction-pin/verify`
- `POST /api/v1/me/transaction-pin/change`
- `POST /api/v1/me/transaction-pin/reset`

Example verification response:

```json
{
  "data": {
    "pinVerificationToken": "pinv_01J...",
    "expiresAt": "2026-09-20T10:05:00Z",
    "uses": 1
  }
}
```

Purchase requests should reference the short-lived verification result rather than sending a reusable PIN:

```json
{
  "quoteId": "quote_01J...",
  "phoneNumber": "08034567890",
  "network": "mtn",
  "pinVerificationToken": "pinv_01J..."
}
```

Server requirements:

- Store only a strong one-way hash of the PIN.
- Never log the PIN or return it in an API response.
- Limit failed attempts and temporarily lock the PIN after repeated failures.
- Expire verification tokens quickly and mark them as single-use.
- Require re-authentication before PIN reset.
- Record PIN changes, lockouts, and high-risk purchase attempts in `audit_events`.

Prototype behavior:

- The current Expo prototype shows a reusable PIN modal before service purchases and wallet funding.
- The prototype accepts `1234` only to make the flow testable.
- This value must be removed before connecting the app to a real backend.

### 7.17 App updates

Use Expo Updates for over-the-air JavaScript and asset updates, with the mobile app checking for an available update on launch.

Recommended behavior:

- Show a dismissible update modal for normal feature and bug-fix releases.
- Download the update only after the user chooses **Install update**.
- Reload the app after the new bundle has downloaded.
- Allow **Later** for non-critical releases.
- Use a mandatory update only when the current app cannot safely work with the API or when a security fix is required.
- Keep native changes, SDK upgrades, permissions, and app-store metadata in a store release; OTA updates cannot replace native binaries.

For a production rollout, return update policy from `GET /api/v1/config`:

```json
{
  "data": {
    "appUpdate": {
      "minimumSupportedVersion": "1.0.0",
      "latestVersion": "1.1.0",
      "forceUpdate": false,
      "storeUrl": "https://example.com/payonce"
    }
  }
}
```

The Expo client should use the API policy for minimum-version enforcement and Expo Updates for the actual bundle download. Do not force users into an OTA update loop when the installed binary is too old; send them to the appropriate app store release instead.

## 8. Transaction lifecycle

All bill-payment services should use the same state machine:

```text
created
  -> validating
  -> reserved
  -> processing
  -> successful
  -> failed
  -> reversed
```

Typical behavior:

1. Validate the authenticated user, request body, quote, recipient, and idempotency key.
2. Confirm the quote is not expired and the amount matches the server-side quote.
3. Atomically reserve the wallet amount.
4. Create the PayOnce transaction and debit ledger entry.
5. Submit the request through the appropriate provider adapter.
6. Update the transaction with the provider reference.
7. Process the synchronous provider response or wait for a webhook.
8. Mark successful, failed, or reversed.
9. Release or reverse the wallet reservation when necessary.
10. Create an in-app notification and audit event.

The mobile app should show:

- `processing`: “We’re processing your transaction.”
- `successful`: receipt and completed status
- `failed`: safe failure message and retry/report actions
- `pending`: status polling or refresh action

## 9. Provider adapter design

Do not place provider SDK calls inside route handlers. Use interfaces such as:

```ts
interface AirtimeProvider {
  purchase(input: {
    network: string;
    phoneNumber: string;
    amountKobo: number;
    clientReference: string;
  }): Promise<ProviderPurchaseResult>;
}

interface ElectricityProvider {
  verifyMeter(input: {
    provider: string;
    meterNumber: string;
    meterType: string;
  }): Promise<MeterVerificationResult>;

  vend(input: {
    provider: string;
    meterNumber: string;
    amountKobo: number;
    clientReference: string;
  }): Promise<ProviderPurchaseResult>;
}
```

Every adapter must:

- Normalize provider errors into PayOnce error codes.
- Accept a PayOnce client reference.
- Return a provider reference when available.
- Support status lookup where the provider allows it.
- Never log secrets or full payment credentials.
- Be replaceable without changing mobile API contracts.

## 10. Webhooks

Provider webhooks should be exposed under:

```text
POST /api/v1/webhooks/:provider
```

Webhook processing requirements:

- Verify the provider signature using a server-side secret.
- Store the raw event metadata with redacted sensitive values.
- Reject duplicate event IDs safely.
- Return `2xx` only after the event is durably accepted.
- Process the event asynchronously when provider response time is strict.
- Link the event to a funding intent or transaction using provider reference and client reference.
- Never trust a user ID supplied in a webhook body without matching an internal record.

## 11. Database model

Recommended tables:

- `users`
- `user_profiles`
- `wallets`
- `wallet_ledger_entries`
- `transactions`
- `transaction_attempts`
- `idempotency_keys`
- `provider_webhook_events`
- `beneficiaries`
- `catalog_networks`
- `catalog_data_plans`
- `catalog_bill_providers`
- `catalog_bill_products`
- `funding_intents`
- `notifications`
- `referral_codes`
- `referral_events`
- `support_tickets`
- `support_messages`
- `audit_events`

Important constraints:

- Unique: `(user_id, idempotency_key, operation)`
- Unique: `(provider, provider_reference)` when provider reference exists
- Unique: `wallets.user_id`
- Ledger entries are immutable
- Transaction status transitions are validated server-side
- Monetary values use integer kobo, never floating-point naira

## 12. Security requirements

- HTTPS only outside local development.
- Validate every request with Zod.
- Authorize every resource by authenticated user ID.
- Rate-limit sensitive endpoints.
- Add request IDs to every request and log line.
- Use structured logs with redaction.
- Encrypt provider credentials and webhook secrets.
- Do not store raw card numbers or CVVs.
- Use the payment processor’s hosted checkout or tokenization.
- Require transaction PIN or step-up authentication for configurable high-risk actions.
- Add audit events for login, funding, purchase, PIN changes, profile changes, and support access.
- Return generic messages for provider failures; keep raw provider details internal.

## 13. Mobile integration sequence

The Expo app should be migrated in this order:

1. Add the generated API client package and shared request configuration.
2. Replace local `balance` reads with `GET /wallet`.
3. Replace local transaction history with `GET /transactions`.
4. Add catalog queries for networks, plans, providers, and packages.
5. Replace purchase simulation with quote then purchase mutations.
6. Add transaction polling or refresh for pending states.
7. Replace demo wallet funding with funding intents and webhook-backed status.
8. Replace local notifications with the notifications API.
9. Add authenticated profile, referral, security, and support queries.
10. Keep local UI state only for form fields, modals, loading states, and optimistic presentation.

Recommended client behavior:

- Cache catalog data with React Query.
- Invalidate wallet and transaction queries after a successful mutation.
- Persist only non-sensitive UI preferences locally.
- Never persist access tokens in plain AsyncStorage.
- Show server validation errors inline.
- Disable duplicate submits while a mutation is pending.
- Send an `Idempotency-Key` for every purchase and funding mutation.

## 14. Development phases

### Phase 1: API foundation

- Add Clerk authentication middleware.
- Add database schema and migrations.
- Add `/config`, `/me`, `/wallet`, and `/transactions`.
- Add consistent validation and error middleware.
- Add request IDs and structured logging.

### Phase 2: Demo provider adapters

- Build provider interfaces with deterministic sandbox adapters.
- Implement quote and purchase lifecycle without real money.
- Implement idempotency and transaction polling.
- Add integration-level fixtures for success, pending, failure, timeout, and duplicate requests.

### Phase 3: Funding

- Add a payment processor connector.
- Add card funding intents.
- Add virtual-account bank transfer funding.
- Add signed webhooks and reconciliation jobs.

### Phase 4: Live VTU services

- Add airtime and data provider adapter.
- Add electricity verification and vending.
- Add TV verification and subscription.
- Add education PIN fulfillment.
- Add provider health checks, fallback routing, and reconciliation.

### Phase 5: Operations and support

- Add audit views and provider monitoring.
- Add support ticket workflows.
- Add automated settlement and reversal handling.
- Add notifications and referral reward settlement.

## 15. What should not be implemented

- Do not call VTU providers directly from Expo.
- Do not trust amount, fee, price, or wallet balance values from the mobile client.
- Do not mark a transaction successful from a client-side redirect.
- Do not use floating-point arithmetic for money.
- Do not make duplicate provider requests after a timeout without checking status.
- Do not store card PAN, CVV, passwords, OTPs, or transaction PINs in app storage or logs.
- Do not expose provider credentials through environment variables bundled into the mobile app.
