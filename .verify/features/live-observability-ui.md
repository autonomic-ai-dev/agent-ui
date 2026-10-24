# live-observability-ui

Summary: agent-ui is a SvelteKit front end that shows the Autonomic ecosystem live: agent-heart vitals, agent-spine DAG progress, agent-muscle sandbox logs, and the context agent-brain injects. It is the browser counterpart to agent-tui.

## Sub-features

- `ui-shell`: The app layout, global styles, and entry page.
  - Intent: One consistent frame for every panel.
  - Behaviour: `src/routes/+layout.svelte` and `src/routes/+page.svelte`, styled by `src/app.css`, with the HTML shell in `src/app.html`.
  - Outcome: The page renders. Not verified in this pass.
- `shared-components`: Brand and helper code shared by the routes.
  - Behaviour: `src/lib/index.ts` and `src/lib/assets/favicon.svg`.
  - Outcome: Shared exports resolve for the routes. Not verified in this pass.
- `live-feed-relay`: `server.js` bridges NATS to WebSocket on port 8080.
  - Intent: Give the browser the live event stream from the bus.
  - Behaviour: `server.js` connects to `AUTONOMIC_NATS_URL` (default `nats://127.0.0.1:4222`) and forwards events to WebSocket clients. When NATS is unreachable, it logs `Running in mock mode` and sends simulated `events.*` messages instead.
  - Outcome: Clients see real events when NATS is up, and simulated ones when it is not. The simulated path is the reason the `fix/relay-loopback-no-fake-events-v2` branch exists.

## Code

- `src/`
- `server.js`
- `package.json`
- `tsconfig.json`
- `vite.config.ts`

## How to get to it (user POV)

- `bun install`, then `bun run dev` and open the local URL.
- `autonomic ui` starts the relay and opens the hosted UI, once the relay branch is in use.

## Verification Suites (Targeted Test Commands)

- No test file exists on master for this feature.

## Gotchas

- Without NATS, `server.js` sends simulated events, so a panel can look live when no real traffic exists. Check the NATS connection before reading the panels as data.
- `relay.js` and `relay.test.js` are not on master. They exist only on `fix/relay-loopback-no-fake-events-v2`.
