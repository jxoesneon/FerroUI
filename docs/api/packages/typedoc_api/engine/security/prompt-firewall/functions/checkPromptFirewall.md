[**@ferroui/engine**](../../../README.md)

***

> **checkPromptFirewall**(`prompt`): `Promise`\<[`FirewallResult`](../interfaces/FirewallResult.md)\>

Defined in: [engine/src/security/prompt-firewall.ts:125](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/security/prompt-firewall.ts#L125)

Run the prompt through the configured firewall provider.
Built-in patterns always run first; external provider runs second.
Fails open on external provider errors to avoid availability loss.

## Parameters

### prompt

`string`

## Returns

`Promise`\<[`FirewallResult`](../interfaces/FirewallResult.md)\>

FirewallResult — callers must check `blocked` and return early if true.
