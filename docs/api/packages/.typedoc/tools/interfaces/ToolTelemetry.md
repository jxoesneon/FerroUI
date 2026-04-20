[**@ferroui/tools**](../README.md)

***

Defined in: [packages/tools/src/types.ts:37](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L37)

Generic Telemetry interface for tools
Matches patterns from @ferroui/telemetry

## Methods

### recordEvent()

> **recordEvent**(`name`, `attributes?`): `void`

Defined in: [packages/tools/src/types.ts:38](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L38)

#### Parameters

##### name

`string`

##### attributes?

`Record`\<`string`, `string` \| `number` \| `boolean`\>

#### Returns

`void`

***

### recordMetric()

> **recordMetric**(`name`, `value`, `attributes?`): `void`

Defined in: [packages/tools/src/types.ts:39](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/tools/src/types.ts#L39)

#### Parameters

##### name

`string`

##### value

`number`

##### attributes?

`Record`\<`string`, `string` \| `number` \| `boolean`\>

#### Returns

`void`
