[**@ferroui/telemetry**](../../README.md)

***

> **initializeTelemetry**(`serviceName?`): `BasicTracerProvider`

Defined in: [tracer.ts:30](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/telemetry/src/tracer.ts#L30)

Initializes the telemetry SDK — traces + metrics — with OTLP or console exporters.
Call once at server startup before any instrumented code runs.

## Parameters

### serviceName?

`string` = `'ferroui-ui'`

## Returns

`BasicTracerProvider`
