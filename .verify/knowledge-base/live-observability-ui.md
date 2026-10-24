# Live observability UI

## What it does

agent-ui is a SvelteKit front end for watching the Autonomic ecosystem in a browser. It is meant to show agent-heart vitals, agent-spine DAG progress, agent-muscle sandbox logs, and the context agent-brain injects.

## How it works

1. **Shell.** `src/routes/+layout.svelte` wraps every page. `src/routes/+page.svelte` is the entry view.
2. **Live data.** `server.js` connects to NATS at `AUTONOMIC_NATS_URL` and forwards `events.*` messages to WebSocket clients on port 8080. When NATS is unreachable it sends simulated events instead.

## Where the code is

- `src/routes/` holds the pages.
- `src/app.css` and `src/app.html` hold the styles and HTML shell.
- `src/lib/index.ts` holds shared exports.
- `server.js` is the relay.

## How to use it

- `bun install`, then `bun run server.js` and `bun run dev` in a second terminal.

## How it is verified

- No test exists on master. `relay.test.js` exists only on `fix/relay-loopback-no-fake-events-v2`, and it is not verified in this pass.

## Known limits

- With NATS down, the relay sends simulated events. The panels can look live without real data.
- `relay.js` is not on master, so the README's loopback behaviour applies only to the feature branch.
- The README describes `autonomic ui`, which starts the relay and opens the hosted UI. That command is not checked against this repo in this pass.

## Related

- Feature map: `.verify/features/live-observability-ui.md`
- Event source: agent-nerves (NATS bus) and agent-tui (terminal view)
