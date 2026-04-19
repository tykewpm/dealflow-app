# Documents Tab Components

A lightweight document coordination system for tracking document status and signatures in real estate transactions.

## Components

### DocumentList
Main container component that displays the documents tab with summary bar, document rows, and actions.

**Props:**
```typescript
{
  documents: DocumentItem[];
  onAddDocument?: () => void;
  onUseTemplate?: () => void;
  onAddLink?: (documentId: string) => void;
  onAddNote?: (documentId: string) => void;
  onMarkComplete?: (documentId: string) => void;
}
```

**Features:**
- Summary bar with statistics
- Document rows with hover actions
- Guided checklist experience (when no documents exist)
- "Use Template" and "Add Document" buttons

### DocumentRow
Individual document row with status, signature tracking, and action icons.

**Props:**
```typescript
{
  document: DocumentItem;
  onAddLink?: (documentId: string) => void;
  onAddNote?: (documentId: string) => void;
  onMarkComplete?: (documentId: string) => void;
}
```

**Features:**
- Document name and status badge
- Signature status indicator
- Due date with overdue highlighting
- Source label (DocuSign, Dotloop, etc.)
- Hover actions (add link, add note, mark complete)
- Optional notes display

### DocumentsSummaryBar
Statistics summary bar showing document overview.

**Props:**
```typescript
{
  total: number;
  awaitingSignature: number;
  overdue: number;
  completed: number;
}
```

**Features:**
- Total document count
- Awaiting signature count (with warning icon)
- Overdue count (with alert icon)
- Completed count

## Helper Functions

### getDocumentStats(documents)
Calculates statistics for the summary bar.

**Returns:**
```typescript
{
  total: number;
  awaitingSignature: number;
  overdue: number;
  completed: number;
}
```

### isDocumentOverdue(document)
Checks if a document is overdue based on due date and status.

### getSourceLabel(referenceLink)
Extracts source platform name from reference URL (DocuSign, Dotloop, Google Drive, etc.).

## Status Badges

### Document Status
- **Not Started** - Gray
- **Requested** - Blue
- **Uploaded** - Indigo
- **Awaiting Signature** - Amber
- **Signed** - Green
- **Completed** - Green

### Signature Status
- **Not Required** - Gray text
- **Requested** - Blue text
- **Partially Signed** - Amber text
- **Fully Signed** - Green text

## Design Principles

1. **Coordination, Not Storage** - This is NOT a document management system. It tracks status and coordinates documents that live elsewhere.

2. **Lightweight** - No file uploads, no previews, no complex workflows. Just status tracking and links.

3. **Scannable** - High visual hierarchy, clear status indicators, at-a-glance information.

4. **Actionable** - Quick actions on hover, clear CTAs, minimal clicks to complete tasks.

## Usage

See `DocumentsTab.example.tsx` for complete usage examples.

### Basic Integration

```typescript
<DocumentList
  documents={dealDocuments}
  onAddDocument={() => openAddDocumentModal()}
  onAddLink={(docId) => openAddLinkModal(docId)}
  onAddNote={(docId) => openAddNoteModal(docId)}
  onMarkComplete={(docId) => markDocumentComplete(docId)}
/>
```

### Guided Checklist Experience

When no documents exist, the component shows a helpful guided experience with:
- Helper text: "Track required documents and signatures for this deal"
- Default checklist of 8 common real estate documents
- Each item shows:
  - Document name and description
  - "Not Started" status badge
  - Signature requirement indicator (if applicable)
- Two CTAs:
  - **"Use Template"** (primary) - Creates all default documents at once
  - **"+ Add Document"** (secondary) - Add a custom document

This approach guides users on what documents they should have instead of showing a blank slate.
