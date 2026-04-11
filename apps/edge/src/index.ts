import { AlloyEngine, AnthropicProvider } from '@alloy/engine';

export interface Env {
  // Bindings for Cloudflare Workers
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const provider = new AnthropicProvider();
    const engine = new AlloyEngine(provider);

    // Simulated usage
    const generator = engine.process("Hello Alloy!", {
      userId: "user-123",
      requestId: "req-456",
    });

    for await (const chunk of generator) {
      if (chunk.type === 'content') {
        console.log("Chunk:", chunk.delta);
      }
    }

    return new Response("Alloy Edge Worker is running with @alloy/engine!");
  },
};
