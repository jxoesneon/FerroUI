# Hallucination Mitigation Case Studies

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** AI Engineering Team  

---

## 1. Overview

Hallucination — when the LLM invents component names or props that don't exist in the registry — is one of the most common failure modes in AI-generated UI systems. This document presents real case studies of hallucinations encountered in Alloy UI and the mitigation strategies employed.

---

## 2. Hallucination Types

### 2.1 Component Hallucination

The LLM invents a component type that doesn't exist in the registry.

**Example:**
```json
{
  "type": "UserProfileCard",  // ❌ Doesn't exist
  "props": { "name": "John" }
}
```

### 2.2 Prop Hallucination

The LLM uses a prop that isn't defined in the component schema.

**Example:**
```json
{
  "type": "DataTable",
  "props": {
    "columns": [...],
    "enablePagination": true  // ❌ Not in schema
  }
}
```

### 2.3 Nesting Hallucination

The LLM nests components in invalid ways.

**Example:**
```json
{
  "type": "Text",
  "props": { "content": "Hello" },
  "children": [
    { "type": "Card" }  // ❌ Atoms can't have children
  ]
}
```

---

## 3. Case Studies

### Case Study 1: The "UserProfileCard" Incident

**Date:** February 2025  
**Severity:** High  
**Frequency:** 3.5% of requests

#### Problem

The LLM frequently invented a `UserProfileCard` component when asked to display user information. The actual registered component was `ProfileHeader`.

```json
// ❌ Hallucinated
{
  "type": "UserProfileCard",
  "props": {
    "userName": "Jane Doe",
    "userRole": "Admin"
  }
}

// ✅ Correct
{
  "type": "ProfileHeader",
  "props": {
    "name": "Jane Doe",
    "role": "Admin"
  }
}
```

#### Root Cause

- Component name wasn't intuitive
- System prompt didn't emphasize exact names
- LLM generalized from similar component patterns

#### Mitigation

1. **System Prompt Enhancement**
   ```markdown
   CRITICAL: Use ONLY component names from the manifest below.
   Any component name not in this list is INVALID.
   
   Available components:
   - ProfileHeader (NOT "UserProfileCard" or "UserCard")
   - DataTable (NOT "Table" or "Grid")
   ```

2. **Fuzzy Matching in Repair Loop**
   ```typescript
   function suggestCorrection(hallucinatedName: string): string | null {
     const registryNames = getAllComponentNames();
     const matches = registryNames.map(name => ({
       name,
       distance: levenshteinDistance(hallucinatedName, name),
     }));
     
     const bestMatch = matches.sort((a, b) => a.distance - b.distance)[0];
     return bestMatch.distance <= 3 ? bestMatch.name : null;
   }
   
   // "UserProfileCard" → "Did you mean ProfileHeader?"
   ```

3. **Component Renaming**
   - Renamed `ProfileHeader` to `UserProfile` for clarity

#### Results

| Metric | Before | After |
|--------|--------|-------|
| Hallucination Rate | 3.5% | 0.2% |
| Repair Success | 60% | 95% |
| Avg Latency | 3.2s | 2.1s |

---

### Case Study 2: The Phantom "onClick" Handler

**Date:** March 2025  
**Severity:** Medium  
**Frequency:** 2.1% of requests

#### Problem

The LLM added `onClick` handlers to components, but the schema only supported the `action` prop.

```json
// ❌ Hallucinated prop
{
  "type": "ActionButton",
  "props": {
    "label": "Submit",
    "onClick": "handleSubmit"  // ❌ Not in schema
  }
}

// ✅ Correct
{
  "type": "ActionButton",
  "props": {
    "label": "Submit"
  },
  "action": {
    "type": "TOOL_CALL",
    "payload": {
      "tool": "submitForm",
      "args": {}
    }
  }
}
```

#### Root Cause

- LLM trained on React patterns
- Schema documentation unclear about action pattern
- Prop naming inconsistent with React conventions

#### Mitigation

1. **Explicit Schema Documentation**
   ```markdown
   ActionButton props:
   - label (string, required): Button text
   - variant (enum): "primary" | "secondary" | "ghost"
   - action (Action, optional): Use THIS for click handling
     DO NOT use "onClick" - it is NOT a valid prop
   ```

2. **Validation Rule**
   ```typescript
   const validationRules = [
     {
       name: 'noOnClickProp',
       check: (component) => !component.props?.onClick,
       error: 'onClick is not a valid prop. Use "action" instead.',
     },
   ];
   ```

3. **Lower Temperature for Repair**
   ```typescript
   const repairConfig = {
     temperature: 0.1,  // Reduced from 0.7
     maxTokens: 2000,
   };
   ```

#### Results

| Metric | Before | After |
|--------|--------|-------|
| onClick Hallucinations | 2.1% | 0.05% |
| Schema Validity | 96% | 99.2% |

---

### Case Study 3: The Nested Dashboard Disaster

**Date:** January 2025  
**Severity:** Critical  
**Frequency:** 0.8% of requests

#### Problem

The LLM nested a `Dashboard` inside another component, violating the "Dashboard must be root" rule.

```json
// ❌ Nested Dashboard
{
  "type": "Dashboard",
  "props": { "title": "Main" },
  "children": [
    {
      "type": "Card",
      "children": [
        {
          "type": "Dashboard",  // ❌ Dashboard inside Card!
          "props": { "title": "Sub" }
        }
      ]
    }
  ]
}
```

#### Root Cause

- Complex prompt with nested requirements
- LLM misunderstood "create a dashboard within a card" instruction
- Nesting rules not emphasized enough

#### Mitigation

1. **Stronger Nesting Rules**
   ```markdown
   NESTING RULES (ENFORCED):
   1. Dashboard MUST be the root component
   2. Dashboard MUST appear exactly ONCE
   3. Dashboard CANNOT be nested inside any other component
   4. Violating these rules causes VALIDATION FAILURE
   ```

2. **Pre-validation Check**
   ```typescript
   function preValidateNesting(layout: AlloyComponent): ValidationError[] {
     const errors: ValidationError[] = [];
     let dashboardCount = 0;
     
     function traverse(component: AlloyComponent, depth: number, parent?: AlloyComponent) {
       if (component.type === 'Dashboard') {
         dashboardCount++;
         if (depth > 0) {
           errors.push({
             path: getPath(component),
             message: 'Dashboard cannot be nested inside another component',
           });
         }
       }
       
       component.children?.forEach(child => traverse(child, depth + 1, component));
     }
     
     traverse(layout, 0);
     
     if (dashboardCount > 1) {
       errors.push({
         path: 'root',
         message: `Found ${dashboardCount} Dashboard components. Only 1 allowed.`,
       });
     }
     
     return errors;
   }
   ```

3. **Example in Prompt**
   ```markdown
   ❌ INCORRECT - Nested Dashboard:
   {
     "type": "Dashboard",
     "children": [{ "type": "Card", "children": [{ "type": "Dashboard" }] }]
   }
   
   ✅ CORRECT - Dashboard at root only:
   {
     "type": "Dashboard",
     "children": [{ "type": "Card" }]
   }
   ```

#### Results

| Metric | Before | After |
|--------|--------|-------|
| Nested Dashboard Errors | 0.8% | 0% |
| Related Repair Attempts | 5% | 0.1% |

---

### Case Study 4: The "enableSorting" Mirage

**Date:** February 2025  
**Severity:** Low  
**Frequency:** 4.2% of requests

#### Problem

The LLM consistently added `enableSorting` and `enableFiltering` props to `DataTable`, even though these features were always enabled by default.

```json
// ❌ Unnecessary props
{
  "type": "DataTable",
  "props": {
    "columns": [...],
    "rows": [...],
    "enableSorting": true,    // ❌ Always enabled
    "enableFiltering": true   // ❌ Always enabled
  }
}

// ✅ Correct - features enabled by default
{
  "type": "DataTable",
  "props": {
    "columns": [...],
    "rows": [...]
  }
}
```

#### Root Cause

- LLM pattern-matching from other data table libraries
- Schema didn't explicitly state defaults
- Desire to be explicit about features

#### Mitigation

1. **Schema Documentation**
   ```markdown
   DataTable features (enabled by default, no props needed):
   - Sorting: Click column headers to sort
   - Filtering: Built-in column filtering
   - Pagination: Automatic if rows > pageSize
   
   DO NOT include enableSorting, enableFiltering, or enablePagination props.
   These are NOT valid props and will cause validation errors.
   ```

2. **Strict Schema Validation**
   ```typescript
   const DataTableSchema = z.object({
     columns: z.array(ColumnSchema),
     rows: z.array(z.record(z.unknown())),
     // No enableSorting, enableFiltering, or enablePagination
   }).strict();  // Rejects unknown properties
   ```

#### Results

| Metric | Before | After |
|--------|--------|-------|
| Invalid Prop Errors | 4.2% | 0.3% |
| Schema Strictness | permissive | strict |

---

## 4. General Mitigation Strategies

### 4.1 Layered Defense

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: System Prompt                                     │
│  - Explicit component list                                  │
│  - Clear examples of correct/incorrect                      │
│  - Emphasize critical rules                                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: Pre-validation                                    │
│  - Check component names before full validation             │
│  - Early detection of common hallucinations                 │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: Schema Validation                                 │
│  - Zod schema with strict mode                              │
│  - Unknown property rejection                               │
├─────────────────────────────────────────────────────────────┤
│  LAYER 4: Self-Healing                                      │
│  - Fuzzy matching for component names                       │
│  - Repair prompt with specific error                        │
│  - Lower temperature for repair                             │
├─────────────────────────────────────────────────────────────┤
│  LAYER 5: Fallback                                          │
│  - Safe ErrorLayout on repair failure                       │
│  - Never show broken UI                                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Monitoring

```typescript
// Hallucination tracking
interface HallucinationEvent {
  type: 'component' | 'prop' | 'nesting';
  hallucinatedValue: string;
  suggestedCorrection?: string;
  repairAttempt: number;
  repairSuccess: boolean;
  model: string;
  timestamp: Date;
}

// Alert if hallucination rate > 1%
if (hallucinationRate > 0.01) {
  alert('Hallucination rate exceeded threshold');
}
```

---

## 5. Related Documents

- [System Prompt SOP](./System_Prompt_SOP.md)
- [Prompt Evaluation Rubric](./Prompt_Evaluation_Rubric_Testing_Playbook.md)
- [Component Development Guidelines](../engineering/frontend/Component_Development_Guidelines.md)

---

## 6. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | AI Engineering | Initial release |
