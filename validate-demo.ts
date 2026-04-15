import { FerroUILayoutSchema } from './packages/schema/src/types';

const layout = {
    schemaVersion: "1.1",
    requestId: crypto.randomUUID(),
    locale: "en-US",
    layout: {
      type: "Dashboard",
      aria: { label: "Project Quantum Dashboard" },
      children: [
        {
          type: "ProfileHeader",
          aria: { label: "User Profile" },
          props: { name: "Agent Supervisor", status: "online" }
        },
        {
          type: "KPIBoard",
          aria: { label: "Key Performance Indicators" },
          props: { activeAgents: 42, tasks: 1337, cost: "$420.69" }
        },
        {
          type: "ActivityFeed",
          aria: { label: "Live Activity Feed", live: "polite" },
          props: { streamUrl: "/api/stream" }
        },
        {
          type: "ActionButton",
          aria: { label: "Deploy Agent" },
          props: { label: "Deploy New Agent" },
          action: {
            type: "TOOL_CALL",
            payload: { tool: "deployAgent", args: { region: "us-east" } }
          }
        },
        {
          type: "TicketCard",
          aria: { label: "Agent Status Ticket" },
          id: "ticket-1",
          stateMachine: {
            initial: "Active",
            states: {
              Active: {
                on: { PAUSE: { target: "Paused" } }
              },
              Paused: {
                on: { RESUME: { target: "Active" } }
              }
            }
          },
          props: { agentId: "agent-007", status: "Active" }
        },
        {
          type: "DataTable",
          aria: { label: "Agent Metrics" },
          props: { columns: ["Metric", "Value"], data: [["CPU", "45%"], ["Mem", "1.2GB"]] }
        },
        {
          type: "SearchBar",
          aria: { label: "Command Terminal Search" },
          props: { placeholder: "Enter command..." }
        },
        {
          type: "FormField",
          aria: { label: "Additional Parameters" },
          props: { name: "params", type: "text" }
        }
      ]
    },
    metadata: {
      generatedAt: new Date().toISOString()
    }
};

const result = FerroUILayoutSchema.safeParse(layout);
if (!result.success) {
    console.error("Validation failed:");
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
} else {
    console.log("Validation passed!");
}
