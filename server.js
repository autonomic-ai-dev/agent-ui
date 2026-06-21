import { connect, StringCodec } from "nats";
import { WebSocketServer } from "ws";

const sc = StringCodec();

async function start() {
  const natsUrl = process.env.AUTONOMIC_NATS_URL || "nats://127.0.0.1:4222";
  console.log(`Connecting to NATS at ${natsUrl}...`);
  const nc = await connect({ servers: natsUrl }).catch(() => {
    console.warn("NATS connection failed. Running in mock mode.");
    return null;
  });

  const wss = new WebSocketServer({ port: 8080 });

  wss.on("connection", (ws) => {
    console.log("Client connected via WebSocket");
    ws.send(JSON.stringify({ subject: "system.info", payload: "Connected to WebSocket relay" }));

    // If no real NATS, simulate traffic
    if (!nc) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        ws.send(JSON.stringify({
          subject: "events.spine.node_start",
          payload: `Starting node ${step}`
        }));
        ws.send(JSON.stringify({
          subject: "events.heart.status",
          payload: `CPU: ${Math.floor(Math.random() * 20)}% MEM: ${Math.floor(Math.random() * 100) + 100}MB`
        }));
        ws.send(JSON.stringify({
          subject: "events.muscle.stdout",
          payload: `[DEBUG] Executing code block ${step}...`
        }));
      }, 2000);

      ws.on("close", () => clearInterval(interval));
      return;
    }
  });

  if (nc) {
    const sub = nc.subscribe("events.>");
    console.log("Listening for events.>");
    for await (const msg of sub) {
      const payload = sc.decode(msg.data);
      const subject = msg.subject;
      
      // Broadcast to all WS clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({ subject, payload }));
        }
      });
    }
  }

  console.log("WebSocket proxy running on ws://localhost:8080");
}

start();
