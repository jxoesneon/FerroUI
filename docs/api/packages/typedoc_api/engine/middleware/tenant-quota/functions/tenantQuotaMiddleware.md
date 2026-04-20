[**@ferroui/engine**](../../../README.md)

***

> **tenantQuotaMiddleware**(`req`, `res`, `next`): `void`

Defined in: [engine/src/middleware/tenant-quota.ts:51](https://github.com/jxoesneon/FerroUI/blob/f629cfe8aad65aa35e0bd2ea86f61d378dcad807/packages/engine/src/middleware/tenant-quota.ts#L51)

Express middleware that enforces per-tenant request quotas.
Must be placed after JSON body parsing so `req.body.context.tenantId` is available.
Skips quota enforcement on non-API paths.

## Parameters

### req

`Request`

### res

`Response`

### next

`NextFunction`

## Returns

`void`
