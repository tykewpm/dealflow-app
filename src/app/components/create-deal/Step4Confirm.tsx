import { DocumentDraft, TaskDraft } from './Step3ReviewTasks';
import { formatDate } from '../../utils/dealUtils';

interface Step4ConfirmProps {
  propertyAddress: string;
  closingDate: string;
  buyerName: string;
  sellerName: string;
  tasks: TaskDraft[];
  documents: DocumentDraft[];
  onCreateDeal: () => void;
  onBack: () => void;
}

export function Step4Confirm({
  propertyAddress,
  closingDate,
  buyerName,
  sellerName,
  tasks,
  documents,
  onCreateDeal,
  onBack,
}: Step4ConfirmProps) {
  // Calculate at-risk tasks (due within 3 days)
  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const atRiskTasks = tasks.filter((task) => {
    const dueDate = new Date(task.dueDate);
    return dueDate <= threeDaysFromNow && dueDate >= now;
  });

  const namedDocuments = documents.filter((d) => d.name.trim().length > 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-text-muted mb-2">Step 4 of 4</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create deal</h1>
        <p className="text-text-secondary">Confirm everything looks good before saving</p>
      </div>

      {/* Deal Summary Card */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-8 mb-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-6 uppercase tracking-wide">
          Deal Summary
        </h3>

        <div className="space-y-4">
          {/* Property Address */}
          <div className="flex items-start justify-between py-3 border-b border-border-subtle">
            <div className="text-sm text-text-secondary">Property Address</div>
            <div className="text-right font-medium text-text-primary max-w-md">
              {propertyAddress}
            </div>
          </div>

          {/* Closing Date */}
          <div className="flex items-start justify-between py-3 border-b border-border-subtle">
            <div className="text-sm text-text-secondary">Closing Date</div>
            <div className="text-right font-medium text-text-primary">
              {formatDate(closingDate)}
            </div>
          </div>

          {/* Buyer */}
          <div className="flex items-start justify-between py-3 border-b border-border-subtle">
            <div className="text-sm text-text-secondary">Buyer</div>
            <div className="text-right font-medium text-text-primary">{buyerName}</div>
          </div>

          {/* Seller */}
          <div className="flex items-start justify-between py-3 border-b border-border-subtle">
            <div className="text-sm text-text-secondary">Seller</div>
            <div className="text-right font-medium text-text-primary">{sellerName}</div>
          </div>

          {/* Tasks */}
          <div className="flex items-start justify-between py-3 border-b border-border-subtle">
            <div className="text-sm text-text-secondary">Tasks</div>
            <div className="text-right font-medium text-text-primary">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          {/* Documents */}
          <div className="flex items-start justify-between py-3">
            <div className="text-sm text-text-secondary">Documents</div>
            <div className="text-right font-medium text-text-primary">
              {namedDocuments.length} {namedDocuments.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </div>

      {namedDocuments.length > 0 && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">Documents</h3>
          <ul className="space-y-2 text-sm text-text-primary">
            {namedDocuments.map((d) => (
              <li key={d.id} className="flex justify-between gap-4 border-b border-border-subtle last:border-0 pb-2 last:pb-0">
                <span>{d.name}</span>
                <span className="text-text-muted flex-shrink-0">{d.signatureRequired ? 'Signature' : '—'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* At-Risk Warning */}
      {atRiskTasks.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-accent-amber-soft border border-border-subtle rounded-xl mb-6">
          <svg className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold text-text-primary mb-1">
              {atRiskTasks.length} {atRiskTasks.length === 1 ? 'task' : 'tasks'} due within 3 days
            </div>
            <div className="text-sm text-text-secondary">
              Make sure you're ready to tackle {atRiskTasks.length === 1 ? 'this' : 'these'} right away
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 text-text-secondary hover:bg-bg-elevated/50 rounded-xl transition-colors font-medium"
        >
          ← Back
        </button>
        <button
          onClick={onCreateDeal}
          className="px-8 py-3 bg-accent-blue text-white rounded-xl hover:brightness-110 transition-colors font-semibold shadow-sm hover:shadow-md"
        >
          Create Deal
        </button>
      </div>
    </div>
  );
}
