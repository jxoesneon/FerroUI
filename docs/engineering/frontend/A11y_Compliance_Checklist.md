# Accessibility (a11y) Compliance Checklist

**Version:** 1.0  
**Last Updated:** 2025-04-10  
**Owner:** Accessibility Team  
**Target Compliance:** WCAG 2.1 Level AA  

---

## 1. Overview

Accessibility in FerroUI UI is non-negotiable and non-bypassable. Because the AI generates layouts dynamically, a11y cannot be left to developer diligence on a per-screen basis. This checklist ensures all components and generated layouts meet WCAG 2.1 Level AA standards.

---

## 2. Compliance Levels

| Level | Description | FerroUI UI Requirement |
|-------|-------------|---------------------|
| A | Essential accessibility | 100% compliance required |
| AA | Ideal accessibility | 100% compliance required |
| AAA | Enhanced accessibility | Target where feasible |

---

## 3. Perceivable

### 3.1 Text Alternatives (1.1)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.1.1 Non-text Content | All non-text content has text alternative | Images have alt text; icons have aria-label |

**Checklist:**
- [ ] All `<img>` elements have meaningful `alt` attributes
- [ ] Decorative images have `alt=""` or `aria-hidden="true"`
- [ ] Icons have `aria-label` or are associated with text
- [ ] Charts have text summaries or data tables

```typescript
// ✅ Good
<img src="chart.png" alt="Sales increased 25% from Q1 to Q2" />
<Icon name="search" aria-label="Search" />

// ❌ Bad
<img src="chart.png" />
<Icon name="search" />
```

### 3.2 Time-based Media (1.2)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.2.1 Audio-only/Video-only | Transcripts/captions provided | N/A (no media components) |
| 1.2.2 Captions | Captions for prerecorded video | N/A |

### 3.3 Adaptable (1.3)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.3.1 Info and Relationships | Structure conveyed programmatically | Proper heading hierarchy, ARIA landmarks |
| 1.3.2 Meaningful Sequence | Content order is logical | DOM order matches visual order |
| 1.3.3 Sensory Characteristics | Instructions not rely solely on color | "Required fields marked with *" not just red |
| 1.3.4 Orientation | Content not locked to orientation | Responsive design |
| 1.3.5 Identify Input Purpose | Input purpose programmatically determined | Autocomplete attributes |

**Checklist:**
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] ARIA landmarks used (main, nav, aside, etc.)
- [ ] Lists use proper `<ul>`, `<ol>`, `<li>` elements
- [ ] Tables have proper `<th>` headers
- [ ] Forms have associated `<label>` elements
- [ ] Required fields have both visual and programmatic indicators

```typescript
// ✅ Good
<form>
  <label htmlFor="email">Email *</label>
  <input 
    id="email" 
    type="email" 
    required 
    aria-required="true"
    autoComplete="email"
  />
</form>

// ❌ Bad
<form>
  <span>Email</span> {/* Not associated with input */}
  <input type="email" style={{ border: '1px solid red' }} /> {/* Color-only indication */}
</form>
```

### 3.4 Distinguishable (1.4)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 1.4.1 Use of Color | Color not sole means of conveying info | Icons + color, not just color |
| 1.4.2 Audio Control | Audio can be stopped/paused | N/A |
| 1.4.3 Contrast (Minimum) | 4.5:1 contrast for normal text | Design token enforcement |
| 1.4.4 Resize Text | Text can be resized to 200% | Relative units (rem) |
| 1.4.5 Images of Text | Text used instead of images | N/A |
| 1.4.10 Reflow | Content reflows at 320px | Responsive design |
| 1.4.11 Non-text Contrast | 3:1 contrast for UI components | Design token enforcement |
| 1.4.12 Text Spacing | Text spacing can be overridden | No fixed heights |
| 1.4.13 Content on Hover/Focus | Dismissible, hoverable, persistent | Tooltip implementation |

**Checklist:**
- [ ] All text meets 4.5:1 contrast ratio (3:1 for large text)
- [ ] UI components meet 3:1 contrast ratio
- [ ] Error states have icon + text, not just red color
- [ ] Success states have icon + text, not just green color
- [ ] Text uses relative units (rem, em)
- [ ] Layout is responsive down to 320px
- [ ] Tooltips can be dismissed with Escape key

```typescript
// ✅ Good - Error with icon and text
<div className="flex items-center gap-2 text-red-600">
  <Icon name="error" aria-hidden="true" />
  <span>Please enter a valid email address</span>
</div>

// ❌ Bad - Color only
<span className="text-red-600">Invalid input</span>
```

---

## 4. Operable

### 4.1 Keyboard Accessible (2.1)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.1.1 Keyboard | All functionality available via keyboard | Tab navigation, keyboard handlers |
| 2.1.2 No Keyboard Trap | Focus can be moved away from element | Proper focus management |
| 2.1.4 Character Key Shortcuts | Shortcuts can be turned off/remapped | Configurable shortcuts |

**Checklist:**
- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within components (menus, tabs)
- [ ] Escape closes modals, dropdowns
- [ ] Focus trap in modals (Tab cycles within modal)
- [ ] Focus returns to trigger when modal closes

```typescript
// ✅ Good - Keyboard accessible button
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Submit
</button>
```

### 4.2 Enough Time (2.2)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.2.1 Timing Adjustable | Time limits can be extended | Session timeout warnings |
| 2.2.2 Pause, Stop, Hide | Moving content can be controlled | Auto-refresh can be paused |

### 4.3 Seizures and Physical Reactions (2.3)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.3.1 Three Flashes or Below | No content flashes >3 times/second | No flashing animations |

### 4.4 Navigable (2.4)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.4.1 Bypass Blocks | Skip links provided | Skip to main content |
| 2.4.2 Page Titled | Pages have descriptive titles | DocumentTitle component |
| 2.4.3 Focus Order | Focus order is logical | DOM order = tab order |
| 2.4.4 Link Purpose (In Context) | Link text describes purpose | Descriptive link text |
| 2.4.5 Multiple Ways | Multiple ways to find pages | Navigation, search |
| 2.4.6 Headings and Labels | Descriptive headings and labels | Clear, concise labels |
| 2.4.7 Focus Visible | Focus indicator is visible | 2px outline on focus |

**Checklist:**
- [ ] Skip link is first focusable element
- [ ] Page titles are descriptive and unique
- [ ] Focus indicator has 3:1 contrast
- [ ] Focus indicator is at least 2px
- [ ] Link text describes destination (not "click here")
- [ ] Headings describe content that follows

```typescript
// ✅ Good - Descriptive link
<a href="/pricing">View pricing plans</a>

// ❌ Bad - Non-descriptive link
<a href="/pricing">Click here</a>
```

### 4.5 Input Modalities (2.5)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 2.5.1 Pointer Gestures | Gestures have single-pointer alternative | Drag has keyboard alternative |
| 2.5.2 Pointer Cancellation | Action on up-event, not down | onClick, not onMouseDown |
| 2.5.3 Label in Name | Visible label matches accessible name | aria-label includes visible text |
| 2.5.4 Motion Actuation | Motion can be disabled | Shake to undo can be turned off |

---

## 5. Understandable

### 5.1 Readable (3.1)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.1.1 Language of Page | Default language identified | `lang` attribute on html |
| 3.1.2 Language of Parts | Language changes identified | `lang` attribute on foreign text |

### 5.2 Predictable (3.2)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.2.1 On Focus | Focus doesn't trigger context change | No auto-submission on focus |
| 3.2.2 On Input | Input doesn't trigger context change | Explicit submit button |
| 3.2.3 Consistent Navigation | Navigation is consistent | Same nav on all pages |
| 3.2.4 Consistent Identification | Components identified consistently | Same icon = same action |

### 5.3 Input Assistance (3.3)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 3.3.1 Error Identification | Errors clearly identified | Error message near field |
| 3.3.2 Labels or Instructions | Labels/instructions provided | Clear form labels |
| 3.3.3 Error Suggestion | Suggestions for error correction | "Did you mean...?" |
| 3.3.4 Error Prevention | Review/correct before submission | Confirmation for destructive actions |

**Checklist:**
- [ ] Error messages are specific ("Email is required" not "Invalid input")
- [ ] Error messages suggest corrections
- [ ] Required fields are clearly marked
- [ ] Form validation happens on submit, not on blur
- [ ] Destructive actions have confirmation

```typescript
// ✅ Good - Helpful error message
<div className="text-red-600">
  <Icon name="error" />
  <span>Please enter a valid email address (e.g., user@example.com)</span>
</div>

// ❌ Bad - Vague error
<span className="text-red-600">Error</span>
```

---

## 6. Robust

### 6.1 Compatible (4.1)

| Guideline | Requirement | Implementation |
|-----------|-------------|----------------|
| 4.1.1 Parsing | Valid HTML markup | Linting, validation |
| 4.1.2 Name, Role, Value | Components have name, role, value | Proper ARIA attributes |
| 4.1.3 Status Messages | Status messages announced | aria-live regions |

**Checklist:**
- [ ] HTML validates without errors
- [ ] Custom components have proper ARIA roles
- [ ] Dynamic content updates are announced
- [ ] Loading states are announced
- [ ] Error alerts use `aria-live="assertive"`

```typescript
// ✅ Good - Live region for status
<div aria-live="polite" aria-atomic="true">
  {statusMessage && <span>{statusMessage}</span>}
</div>

// ✅ Good - Loading announcement
<div aria-live="polite">
  <span className="sr-only">Loading user data</span>
  <Spinner aria-hidden="true" />
</div>
```

---

## 7. Component-Specific Checklists

### 7.1 Button

- [ ] Has accessible name (text content or aria-label)
- [ ] Activates with Enter and Space
- [ ] Has focus indicator
- [ ] Disabled state is programmatic

### 7.2 Input

- [ ] Has associated label
- [ ] Has correct type attribute
- [ ] Required state is indicated
- [ ] Error message is associated (aria-describedby)

### 7.3 Modal/Dialog

- [ ] Has aria-labelledby pointing to title
- [ ] Focus trap within modal
- [ ] Closes with Escape
- [ ] Focus returns to trigger on close
- [ ] Background is inert (aria-hidden)

### 7.4 Data Table

- [ ] Has `<caption>` or aria-label
- [ ] Headers use `<th>` with scope
- [ ] Sortable columns indicate sort state
- [ ] Responsive (horizontal scroll or card view)

### 7.5 Navigation

- [ ] Uses `<nav>` or role="navigation"
- [ ] Current page indicated (aria-current)
- [ ] Dropdowns open with Enter/Space
- [ ] Dropdown items navigable with arrows

---

## 8. Testing

### 8.1 Automated Testing

```bash
# Run axe-core tests
npm run test:a11y

# Run Lighthouse CI
npm run lighthouse

# Run pa11y
npm run pa11y
```

### 8.2 Manual Testing

| Tool | Purpose |
|------|---------|
| Keyboard only | Navigate entire app without mouse |
| Screen reader | NVDA, VoiceOver, JAWS |
| Browser devtools | Lighthouse a11y audit |
| WAVE extension | Visual a11y indicators |

### 8.3 Testing Checklist

- [ ] Navigate entire app with keyboard only
- [ ] Test with screen reader
- [ ] Run automated a11y tests
- [ ] Check color contrast
- [ ] Verify focus indicators
- [ ] Test with zoomed text (200%)
- [ ] Test on mobile with screen reader

---

## 9. Related Documents

- [Component Development Guidelines](./Component_Development_Guidelines.md)
- [Design Token & Theming Specification](./Design_Token_Theming_Specification.md)
- [I18n & RTL Implementation Guide](./I18n_RTL_Implementation_Guide.md)

---

## 10. Resources

- [WCAG 2.1 Specification](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-04-10 | Accessibility Team | Initial release |
