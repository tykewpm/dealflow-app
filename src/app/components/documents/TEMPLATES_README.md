# Document Templates System

A template-based system for quickly setting up required documents for real estate transactions.

## Components

### DocumentTemplatesSelector
Main selection screen for choosing a document template.

**Props:**
```typescript
{
  onUseTemplate: (template: DocumentTemplate) => void;
  onStartBlank?: () => void;
  onCancel?: () => void;
  onPreviewTemplate?: (template: DocumentTemplate) => void;
}
```

**Features:**
- Grid layout of template cards
- Default template pre-selected (Default Residential Sale)
- "Use Template" primary action
- "Start Blank" secondary action
- Optional cancel button
- Optional preview functionality

### DocumentTemplateCard
Individual template card component.

**Props:**
```typescript
{
  template: DocumentTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}
```

**Features:**
- Template name and description
- Document count display
- Tags (e.g., "Residential", "Cash Deal")
- Preview of 2-3 document names
- "Recommended" badge
- Selected state with checkmark
- Hover state
- Optional "Preview all documents" link

### DocumentTemplatePreviewModal
Modal for viewing all documents in a template.

**Props:**
```typescript
{
  template: DocumentTemplate;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Full list of template documents
- Document descriptions
- Signature requirement indicators
- Scrollable content
- Close button

## Available Templates

### 1. Default Residential Sale (Recommended)
**8 documents** - Tags: Residential, Financing
- Purchase Agreement
- Seller Disclosure
- Inspection Report
- Appraisal
- Title Report
- HOA Documents
- Loan Estimate
- Closing Disclosure

### 2. Condo Sale
**9 documents** - Tags: Condo, Residential
- All Default Residential Sale documents
- Plus: CC&Rs (Covenants, Conditions & Restrictions)

### 3. Cash Deal
**5 documents** - Tags: Cash, Simplified
- Purchase Agreement
- Seller Disclosure
- Inspection Report
- Title Report
- Closing Disclosure

### 4. Start Blank
**0 documents** - Tags: Custom
- Empty template for custom setup

## Design Features

### Visual Hierarchy
- **Template cards** - Clean cards with subtle borders
- **Recommended badge** - Blue badge on default template
- **Selection state** - Blue border + checkmark
- **Hover state** - Border darkens, subtle shadow

### Layout
- **12-column grid** (2 cards per row on desktop)
- **8pt spacing system**
- **Desktop-first** responsive design
- **Clean, minimal** Linear/Notion inspired

### Colors
- **Selected:** Blue border (#2563eb), blue background (#eff6ff)
- **Hover:** Gray border (#d1d5db), subtle shadow
- **Default:** Gray border (#e5e7eb), white background

## Usage Patterns

### Pattern 1: Inline in Documents Tab
```typescript
<DocumentList
  documents={documents}
  onUseTemplate={() => openTemplateSelector()}
/>
```

### Pattern 2: As Separate Page/Route
```typescript
<DocumentTemplatesSelector
  onUseTemplate={(template) => createDocumentsFromTemplate(template)}
  onCancel={() => navigate(-1)}
/>
```

### Pattern 3: In Modal
```typescript
{showTemplateSelector && (
  <div className="fixed inset-0 z-50 bg-bg-surface">
    <DocumentTemplatesSelector
      onUseTemplate={handleUseTemplate}
      onCancel={() => setShowTemplateSelector(false)}
    />
  </div>
)}
```

### Pattern 4: With Preview
```typescript
<DocumentTemplatesSelector
  onUseTemplate={handleUseTemplate}
  onPreviewTemplate={(template) => setPreviewTemplate(template)}
/>

<DocumentTemplatePreviewModal
  template={previewTemplate}
  isOpen={!!previewTemplate}
  onClose={() => setPreviewTemplate(null)}
/>
```

## Data Structure

### DocumentTemplate
```typescript
{
  id: string;                    // 'default-residential'
  name: string;                  // 'Default Residential Sale'
  description: string;           // Description text
  documentCount: number;         // 8
  tags?: string[];               // ['Residential', 'Financing']
  isRecommended?: boolean;       // true
  documents: DocumentTemplateItem[];
  previewDocuments?: string[];   // First 2-3 for card preview
}
```

### DocumentTemplateItem
```typescript
{
  name: string;                  // 'Purchase Agreement'
  description?: string;          // Optional description
  signatureRequired: boolean;    // true/false
}
```

## Integration with DocumentList

When a template is selected:

1. Convert template documents to `DocumentItem[]`:
```typescript
const newDocuments = template.documents.map((doc, index) => ({
  id: `doc-${Date.now()}-${index}`,
  dealId: currentDealId,
  name: doc.name,
  status: 'not-started',
  signatureStatus: doc.signatureRequired ? 'requested' : 'not-required',
}));
```

2. Add to deal's documents:
```typescript
setDocuments([...documents, ...newDocuments]);
```

## Best Practices

1. **Pre-select Default** - Always default to "Default Residential Sale" template
2. **Show Recommended** - Clearly mark the recommended template
3. **Preview Option** - Allow users to see all documents before committing
4. **Fast Selection** - Minimize clicks - one click to select, one click to apply
5. **Clear Descriptions** - Each template should clearly explain what it's for
6. **Lightweight** - No file uploads, just document status tracking

## Examples

See `DocumentTemplatesSelector.example.tsx` for 5 complete usage examples.
