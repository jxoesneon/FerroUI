[**@ferroui/engine**](../../README.md)

***

> **assertProductionInvariants**(`env?`): `void`

Defined in: [engine/src/server.ts:132](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/server.ts#L132)

Production-mode invariants (F-026 hardening).
Throws early if any unsafe configuration would ship to prod.
Exported for test coverage of the guard logic itself.

## Parameters

### env?

`ProcessEnv` = `process.env`

## Returns

`void`
