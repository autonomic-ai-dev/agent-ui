import { test } from "node:test";
import assert from "node:assert/strict";
import { relayHost, shouldForward, offlineFrames } from "./relay.js";

test("relay binds to loopback unless explicitly overridden", () => {
  assert.equal(relayHost({}), "127.0.0.1");
  assert.equal(relayHost({ AGENT_UI_HOST: "0.0.0.0" }), "0.0.0.0");
});

test("muscle stdout is not forwarded to clients by default", () => {
  assert.equal(shouldForward("events.muscle.stdout", {}), false);
  assert.equal(shouldForward("events.muscle.stdout", { AGENT_UI_SHOW_STDOUT: "1" }), true);
});

test("other organ events are forwarded", () => {
  assert.equal(shouldForward("events.spine.node_start", {}), true);
  assert.equal(shouldForward("events.heart.status", {}), true);
});

test("without NATS and without mock mode, no telemetry is fabricated", () => {
  const frames = offlineFrames(1, {});
  assert.equal(frames.length, 1);
  assert.equal(frames[0].subject, "system.status");
  assert.match(frames[0].payload, /NATS unavailable/);
});

test("mock mode labels every fabricated frame as mock", () => {
  const frames = offlineFrames(1, { AGENT_UI_MOCK: "1" });
  assert.ok(frames.length > 1);
  for (const frame of frames) {
    assert.ok(frame.subject.startsWith("mock."), frame.subject);
  }
});
