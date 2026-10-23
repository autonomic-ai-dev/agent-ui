const STDOUT_SUBJECT = "events.muscle.stdout";

export function relayHost(env) {
  return env.AGENT_UI_HOST || "127.0.0.1";
}

export function shouldForward(subject, env) {
  return subject !== STDOUT_SUBJECT || env.AGENT_UI_SHOW_STDOUT === "1";
}

export function offlineFrames(step, env) {
  if (env.AGENT_UI_MOCK !== "1") {
    return [{ subject: "system.status", payload: "NATS unavailable; no live events" }];
  }
  return [
    { subject: "mock.spine.node_start", payload: `Starting node ${step}` },
    {
      subject: "mock.heart.status",
      payload: `CPU: ${Math.floor(Math.random() * 20)}% MEM: ${Math.floor(Math.random() * 100) + 100}MB`,
    },
    { subject: "mock.muscle.stdout", payload: `[DEBUG] Executing code block ${step}...` },
  ];
}
