# SIEM Export Guide (E.3)

FerroUI supports enterprise SIEM (Security Information and Event Management) integrations for centralized security monitoring.

## Supported SIEM Platforms

- Splunk
- Datadog
- Elasticsearch/ELK Stack
- Azure Sentinel
- Google Chronicle
- AWS Security Lake

## Export Formats

### 1. CEF (Common Event Format)

For ArcSight, Splunk, and other CEF-compatible systems:

```
CEF:0|FerroUI|Engine|1.0.0|REQUEST_COMPLETE|Request Completed|5|
suser=u123 duser=u123 src=10.0.0.1 spt=443 request=/api/ferroui/process
msg="UI generation completed successfully" cs1=45 cs1Label=tokensUsed
```

Configuration:
```bash
AUDIT_LOG_FORMAT=cef
AUDIT_CEF_SYSLOG_HOST=siem.company.com
AUDIT_CEF_SYSLOG_PORT=514
```

### 2. LEEF (Log Event Extended Format)

For QRadar:

```
LEEF:2.0|FerroUI|Engine|1.0.0|REQUEST_COMPLETE|
src=10.0.0.1 usrName=u123 tokensUsed=45 durationMs=1234
```

Configuration:
```bash
AUDIT_LOG_FORMAT=leef
AUDIT_LEEF_SYSLOG_HOST=qradar.company.com
```

### 3. JSON Lines (Datadog, Elasticsearch)

```json
{"timestamp":"2026-04-17T20:30:00Z","service":"ferroui-engine","type":"REQUEST_COMPLETE","userId":"u123","tenantId":"acme","tokens":45,"durationMs":1234,"_chain":{"hash":"a1b2c3..."}}
```

Configuration:
```bash
AUDIT_LOG_FORMAT=json
AUDIT_LOG_OUTPUT=file
AUDIT_LOG_FILE=/var/log/ferroui/audit.jsonl
```

### 4. Syslog (RFC 5424)

```
<134>1 2026-04-17T20:30:00Z ferroui-engine ferroui 1234 REQUEST_COMPLETE [audit@32473 userId="u123" tenantId="acme"] Request completed
```

## Field Mappings

| FerroUI Field | CEF Field | LEEF Field | Description |
|--------------|-----------|------------|-------------|
| type | deviceEventClassId | eventId | Event type |
| userId | suser | usrName | Source user |
| tenantId | cs3 | tenantId | Organization |
| requestId | cs4 | requestId | Request trace ID |
| tokens | cs1 | tokensUsed | LLM tokens consumed |
| durationMs | cn1 | duration | Processing time |
| _chain.hash | cs2 | chainHash | Tamper evidence |

## Splunk Integration

### HEC (HTTP Event Collector)

```typescript
// Configure in server.ts
const splunkLogger = new SplunkHECLogger({
  url: 'https://splunk.company.com:8088',
  token: process.env.SPLUNK_HEC_TOKEN,
  index: 'ferroui_audit',
  sourcetype: 'ferroui:engine',
});

auditLogger.addTransport(splunkLogger);
```

### Splunk Dashboard

Install the FerroUI Splunk App:
```bash
splunk install app ferroui-splunk-app.tar.gz
```

Includes:
- Real-time security dashboard
- Hallucination rate trends
- Token usage by user/tenant
- Audit chain integrity alerts

## Datadog Integration

```typescript
import { DatadogLogger } from '@ferroui/audit-datadog';

const ddLogger = new DatadogLogger({
  apiKey: process.env.DD_API_KEY,
  service: 'ferroui-engine',
  tags: ['env:production', 'tier:ai'],
});

auditLogger.addTransport(ddLogger);
```

## Real-time Streaming

WebSocket endpoint for live SIEM ingestion:

```bash
# Connect to audit stream
wss://ferroui.api/admin/v1/audit-logs/stream

# With filtering
?eventType=REQUEST_COMPLETE&tenantId=acme
```

## Compliance Mapping

| Compliance | Required Events | Retention |
|-----------|-----------------|-----------|
| SOC 2 | All auth, data access | 1 year |
| GDPR | Data subject actions | 7 years |
| HIPAA | PHI access | 6 years |
| PCI DSS | Auth, admin actions | 1 year |

## Alerting

Configure alerts in your SIEM:

```splunk
// Hallucination spike
index=ferroui sourcetype=ferroui:engine event=VALIDATION_FAILED
| timechart span=5m count
| where count > 10

// Audit chain tampering
index=ferroui sourcetype=ferroui:engine chain_valid=false
| alert priority=high

// Unusual token consumption
index=ferroui sourcetype=ferroui:engine 
| stats avg(tokens) as avg by userId
| where tokens > avg * 10
```
