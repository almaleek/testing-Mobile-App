# PayOnce VTU

PayOnce is a polished Nigerian VTU mobile prototype for airtime, data, utility payments, wallet funding, and transaction management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/payonce-vtu/app/` — Expo Router screens for onboarding, auth, tabs, service flows, wallet funding, notifications, profile, and support
- `artifacts/payonce-vtu/src/components/UI.tsx` — shared mobile primitives and transaction presentation
- `artifacts/payonce-vtu/src/context/AppContext.tsx` — local demo wallet, transaction, and notification state
- `artifacts/payonce-vtu/src/data.ts` — centralized Nigerian demo data and service metadata
- `artifacts/payonce-vtu/constants/colors.ts` — PayOnce color tokens

## Architecture decisions

- The first build is frontend-only and uses local state with AsyncStorage; no real VTU, payment, or backend integrations are connected.
- Service purchases share one typed flow so airtime, data, electricity, cable TV, and education remain easy to replace with API calls later.
- The wallet and transaction history are shared through React context so successful demo purchases immediately update the dashboard and activity screens.

## Product

The app supports onboarding, demo login/register with OTP, a wallet dashboard, quick services, reusable purchase confirmation and result states, wallet funding, transaction filtering and receipts, notifications, profile/security controls, referrals, and support tickets.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
