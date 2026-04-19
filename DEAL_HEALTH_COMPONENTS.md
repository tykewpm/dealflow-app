# Deal Health & Risk Detection Components

A comprehensive UI layer for surfacing issues, tracking risks, and maintaining deal health in the TransactQ real estate transaction management app.

## Overview

This system provides clean, actionable components for detecting and displaying:
- Missing documents
- Signature delays
- Overdue tasks
- Closing risks
- Document priority states
- Overall deal health status

## Components

### 1. DealHealthBadge

A reusable badge component for displaying deal health status.

**Location:** `/src/app/components/shared/DealHealthBadge.tsx`

**Props:**
- `status: DealHealthStatus` - One of: `'on-track'`, `'needs-attention'`, `'at-risk'`
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: `'md'`)
- `showIcon?: boolean` - Whether to show the status icon (default: `true`)

**Example:**
```tsx
import { DealHealthBadge } from './components/shared/DealHealthBadge';

<DealHealthBadge status="needs-attention" size="md" />
<DealHealthBadge status="on-track" size="sm" showIcon={false} />
```

**Variants:**
- **On Track** - Green badge with checkmark icon
- **Needs Attention** - Amber badge with alert circle icon
- **At Risk** - Red badge with warning triangle icon

---

### 2. RiskAlertCard

A reusable alert card for displaying critical, warning, or informational issues.

**Location:** `/src/app/components/shared/RiskAlertCard.tsx`

**Props:**
- `alert: RiskAlert` - Alert object containing:
  - `id: string` - Unique identifier
  - `type: RiskType` - Type of risk
  - `severity: RiskSeverity` - Severity level
  - `title: string` - Alert title
  - `explanation: string` - Detailed explanation
  - `primaryAction?: { label: string; onClick: () => void }` - Main action button
  - `secondaryAction?: { label: string; onClick: () => void }` - Secondary action button

**Risk Types:**
- `'missing-document'` - Documents not uploaded
- `'signature-delay'` - Signatures overdue
- `'overdue-task'` - Tasks past deadline
- `'closing-risk'` - Issues affecting closing
- `'deadline-approaching'` - Upcoming deadlines

**Severity Levels:**
- `'critical'` - Red styling, urgent action required
- `'warning'` - Amber styling, attention needed
- `'info'` - Blue styling, informational

**Example:**
```tsx
import { RiskAlertCard } from './components/shared/RiskAlertCard';

const alert = {
  id: 'risk-1',
  type: 'signature-delay',
  severity: 'critical',
  title: 'Purchase Agreement Signature Overdue',
  explanation: 'Buyer signatures pending for 48 hours.',
  primaryAction: {
    label: 'Send Reminder',
    onClick: () => sendReminder(),
  },
  secondaryAction: {
    label: 'View Document',
    onClick: () => viewDocument(),
  },
};

<RiskAlertCard alert={alert} />
```

---

### 3. DealHealthSummaryRow

An inline summary row showing key deal health metrics.

**Location:** `/src/app/components/shared/DealHealthSummaryRow.tsx`

**Props:**
- `summary: DealHealthSummary` - Summary object containing:
  - `status: DealHealthStatus` - Overall deal status
  - `totalIssues: number` - Count of detected issues
  - `awaitingSignature: number` - Count of pending signatures
  - `dueSoon: number` - Count of items due soon
  - `waitingOn?: { name: string; role: string }` - Optional person being waited on

**Example:**
```tsx
import { DealHealthSummaryRow } from './components/shared/DealHealthSummaryRow';

const summary = {
  status: 'needs-attention',
  totalIssues: 2,
  awaitingSignature: 1,
  dueSoon: 3,
  waitingOn: {
    name: 'Emily Rodriguez',
    role: 'Transaction Coordinator',
  },
};

<DealHealthSummaryRow summary={summary} />
```

**Displays:**
- ⚠️ Issues detected (if any)
- ✍️ Awaiting signature count (if any)
- ⏳ Due soon count (if any)
- 👤 Waiting on person (if applicable)

---

### 4. DocumentPriorityLabel

Labels for showing document priority states.

**Location:** `/src/app/components/shared/DocumentPriorityLabel.tsx`

**Props:**
- `priority: DocumentPriority` - One of: `'blocking'`, `'needs-attention'`, `'on-track'`
- `subtext?: string` - Optional custom subtext (uses default if not provided)
- `compact?: boolean` - Compact inline badge mode (default: `false`)

**Priority Levels:**
- **Blocking** - Red, prevents closing
- **Needs Attention** - Amber, action required soon
- **On Track** - Green, no issues

**Example:**
```tsx
import { DocumentPriorityLabel } from './components/shared/DocumentPriorityLabel';

// Full size with default subtext
<DocumentPriorityLabel priority="blocking" />

// Custom subtext
<DocumentPriorityLabel 
  priority="needs-attention" 
  subtext="Signatures due by end of day"
/>

// Compact inline badge
<DocumentPriorityLabel priority="on-track" compact />
```

---

## Type Definitions

**Location:** `/src/app/types/dealHealth.ts`

```typescript
export type DealHealthStatus = 'on-track' | 'needs-attention' | 'at-risk';

export type RiskSeverity = 'critical' | 'warning' | 'info';

export type RiskType =
  | 'missing-document'
  | 'signature-delay'
  | 'overdue-task'
  | 'closing-risk'
  | 'deadline-approaching';

export type DocumentPriority = 'blocking' | 'needs-attention' | 'on-track';
```

---

## Mock Data

**Location:** `/src/app/data/dealHealthData.ts`

Sample data for testing and development:
- `mockDealHealthSummary` - Example health summary
- `mockRiskAlerts` - Array of sample risk alerts

---

## Demo Page

A comprehensive showcase of all deal health components.

**URL:** `/demo/deal-health`

**Location:** `/src/app/components/demo/DealHealthDemo.tsx`

The demo page includes:
1. Deal Health Summary Row examples
2. Health Badge System in all sizes
3. Risk Alert Cards (all severities)
4. Document Priority Labels (full and compact)
5. Document list integration example
6. Full integration example

---

## Integration Examples

### In a Deal Detail Page Header

```tsx
<div className="border-b border-border-subtle px-6 py-5">
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="font-semibold text-text-primary">{deal.address}</h3>
      <p className="text-sm text-text-secondary">
        Buyer: {deal.buyer} • Seller: {deal.seller}
      </p>
    </div>
    <DealHealthBadge status={dealHealth.status} />
  </div>
  <DealHealthSummaryRow summary={dealHealth} />
</div>
```

### In a Document List

```tsx
<tr>
  <td>{document.name}</td>
  <td>{document.status}</td>
  <td>
    <DocumentPriorityLabel 
      priority={document.priority} 
      compact 
    />
  </td>
</tr>
```

### With Risk Alerts

```tsx
<div className="space-y-3">
  {riskAlerts.map(alert => (
    <RiskAlertCard key={alert.id} alert={alert} />
  ))}
</div>
```

---

## Design Principles

✅ **Strong hierarchy** - Clear visual distinction between severity levels
✅ **Actionable** - Every alert includes relevant actions
✅ **Lightweight** - Components are small and reusable
✅ **Consistent** - Follows Linear/Notion design patterns
✅ **Trustworthy** - Clean, professional styling that inspires confidence

---

## Color System

### Health Status Colors
- **On Track:** `bg-accent-green-soft`, `text-accent-green`, `border-border-subtle`
- **Needs Attention:** `bg-accent-amber-soft`, `text-accent-amber`, `border-border-subtle`
- **At Risk:** `bg-accent-red-soft`, `text-accent-red`, `border-border-subtle`

### Severity Colors
- **Critical:** `bg-accent-red-soft`, `border-border-subtle`, accents via `text-accent-red` / primary actions on `bg-accent-red`
- **Warning:** `bg-accent-amber-soft`, `border-border-subtle`, `text-accent-amber`
- **Info:** `bg-accent-blue-soft`, `border-border-subtle`, `text-accent-blue`

---

## Best Practices

1. **Use appropriate severity levels** - Reserve `critical` for blocking issues only
2. **Provide clear actions** - Always include actionable next steps
3. **Keep explanations concise** - 1-2 sentences maximum
4. **Update in real-time** - Health status should reflect current state
5. **Don't overuse alerts** - Only surface genuinely important issues
6. **Use compact labels in tables** - Keeps rows scannable
7. **Combine components thoughtfully** - Health badge + summary row works well together

---

## Future Enhancements

Potential additions to the system:
- Auto-detection logic for document priorities
- Health score calculation algorithms
- Historical health tracking
- Configurable alert thresholds
- Email/SMS notification integration
- Custom risk types per workflow

---

## Support

For questions or issues with these components, please refer to the demo page at `/demo/deal-health` or check the component source files for implementation details.
