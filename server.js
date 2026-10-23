import { connect, StringCodec } from "nats";
import { WebSocketServer } from "ws";
import { offlineFrames, relayHost, shouldForward } from "./relay.js";

const sc = StringCodec();
const PORT = 8080;

async function start() {
  const natsUrl = process.env.AUTONOMIC_NATS_URL || "nats://127.0.0.1:4222";
  console.log(`Connecting to NATS at ${natsUrl}...`);
  const nc = await connect({ servers: natsUrl }).catch(() => {
    console.warn("NATS connection failed. No live events will be relayed.");
    return null;
  });

  const wss = new WebSocketServer({ port: PORT, host: relayHost(process.env) });

  const send = (ws, frame) => ws.send(JSON.stringify(frame));

  wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");
    send(ws, { subject: "system.info", payload: "Connected to WebSocket relay" });

    if (nc) return;
    if (process.env.AGENT_UI_MOCK !== "1") {
      offlineFrames(0, process.env).forEach((frame) => send(ws, frame));
      return;
    }
    let step = 0;
    const interval = setInterval(() => {
      step++;
      offlineFrames(step, process.env).forEach((frame) => send(ws, frame));
    }, 2000);
    ws.on("close", () => clearInterval(interval));
  });

  if (nc) {
    const sub = nc.subscribe("events.>");
    console.log("Listening for events.>");
    for await (const msg of sub) {
      const subject = msg.subject;
      if (!shouldForward(subject, process.env)) continue;
      const payload = sc.decode(msg.data);
      wss.clients.forEach((client) => {
        if (client.readyState === 1) send(client, { subject, payload });
      });
    }
  }

  console.log(`WebSocket relay running on ws://${relayHost(process.env)}:${PORT}`);
}

start();
