[**@ferroui/schema**](../../README.md)

***

> `const` **ActionSchema**: `ZodDiscriminatedUnion`\<\[`ZodObject`\<\{ `payload`: `ZodObject`\<\{ `params`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `path`: `ZodString`; \}, `$strip`\>; `type`: `ZodLiteral`\<`"NAVIGATE"`\>; \}, `$strip`\>, `ZodObject`\<\{ `payload`: `ZodObject`\<\{ `duration`: `ZodOptional`\<`ZodNumber`\>; `message`: `ZodString`; `variant`: `ZodEnum`\<\{ `error`: `"error"`; `info`: `"info"`; `success`: `"success"`; `warning`: `"warning"`; \}\>; \}, `$strip`\>; `type`: `ZodLiteral`\<`"SHOW_TOAST"`\>; \}, `$strip`\>, `ZodObject`\<\{ `payload`: `ZodOptional`\<`ZodRecord`\<`ZodString`, `ZodUnknown`\>\>; `type`: `ZodLiteral`\<`"REFRESH"`\>; \}, `$strip`\>, `ZodObject`\<\{ `payload`: `ZodObject`\<\{ `args`: `ZodRecord`\<`ZodString`, `ZodUnknown`\>; `tool`: `ZodString`; \}, `$strip`\>; `type`: `ZodLiteral`\<`"TOOL_CALL"`\>; \}, `$strip`\>, `ZodObject`\<\{ `payload`: `ZodObject`\<\{ `id`: `ZodString`; `state`: `ZodRecord`\<`ZodString`, `ZodUnknown`\>; \}, `$strip`\>; `type`: `ZodLiteral`\<`"STATE_UPDATE"`\>; \}, `$strip`\>\], `"type"`\>

Defined in: [types.ts:70](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/schema/src/types.ts#L70)
