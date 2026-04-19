/**
 * EnhancedNextActionCard Usage Examples
 *
 * Demonstrates all severity variants and signal types for the enhanced Next Action card.
 */

import { EnhancedNextActionCard } from './EnhancedNextActionCard';

export function EnhancedNextActionCardExamples() {
  return (
    <div className="space-y-8 p-8 bg-bg-app max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Next Action Card Examples</h2>
        <p className="text-sm text-text-secondary mb-6">
          Showcasing different severity levels and signal combinations
        </p>
      </div>

      {/* Normal Variant */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">Normal</h3>
        <EnhancedNextActionCard
          severity="normal"
          title="Schedule home inspection"
          subtitle="Due in 2 days"
          signals={[
            { type: 'due-soon', count: 3 },
          ]}
          primaryAction={{
            label: 'Schedule Now',
            onClick: () => console.log('Schedule clicked'),
          }}
          secondaryAction={{
            label: 'View Task',
            onClick: () => console.log('View clicked'),
          }}
        />
      </div>

      {/* Warning Variant */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">Warning</h3>
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
            onClick: () => console.log('Send reminder clicked'),
          }}
          secondaryAction={{
            label: 'View Document',
            onClick: () => console.log('View document clicked'),
          }}
        />
      </div>

      {/* Critical Variant */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">Critical</h3>
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
            onClick: () => console.log('Request signature clicked'),
          }}
          secondaryAction={{
            label: 'Contact Buyer',
            onClick: () => console.log('Contact buyer clicked'),
          }}
        />
      </div>

      {/* Multiple Signals Example */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">
          Multiple Signals
        </h3>
        <EnhancedNextActionCard
          severity="warning"
          title="Complete final walkthrough"
          subtitle="Scheduled for tomorrow at 2 PM"
          signals={[
            { type: 'overdue', count: 2 },
            { type: 'due-soon', count: 5 },
            { type: 'awaiting-signature', count: 1 },
            { type: 'waiting-on', personName: 'James Wilson' },
          ]}
          primaryAction={{
            label: 'Confirm Attendance',
            onClick: () => console.log('Confirm clicked'),
          }}
          secondaryAction={{
            label: 'Reschedule',
            onClick: () => console.log('Reschedule clicked'),
          }}
        />
      </div>

      {/* No Actions Example */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">
          Informational Only
        </h3>
        <EnhancedNextActionCard
          severity="normal"
          title="Appraisal scheduled"
          subtitle="Inspector will arrive on Friday at 10 AM"
          signals={[
            { type: 'waiting-on', personName: 'Appraiser' },
          ]}
        />
      </div>

      {/* Minimal Example */}
      <div>
        <h3 className="text-sm font-medium text-text-muted mb-3 uppercase tracking-wide">Minimal</h3>
        <EnhancedNextActionCard
          severity="normal"
          title="Review title search results"
          primaryAction={{
            label: 'Review Now',
            onClick: () => console.log('Review clicked'),
          }}
        />
      </div>
    </div>
  );
}

// Individual examples for direct use
export function Example_Normal() {
  return (
    <EnhancedNextActionCard
      severity="normal"
      title="Schedule home inspection"
      subtitle="Due in 2 days"
      signals={[{ type: 'due-soon', count: 3 }]}
      primaryAction={{
        label: 'Schedule Now',
        onClick: () => {},
      }}
      secondaryAction={{
        label: 'View Task',
        onClick: () => {},
      }}
    />
  );
}

export function Example_Warning() {
  return (
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
        onClick: () => {},
      }}
      secondaryAction={{
        label: 'View Document',
        onClick: () => {},
      }}
    />
  );
}

export function Example_Critical() {
  return (
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
        onClick: () => {},
      }}
      secondaryAction={{
        label: 'Contact Buyer',
        onClick: () => {},
      }}
    />
  );
}
