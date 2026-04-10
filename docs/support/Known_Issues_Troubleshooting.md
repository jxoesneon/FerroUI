# Known Issues & Troubleshooting

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Engineering & Support Teams  

---

## 1. Active Known Issues

### 1.1 High Priority

| Issue | Status | Workaround | ETA Fix |
|-------|--------|------------|---------|
| Large registries (>500 components) experience slower fuzzy matching | Investigating | Limit registry size or disable fuzzy matching | Q2 2025 |
| Partial layout updates not yet implemented | Planned | Use full layout refresh | Q3 2025 |
| Shared cache across users not implemented | Planned | Use per-session cache | Q3 2025 |

### 1.2 Medium Priority

| Issue | Status | Workaround | ETA Fix |
|-------|--------|------------|---------|
| Streaming updates always full-layout replacement | By design | N/A | Q3 2025 (RFC-003) |
| Repair loop fuzzy matching adds latency for large registries | Investigating | Use vector-indexed lookup | Q2 2025 |

---

## 2. Troubleshooting Guide

### 2.1 Installation Issues

#### Issue: `npm create alloy-app` fails

**Symptoms:**
```
Error: Command failed: npm create alloy-app@latest
```

**Solutions:**
1. Check Node.js version (requires 18+)
   ```bash
   node --version
   ```

2. Clear npm cache
   ```bash
   npm cache clean --force
   ```

3. Try with npx
   ```bash
   npx create-alloy-app@latest my-app
   ```

---

### 2.2 Runtime Issues

#### Issue: `alloy dev` fails to start

**Symptoms:**
```
Error: Port 3000 already in use
```

**Solutions:**
1. Kill process on port 3000
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. Use different port
   ```bash
   alloy dev --port 3001
   ```

---

#### Issue: Layout generation timeout

**Symptoms:**
- Request hangs indefinitely
- "Timeout" error in logs

**Solutions:**
1. Check LLM provider status
2. Switch to backup provider
   ```bash
   export ALLOY_DEFAULT_PROVIDER=anthropic
   ```
3. Increase timeout
   ```javascript
   // alloy.config.js
   module.exports = {
     tools: {
       timeout: 10000, // 10 seconds
     },
   };
   ```

---

#### Issue: Component not found in generated layout

**Symptoms:**
```
Error: Component "MyComponent" not found in registry
```

**Solutions:**
1. Verify component is registered
   ```typescript
   // src/components/index.ts
   import { MyComponent } from './MyComponent';
   
   registerComponent({
     name: 'MyComponent',
     // ...
   });
   ```

2. Check component name spelling
3. Restart dev server

---

### 2.3 Performance Issues

#### Issue: Slow layout generation

**Symptoms:**
- p95 latency > 5s
- User complaints about slowness

**Solutions:**
1. Enable semantic caching
   ```javascript
   module.exports = {
     cache: {
       enabled: true,
       ttl: 300,
     },
   };
   ```

2. Switch to faster provider
   ```bash
   export ALLOY_DEFAULT_PROVIDER=openai
   ```

3. Enable optimistic streaming
   ```javascript
   module.exports = {
     streaming: {
       mode: 'optimistic',
     },
   };
   ```

---

#### Issue: High memory usage

**Symptoms:**
- OOM errors
- Container restarts

**Solutions:**
1. Reduce cache size
   ```javascript
   module.exports = {
     cache: {
       maxSize: 1000, // Max 1000 entries
     },
   };
   ```

2. Limit concurrent requests
   ```javascript
   module.exports = {
     rateLimit: {
       max: 30, // 30 requests per minute
     },
   };
   ```

---

### 2.4 LLM Provider Issues

#### Issue: OpenAI rate limit exceeded

**Symptoms:**
```
Error: 429 Rate limit exceeded
```

**Solutions:**
1. Implement exponential backoff
2. Switch to different provider
3. Upgrade plan for higher limits

---

#### Issue: Hallucinated components

**Symptoms:**
- Invalid component types in layout
- Validation errors

**Solutions:**
1. Update to latest prompt version
   ```bash
   export ALLOY_PROMPT_VERSION=1.2.1
   ```

2. Enable stricter validation
   ```javascript
   module.exports = {
     validation: {
       strict: true,
       maxRepairAttempts: 3,
     },
   };
   ```

---

## 3. Debug Mode

### 3.1 Enable Debug Logging

```bash
DEBUG=alloy* alloy dev
```

### 3.2 View Logs

```bash
# Follow logs
alloy logs --follow

# Filter by level
alloy logs --level error

# Last 100 lines
alloy logs --tail 100
```

---

## 4. Getting Help

If the above solutions don't resolve your issue:

1. Check [End User FAQ](./End_User_FAQ.md)
2. Search [GitHub Discussions](https://github.com/alloyui/alloy/discussions)
3. Join [Discord](https://discord.gg/alloyui)
4. Contact support: support@alloy.dev

---

## 5. Related Documents

- [Support Escalation Paths](./Support_Escalation_Paths.md)
- [KB Article Templates](./KB_Article_Templates.md)
- [End User FAQ](./End_User_FAQ.md)

---

## 6. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Support Team | Initial release |
