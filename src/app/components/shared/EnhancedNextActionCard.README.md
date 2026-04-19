# Enhanced Next Action Card

A reusable card component that intelligently surfaces the single most important next step for a real estate transaction. Designed to make the app feel smart, actionable, and easy to use.

## Design Philosophy

- **Single focus**: Shows one action only, not multiple competing priorities
- **Clear hierarchy**: Title → Subtitle → Signals → Actions
- **Controlled severity**: Visual urgency without being alarming
- **Actionable**: Always provides clear next steps
- **Reusable**: Works across deal detail, dashboard, and pipeline views

## Severity Variants

### Normal (Blue)
**When to use**: Regular tasks that are on track

**Example use cases**:
- Upcoming tasks with comfortable timeline
- Scheduled events
- Standard workflow steps

```tsx
<EnhancedNextActionCard
  severity="normal"
  title="Schedule home inspection"
  subtitle="Due in 2 days"
  signals={[{ type: 'due-soon', count: 3 }]}
  primaryAction={{
    label: 'Schedule Now',
    onClick: handleSchedule,
  }}
/>
```

### Warning (Amber)
**When to use**: Tasks that need attention but aren't critical yet

**Example use cases**:
- Required documents incomplete
- Tasks approaching deadlines
- Waiting on external parties
- Multiple items needing attention

```tsx
<EnhancedNextActionCard
  severity="warning"
  title="Request Seller Disclosure"
  subtitle="Required document still incomplete"
  signals={[
    { type: 'awaiting-signature', count: 2 },
    { type: 'waiting-on', personName: 'Sarah Martinez' },
  ]}
  primaryAction={{
    label: 'Send Reminder',
    onClick: handleReminder,
  }}
/>
```

### Critical (Red)
**When to use**: Urgent tasks that may block progress or delay closing

**Example use cases**:
- Overdue tasks
- Last-minute requirements before closing
- Tasks that may cause delays
- Critical document signatures needed

```tsx
<EnhancedNextActionCard
  severity="critical"
  title="Closing Disclosure needs signature"
  subtitle="Closing in 1 day"
  urgencyNote="This may delay closing"
  signals={[
    { type: 'overdue', count: 1 },
    { type: 'awaiting-signature', count: 1 },
  ]}
  primaryAction={{
    label: 'Request Signature',
    onClick: handleSignatureRequest,
  }}
/>
```

## Secondary Signals

Signals provide contextual awareness without cluttering the main action.

### Available Signal Types

| Signal Type | Icon | Color | When to Use |
|------------|------|-------|-------------|
| `overdue` | ⚠️ AlertTriangle | Red | Tasks past their due date |
| `due-soon` | ⏱️ Clock | Amber | Tasks due within 48 hours |
| `awaiting-signature` | 📝 FileText | Purple | Documents pending signature |
| `waiting-on` | 👤 User | Gray | Blocked by external party |

### Signal Examples

```tsx
// Single signal
signals={[
  { type: 'overdue', count: 1 }
]}

// Multiple signals
signals={[
  { type: 'overdue', count: 2 },
  { type: 'due-soon', count: 5 },
  { type: 'awaiting-signature', count: 1 },
  { type: 'waiting-on', personName: 'James Wilson' },
]}
```

## Props API

```typescript
interface NextActionCardProps {
  // Main content
  title: string;                    // Primary action description
  subtitle?: string;                 // Additional context
  urgencyNote?: string;              // Critical warning message

  // Severity
  severity?: 'normal' | 'warning' | 'critical';

  // Secondary signals
  signals?: SecondarySignal[];

  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

interface SecondarySignal {
  type: 'overdue' | 'due-soon' | 'awaiting-signature' | 'waiting-on';
  count?: number;        // For overdue, due-soon, awaiting-signature
  personName?: string;   // For waiting-on
}
```

## Usage Guidelines

### ✅ Do

- Show one action only
- Use severity appropriately (most actions should be "normal")
- Include relevant signals for context
- Provide clear, actionable button labels
- Use urgencyNote sparingly (critical items only)

### ❌ Don't

- Show multiple competing actions
- Overuse "critical" severity
- Add too many signals (4 max recommended)
- Use vague button labels like "OK" or "Continue"
- Include signals that aren't relevant to the action

## Integration Examples

### With Deal Detail Page

```tsx
function DealDetailPage({ deal, tasks, documents }) {
  const nextAction = determineNextAction(deal, tasks, documents);
  
  return (
    <div>
      <DealHeader deal={deal} />
      
      <EnhancedNextActionCard
        severity={nextAction.severity}
        title={nextAction.title}
        subtitle={nextAction.subtitle}
        urgencyNote={nextAction.urgencyNote}
        signals={nextAction.signals}
        primaryAction={{
          label: nextAction.primaryLabel,
          onClick: () => handlePrimaryAction(nextAction),
        }}
        secondaryAction={{
          label: 'View All Tasks',
          onClick: () => setActiveTab('tasks'),
        }}
      />
      
      <TaskList tasks={tasks} />
    </div>
  );
}
```

### With Dashboard Grid

```tsx
function DashboardGrid({ deals }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {deals.map(deal => (
        <EnhancedNextActionCard
          key={deal.id}
          severity={getNextActionSeverity(deal)}
          title={getNextActionTitle(deal)}
          subtitle={deal.propertyAddress}
          signals={getNextActionSignals(deal)}
          primaryAction={{
            label: 'Take Action',
            onClick: () => navigate(`/deals/${deal.id}`),
          }}
        />
      ))}
    </div>
  );
}
```

## Styling

The component uses an 8pt spacing system and follows Linear/Notion design principles:

- **Spacing**: Consistent 8pt grid (mb-3, p-5, gap-4)
- **Borders**: Subtle 2px borders with severity-based colors
- **Elevation**: Light shadow with hover enhancement
- **Typography**: Clear hierarchy (semibold titles, regular body)
- **Colors**: Controlled severity palette (blue/amber/red)

## Accessibility

- Semantic HTML structure
- Clear color contrast ratios
- Icon + text for all signals (not icon-only)
- Keyboard-accessible buttons
- Screen reader friendly
