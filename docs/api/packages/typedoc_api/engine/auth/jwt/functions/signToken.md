[**@ferroui/engine**](../../../README.md)

***

> **signToken**(`payload`, `opts?`): `string`

Defined in: [engine/src/auth/jwt.ts:70](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/auth/jwt.ts#L70)

## Parameters

### payload

`Omit`\<[`JwtPayload`](../interfaces/JwtPayload.md), `"iat"` \| `"exp"`\>

### opts?

`Pick`\<[`AuthOptions`](../interfaces/AuthOptions.md), `"secret"` \| `"expiresIn"`\> = `{}`

## Returns

`string`
