import { DealHealthBadge } from '../shared/DealHealthBadge';
import { RiskAlertCard } from '../shared/RiskAlertCard';
import { DealHealthSummaryRow } from '../shared/DealHealthSummaryRow';
import { DocumentPriorityLabel } from '../shared/DocumentPriorityLabel';
import { mockDealHealthSummary, mockRiskAlerts } from '../../data/dealHealthData';

export function DealHealthDemo() {
  return (
    <div className="min-h-screen bg-bg-app">
      <div className="max-w-[1440px] mx-auto px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-text-primary mb-2">Deal Health & Risk Detection</h1>
          <p className="text-text-secondary">
            Components for surfacing issues, tracking risks, and maintaining deal health
          </p>
        </div>

        {/* Deal Health Summary Row */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Deal Health Summary Row</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
            <div className="mb-4">
              <h3 className="font-medium text-text-primary mb-2">742 Evergreen Terrace</h3>
              <p className="text-sm text-text-secondary mb-3">
                Buyer: Homer Simpson • Seller: Ned Flanders
              </p>
            </div>
            <DealHealthSummaryRow summary={mockDealHealthSummary} />
          </div>
        </section>

        {/* Health Badge System */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Health Badge System</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
            <div className="space-y-6">
              {/* Small */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Small (sm)</div>
                <div className="flex flex-wrap items-center gap-3">
                  <DealHealthBadge status="on-track" size="sm" />
                  <DealHealthBadge status="needs-attention" size="sm" />
                  <DealHealthBadge status="at-risk" size="sm" />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Medium (md) - Default</div>
                <div className="flex flex-wrap items-center gap-3">
                  <DealHealthBadge status="on-track" size="md" />
                  <DealHealthBadge status="needs-attention" size="md" />
                  <DealHealthBadge status="at-risk" size="md" />
                </div>
              </div>

              {/* Large */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Large (lg)</div>
                <div className="flex flex-wrap items-center gap-3">
                  <DealHealthBadge status="on-track" size="lg" />
                  <DealHealthBadge status="needs-attention" size="lg" />
                  <DealHealthBadge status="at-risk" size="lg" />
                </div>
              </div>

              {/* Without Icons */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Without Icons</div>
                <div className="flex flex-wrap items-center gap-3">
                  <DealHealthBadge status="on-track" showIcon={false} />
                  <DealHealthBadge status="needs-attention" showIcon={false} />
                  <DealHealthBadge status="at-risk" showIcon={false} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Risk Alert Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Risk Alert Cards</h2>
          <div className="space-y-4">
            {mockRiskAlerts.map(alert => (
              <RiskAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </section>

        {/* Document Priority Labels */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Document Priority Labels</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
            <div className="space-y-6">
              {/* Full Size */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Full Size (with subtext)</div>
                <div className="grid grid-cols-3 gap-4">
                  <DocumentPriorityLabel priority="blocking" />
                  <DocumentPriorityLabel priority="needs-attention" />
                  <DocumentPriorityLabel priority="on-track" />
                </div>
              </div>

              {/* Custom Subtext */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Custom Subtext</div>
                <div className="grid grid-cols-3 gap-4">
                  <DocumentPriorityLabel
                    priority="blocking"
                    subtext="Closing cannot proceed without this"
                  />
                  <DocumentPriorityLabel
                    priority="needs-attention"
                    subtext="Signatures due by end of day"
                  />
                  <DocumentPriorityLabel
                    priority="on-track"
                    subtext="All requirements met"
                  />
                </div>
              </div>

              {/* Compact */}
              <div>
                <div className="text-sm font-medium text-text-secondary mb-3">Compact (inline badges)</div>
                <div className="flex flex-wrap items-center gap-3">
                  <DocumentPriorityLabel priority="blocking" compact />
                  <DocumentPriorityLabel priority="needs-attention" compact />
                  <DocumentPriorityLabel priority="on-track" compact />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Document List Example with Priority States */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Document List with Priority States</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-bg-app border-b border-border-subtle">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
                    Document
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr className="hover:bg-bg-app">
                  <td className="px-5 py-4">
                    <div className="font-medium text-text-primary">Purchase Agreement</div>
                    <div className="text-sm text-text-muted">Awaiting buyer signature</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-blue-soft text-accent-blue border border-border-subtle rounded-md text-xs font-medium">
                      Awaiting Signature
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <DocumentPriorityLabel priority="blocking" compact />
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-text-primary">Apr 18, 2026</div>
                  </td>
                </tr>

                <tr className="hover:bg-bg-app">
                  <td className="px-5 py-4">
                    <div className="font-medium text-text-primary">Home Inspection Report</div>
                    <div className="text-sm text-text-muted">Pending upload</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-app text-text-secondary border border-border-subtle rounded-md text-xs font-medium">
                      Not Started
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <DocumentPriorityLabel priority="needs-attention" compact />
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-text-primary">Apr 20, 2026</div>
                  </td>
                </tr>

                <tr className="hover:bg-bg-app">
                  <td className="px-5 py-4">
                    <div className="font-medium text-text-primary">Title Commitment</div>
                    <div className="text-sm text-text-muted">Signed and uploaded</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-green-soft text-accent-green border border-border-subtle rounded-md text-xs font-medium">
                      Completed
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <DocumentPriorityLabel priority="on-track" compact />
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-text-primary">Apr 15, 2026</div>
                  </td>
                </tr>

                <tr className="hover:bg-bg-app">
                  <td className="px-5 py-4">
                    <div className="font-medium text-text-primary">Appraisal Report</div>
                    <div className="text-sm text-text-muted">In progress</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-blue-soft text-accent-blue border border-border-subtle rounded-md text-xs font-medium">
                      Requested
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <DocumentPriorityLabel priority="needs-attention" compact />
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-text-primary">Apr 22, 2026</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Integration Example */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Full Integration Example</h2>
          <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
            {/* Header with Health Badge */}
            <div className="border-b border-border-subtle px-6 py-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary mb-1">742 Evergreen Terrace</h3>
                  <p className="text-sm text-text-secondary">
                    Buyer: Homer Simpson • Seller: Ned Flanders
                  </p>
                </div>
                <DealHealthBadge status="needs-attention" size="md" />
              </div>
              <DealHealthSummaryRow summary={mockDealHealthSummary} />
            </div>

            {/* Risk Alerts */}
            <div className="p-6 space-y-3 bg-bg-app">
              <RiskAlertCard alert={mockRiskAlerts[0]} />
              <RiskAlertCard alert={mockRiskAlerts[1]} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
