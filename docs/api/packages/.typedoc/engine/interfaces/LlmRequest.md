[**@ferroui/engine**](../README.md)

***

Defined in: [engine/src/types.ts:20](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L20)

## Properties

### conversationContext?

> `optional` **conversationContext?**: `string`[]

Defined in: [engine/src/types.ts:23](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L23)

***

### enablePromptCache?

> `optional` **enablePromptCache?**: `boolean`

Defined in: [engine/src/types.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L37)

When true, marks the system prompt as a candidate for provider-level
prompt caching (Anthropic ephemeral cache / OpenAI cached prefix).

***

### jsonMode?

> `optional` **jsonMode?**: `boolean`

Defined in: [engine/src/types.ts:32](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L32)

When true, instructs the provider to return valid JSON only.
- OpenAI: sets response_format = { type: 'json_object' }
- Anthropic: wraps response in a structured_json tool call
- Other providers: no-op (rely on prompt instruction)

***

### maxTokens?

> `optional` **maxTokens?**: `number`

Defined in: [engine/src/types.ts:25](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L25)

***

### systemPrompt

> **systemPrompt**: `string`

Defined in: [engine/src/types.ts:21](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L21)

***

### temperature?

> `optional` **temperature?**: `number`

Defined in: [engine/src/types.ts:24](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L24)

***

### userPrompt

> **userPrompt**: `string`

Defined in: [engine/src/types.ts:22](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/types.ts#L22)
