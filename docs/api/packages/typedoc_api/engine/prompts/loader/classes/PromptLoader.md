[**@ferroui/engine**](../../../README.md)

***

Defined in: [engine/src/prompts/loader.ts:13](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/prompts/loader.ts#L13)

PromptLoader dynamically loads versioned markdown system prompts 
and handles template variable replacement.

## Constructors

### Constructor

> **new PromptLoader**(`version?`): `PromptLoader`

Defined in: [engine/src/prompts/loader.ts:16](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/prompts/loader.ts#L16)

#### Parameters

##### version?

`string` = `...`

#### Returns

`PromptLoader`

## Properties

### baseDir

> `private` **baseDir**: `string`

Defined in: [engine/src/prompts/loader.ts:14](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/prompts/loader.ts#L14)

## Methods

### loadPrompt()

> **loadPrompt**(`name`, `variables`): `Promise`\<`string`\>

Defined in: [engine/src/prompts/loader.ts:29](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/prompts/loader.ts#L29)

Loads a prompt by name and replaces placeholders with provided variables.

#### Parameters

##### name

`string`

The name of the prompt file (without .md extension)

##### variables

`Record`\<`string`, `string`\>

A map of variable names to their values to replace in the prompt

#### Returns

`Promise`\<`string`\>

The processed prompt content
