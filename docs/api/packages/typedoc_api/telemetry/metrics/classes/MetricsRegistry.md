[**@ferroui/telemetry**](../../README.md)

***

Defined in: [metrics.ts:51](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L51)

Common metrics registry

## Constructors

### Constructor

> `private` **new MetricsRegistry**(): `MetricsRegistry`

Defined in: [metrics.ts:81](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L81)

#### Returns

`MetricsRegistry`

## Properties

### cacheHits

> `readonly` **cacheHits**: `Counter`

Defined in: [metrics.ts:59](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L59)

***

### cacheMisses

> `readonly` **cacheMisses**: `Counter`

Defined in: [metrics.ts:60](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L60)

***

### llmCalls

> `readonly` **llmCalls**: `Counter`

Defined in: [metrics.ts:63](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L63)

***

### llmCost

> `readonly` **llmCost**: `Counter`

Defined in: [metrics.ts:67](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L67)

***

### llmDuration

> `readonly` **llmDuration**: `Histogram`

Defined in: [metrics.ts:64](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L64)

***

### llmTokensInput

> `readonly` **llmTokensInput**: `Counter`

Defined in: [metrics.ts:65](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L65)

***

### llmTokensOutput

> `readonly` **llmTokensOutput**: `Counter`

Defined in: [metrics.ts:66](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L66)

***

### meter

> `private` **meter**: `Meter`

Defined in: [metrics.ts:53](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L53)

***

### requestsDuration

> `readonly` **requestsDuration**: `Histogram`

Defined in: [metrics.ts:57](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L57)

***

### requestsErrors

> `readonly` **requestsErrors**: `Counter`

Defined in: [metrics.ts:58](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L58)

***

### requestsTotal

> `readonly` **requestsTotal**: `Counter`

Defined in: [metrics.ts:56](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L56)

***

### toolsCalls

> `readonly` **toolsCalls**: `Counter`

Defined in: [metrics.ts:70](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L70)

***

### toolsDuration

> `readonly` **toolsDuration**: `Histogram`

Defined in: [metrics.ts:71](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L71)

***

### toolsErrors

> `readonly` **toolsErrors**: `Counter`

Defined in: [metrics.ts:72](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L72)

***

### toolsTimeout

> `readonly` **toolsTimeout**: `Counter`

Defined in: [metrics.ts:73](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L73)

***

### validationFailed

> `readonly` **validationFailed**: `Counter`

Defined in: [metrics.ts:77](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L77)

***

### validationHallucinations

> `readonly` **validationHallucinations**: `Counter`

Defined in: [metrics.ts:79](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L79)

***

### validationRepairs

> `readonly` **validationRepairs**: `Counter`

Defined in: [metrics.ts:78](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L78)

***

### validationTotal

> `readonly` **validationTotal**: `Counter`

Defined in: [metrics.ts:76](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L76)

***

### instance

> `private` `static` **instance**: `MetricsRegistry`

Defined in: [metrics.ts:52](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L52)

## Methods

### getInstance()

> `static` **getInstance**(): `MetricsRegistry`

Defined in: [metrics.ts:107](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/metrics.ts#L107)

#### Returns

`MetricsRegistry`
