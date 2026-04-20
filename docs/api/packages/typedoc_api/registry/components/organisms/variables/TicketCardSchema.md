[**@ferroui/registry**](../../../README.md)

***

> `const` **TicketCardSchema**: `ZodObject`\<\{ `aria`: `ZodObject`\<\{ `label`: `ZodString`; \}, `$strip`\>; `assignee`: `ZodOptional`\<`ZodString`\>; `id`: `ZodString`; `priority`: `ZodOptional`\<`ZodEnum`\<\{ `critical`: `"critical"`; `high`: `"high"`; `low`: `"low"`; `medium`: `"medium"`; \}\>\>; `status`: `ZodEnum`\<\{ `closed`: `"closed"`; `in_progress`: `"in_progress"`; `open`: `"open"`; `resolved`: `"resolved"`; \}\>; `title`: `ZodString`; \}, `$strip`\>

Defined in: [components/organisms.ts:166](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/registry/src/components/organisms.ts#L166)
