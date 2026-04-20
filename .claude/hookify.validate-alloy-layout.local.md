---
name: validate-alloy-layout
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.json$
  - field: new_text
    operator: contains
    pattern: "schemaVersion"
  - field: new_text
    operator: contains
    pattern: "layout"
---

Detected an AlloyLayout JSON file. Validating against the core schema and architectural tier rules...

**Action**: Running `node packages/schema/dist/validate.js` on this content.
If validation fails, please check your component nesting and required props.
