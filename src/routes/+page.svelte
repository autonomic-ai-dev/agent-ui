<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Activity, Brain, Server, Terminal as TermIcon, GitMerge } from 'lucide-svelte';

  interface NatsMessage {
    subject: string;
    payload: string;
  }

  interface OrganHealth {
    cpu: string;
    mem: string;
  }

  let connected = false;
  let logs: string[] = [];
  let workflows: { id: string; status: string }[] = [];
  let context: string[] = [];
  let health: OrganHealth = { cpu: '0%', mem: '0MB' };
  
  let logsEndRef: HTMLDivElement;

  onMount(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => connected = true;
    ws.onclose = () => connected = false;

    ws.onmessage = async (event) => {
      try {
        const msg: NatsMessage = JSON.parse(event.data);
        handleMessage(msg);
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };

    return () => ws.close();
  });

  const handleMessage = async (msg: NatsMessage) => {
    if (msg.subject.startsWith('events.muscle')) {
      logs = [...logs, msg.payload].slice(-100);
      await tick();
      if (logsEndRef) logsEndRef.scrollIntoView({ behavior: 'smooth' });
    } else if (msg.subject.startsWith('events.spine')) {
      const exists = workflows.find(w => w.id === msg.payload);
      if (!exists) {
        workflows = [{ id: msg.payload, status: 'active' }, ...workflows].slice(0, 10);
      }
    } else if (msg.subject.startsWith('events.brain')) {
      context = [msg.payload, ...context].slice(0, 20);
    } else if (msg.subject.startsWith('events.heart')) {
      const cpuMatch = msg.payload.match(/CPU:\s*(\d+%)/);
      const memMatch = msg.payload.match(/MEM:\s*(\d+MB)/);
      if (cpuMatch && memMatch) {
        health = { cpu: cpuMatch[1], mem: memMatch[1] };
      }
    }
  };
</script>

<div class="ambient-bg"></div>

<div class="grid grid-cols-12 gap-6 h-[calc(100%-4rem)]">
  <div class="col-span-12 flex justify-between items-center">
    <h2 class="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Autonomic AI Observability</h2>
    <div class="flex items-center gap-2">
      <div class={`w-2.5 h-2.5 rounded-full shadow-[0_0_12px] ${connected ? 'bg-[#00ff9d] shadow-[#00ff9d]' : 'bg-[#ff0055] shadow-[#ff0055]'}`}></div>
      <span class="text-sm text-[#888899] uppercase tracking-widest font-semibold">
        {connected ? 'Connected' : 'Offline'}
      </span>
    </div>
  </div>

  <div class="glass-panel col-span-12 flex gap-6">
    <div class="health-card">
      <h3 class="flex items-center text-[0.8rem] text-[#888899] uppercase tracking-widest mb-2">
        <Activity size={16} class="mr-1 text-[#00e5ff]" /> System CPU
      </h3>
      <div class="value">{health.cpu}</div>
    </div>
    <div class="health-card">
      <h3 class="flex items-center text-[0.8rem] text-[#888899] uppercase tracking-widest mb-2">
        <Server size={16} class="mr-1 text-[#b300ff]" /> Memory Usage
      </h3>
      <div class="value">{health.mem}</div>
    </div>
  </div>

  <div class="glass-panel col-span-4 flex flex-col">
    <h3 class="flex items-center gap-2 text-lg font-semibold mb-4">
      <GitMerge size={20} class="text-[#00ff9d]" /> DAG Workflows
    </h3>
    <div class="flex-1 overflow-y-auto pr-1">
      {#if workflows.length === 0}
        <p class="text-[#888899] text-sm">Waiting for spine events...</p>
      {:else}
        {#each workflows as w, i}
          <div class={`dag-node ${i === 0 ? 'active' : ''}`}>
            <span>{w.id}</span>
            <span class="w-2 h-2 rounded-full bg-[#00ff9d] shadow-[0_0_12px_#00ff9d]"></span>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <div class="glass-panel col-span-8 flex flex-col">
    <h3 class="flex items-center gap-2 text-lg font-semibold mb-4">
      <TermIcon size={20} class="text-[#00e5ff]" /> Sandbox Execution
    </h3>
    <div class="terminal-output flex-1">
      {#each logs as log}
        <div class="terminal-line">
          <span class="prefix">&gt;</span> {log}
        </div>
      {/each}
      <div bind:this={logsEndRef}></div>
    </div>
  </div>

  <div class="glass-panel col-span-12 flex flex-col">
    <h3 class="flex items-center gap-2 text-lg font-semibold mb-4">
      <Brain size={20} class="text-[#b300ff]" /> Brain Context Retrieval
    </h3>
    <div class="mt-4 flex flex-wrap gap-2">
      {#if context.length === 0}
        <p class="text-[#888899] text-sm">Waiting for brain events...</p>
      {:else}
        {#each context as c}
          <span class="context-item">{c}</span>
        {/each}
      {/if}
    </div>
  </div>
</div>
