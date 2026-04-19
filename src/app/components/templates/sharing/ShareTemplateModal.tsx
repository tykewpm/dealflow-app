import { useState } from 'react';
import { TransactionTemplate } from '../../../types/template';
import { isBuiltInTemplateId } from '../../../data/templateData';
import { isPersistedUserTemplate } from '../../../data/userTemplatesStorage';
import { X, Users, Link as LinkIcon, Globe, Check, Mail } from 'lucide-react';
import { Button } from '../../ui/button';

interface ShareTemplateModalProps {
  template: TransactionTemplate;
  onClose: () => void;
}

type ShareAccessLevel = 'view-only' | 'duplicate';

/** What the share modal should explain — URLs unchanged; copy only. */
export type ShareTemplateOrigin = 'built-in' | 'convex-custom' | 'local-custom';

export function classifyShareTemplateOrigin(template: TransactionTemplate): ShareTemplateOrigin {
  if (isBuiltInTemplateId(template.id)) return 'built-in';
  if (template.id.startsWith('user-') || isPersistedUserTemplate(template.id)) {
    return 'local-custom';
  }
  return 'convex-custom';
}

export function ShareTemplateModal({ template, onClose }: ShareTemplateModalProps) {
  const [accessLevel, setAccessLevel] = useState<ShareAccessLevel>('duplicate');
  const [linkCopied, setLinkCopied] = useState(false);
  const [internalLinkCopied, setInternalLinkCopied] = useState(false);

  const shareOrigin = classifyShareTemplateOrigin(template);

  const shareUrl = `${window.location.origin}/shared/templates/${template.id}`;
  const internalUrl = `${window.location.origin}/templates/${template.id}/edit`;

  const shareLinkIntro: Record<ShareTemplateOrigin, string> = {
    'built-in':
      'This is a built-in template shipped with the app. The link works for anyone using this same TransactQ build who opens it.',
    'convex-custom':
      'This template is saved in your workspace database. The link works for people using this app against the same Convex backend (for example the same deployment as you). It is not a worldwide public link.',
    'local-custom':
      'This template exists only in this browser’s storage. The share link will not work on other devices or browsers until the template is stored in your workspace (Convex) backend.',
  };

  const internalLinkHint: Record<ShareTemplateOrigin, string> = {
    'built-in': 'Opens in the template builder for this app build.',
    'convex-custom': 'Opens in the builder for users on the same Convex workspace.',
    'local-custom': 'Only works in this browser until the template is saved to the workspace backend.',
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyInternalLink = () => {
    navigator.clipboard.writeText(internalUrl);
    setInternalLinkCopied(true);
    setTimeout(() => setInternalLinkCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border-subtle bg-bg-surface shadow-xl dark:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
          <div className="flex-1 pr-4">
            <h2 className="mb-1 font-semibold text-text-primary">Share Template</h2>
            <p className="text-sm text-text-secondary">
              Share “{template.name}” —{' '}
              {shareOrigin === 'built-in' && 'built-in template'}
              {shareOrigin === 'convex-custom' && 'workspace-saved template'}
              {shareOrigin === 'local-custom' && 'browser-only template'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated/80 hover:text-text-primary"
          >
            <X size={20} className="text-current" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {shareOrigin === 'local-custom' && (
            <div
              className="rounded-lg border border-border-subtle bg-accent-amber-soft px-4 py-3 text-sm text-text-primary"
              role="status"
            >
              Browser-only template: shared links won’t open on other devices until this template is
              saved to your workspace (Convex) backend.
            </div>
          )}

          {/* Team Sharing */}
          <div className="rounded-lg border border-border-subtle p-5">
            <div className="mb-3 flex items-center gap-2">
              <Users className="text-accent-blue" size={20} />
              <h3 className="font-semibold text-text-primary">Share with Team</h3>
            </div>
            <p className="mb-2 text-sm text-text-secondary">
              Direct invites are not available yet — use the links below for now.
            </p>

            <div className="space-y-3">
              {/* Email Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="email"
                    defaultValue=""
                    placeholder="Enter teammate's email (preview)"
                    disabled
                    title="Team invites are not wired up yet"
                    className="w-full cursor-not-allowed rounded-lg border border-border-subtle bg-bg-app py-2 pl-10 pr-4 text-sm text-text-muted dark:bg-bg-elevated/30"
                  />
                </div>
                <Button type="button" variant="secondary" disabled title="Coming soon" className="shrink-0">
                  Invite
                </Button>
              </div>

              {/* Internal Link */}
              <div className="border-t border-border-subtle pt-3">
                <button
                  type="button"
                  onClick={handleCopyInternalLink}
                  className="flex w-full items-center justify-between rounded-lg border border-border-subtle bg-bg-app px-4 py-2.5 text-sm transition-colors hover:border-border-strong hover:bg-bg-elevated/40 dark:bg-bg-elevated/20"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon size={14} className="text-text-muted" />
                    <span className="font-medium text-text-primary">Copy internal link</span>
                  </div>
                  {internalLinkCopied ? (
                    <div className="flex items-center gap-1.5 text-accent-green">
                      <Check size={14} />
                      <span className="text-xs font-medium">Copied!</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-muted">{internalLinkHint[shareOrigin]}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Link Sharing */}
          <div className="rounded-lg border border-border-subtle p-5">
            <div className="mb-3 flex items-center gap-2">
              <LinkIcon className="text-accent-blue" size={20} />
              <h3 className="font-semibold text-text-primary">Share via Link</h3>
            </div>
            <p className="mb-4 text-sm text-text-secondary">{shareLinkIntro[shareOrigin]}</p>

            <div className="space-y-4">
              {/* Access Level Options */}
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-text-primary">Access level (preview)</label>
                  <p className="mb-2 mt-0.5 text-xs text-text-muted">
                    These options don’t change the link or permissions yet — everyone gets the same
                    shared view for now.
                  </p>
                </div>

                <label className="flex cursor-default items-start gap-3 rounded-lg border border-border-subtle bg-bg-app p-3 dark:bg-bg-elevated/25">
                  <input
                    type="radio"
                    name="access"
                    checked={accessLevel === 'view-only'}
                    onChange={() => setAccessLevel('view-only')}
                    className="mt-0.5 h-4 w-4 text-accent-blue"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">View only</div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Planned: view without applying (not enforced on the link yet)
                    </p>
                  </div>
                </label>

                <label className="flex cursor-default items-start gap-3 rounded-lg border border-border-subtle bg-bg-app p-3 dark:bg-bg-elevated/25">
                  <input
                    type="radio"
                    name="access"
                    checked={accessLevel === 'duplicate'}
                    onChange={() => setAccessLevel('duplicate')}
                    className="mt-0.5 h-4 w-4 text-accent-blue"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">Duplicate and use</div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Planned: duplicate and apply (not enforced on the link yet)
                    </p>
                  </div>
                </label>
              </div>

              {/* Copy Link Button */}
              <Button type="button" variant="accent" className="w-full" onClick={handleCopyLink}>
                {linkCopied ? (
                  <>
                    <Check size={16} />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <LinkIcon size={16} />
                    Copy Share Link
                  </>
                )}
              </Button>

              {/* Link Preview */}
              <div className="rounded-lg border border-border-subtle bg-bg-app p-3 dark:bg-bg-elevated/25">
                <div className="mb-1 text-xs text-text-muted">Share link</div>
                <div className="break-all font-mono text-xs text-text-secondary">{shareUrl}</div>
              </div>
            </div>
          </div>

          {/* Public Sharing (Future) */}
          <div className="rounded-lg border border-dashed border-border-subtle bg-bg-app p-5 dark:bg-bg-elevated/15">
            <div className="mb-3 flex items-center gap-2">
              <Globe className="text-text-muted" size={20} />
              <h3 className="font-semibold text-text-primary">Publish to Community</h3>
              <span className="rounded px-2 py-0.5 text-xs font-medium text-text-secondary ring-1 ring-border-subtle">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-text-muted">
              Make this template publicly available in the template marketplace
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border-subtle bg-bg-app px-6 py-4 dark:bg-bg-elevated/20">
          <Button type="button" variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
