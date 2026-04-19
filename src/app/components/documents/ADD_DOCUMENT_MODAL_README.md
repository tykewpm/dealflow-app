# Add Document Page

A full-page takeover experience for adding documents to track in a real estate transaction. Matches the design pattern used in the "New Deal" flow.

## Component

### AddDocumentModal

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (documentData: {
    name: string;
    status: DocumentStatus;
    signatureRequired: boolean;
    dueDate?: string;
    referenceLink?: string;
  }) => void;
}
```

## Fields

### Document Name (Required)
- Text input, auto-focused
- Placeholder: "e.g., Purchase Agreement"
- Required field

### Status
- Dropdown select
- Options:
  - Not Started (default)
  - Requested
  - Uploaded
  - Awaiting Signature
  - Signed

### Signature Required
- Toggle switch
- Default: false (off)
- Visual toggle with blue active state

### Due Date (Optional)
- Date picker (react-datepicker)
- Format: "MMM d, yyyy" (e.g., "Apr 30, 2026")
- Clearable
- Placeholder: "Select due date"

### External Link (Optional)
- URL input
- Placeholder: "Paste DocuSign or Drive link"
- Accepts any valid URL

## Actions

### Primary: "Add Document"
- Blue button
- Disabled if name is empty
- Submits form and closes modal

### Secondary: "Cancel"
- Gray outlined button
- Resets form and closes modal

## Features

✅ **Consistent UX** - Matches New Deal full-page takeover pattern  
✅ **Auto-focus** - Name field focused on open  
✅ **Form reset** - Clears all fields after submit or cancel  
✅ **Validation** - Requires document name  
✅ **Keyboard support** - Enter to submit  
✅ **Clean design** - Spacious layout, minimal friction  
✅ **Date picker** - Integrated react-datepicker styling  
✅ **2-column grid** - Responsive form layout on desktop  

## Design

**Full-Page Takeover** (matches New Deal flow):
- **Layout:** Full screen with gray background
- **Max width:** 768px (max-w-3xl)
- **Close button:** Top right corner (×)
- **Page title:** Large heading (3xl) + subtitle
- **Form grid:** 2-column responsive layout
- **Input height:** 48px (h-12)
- **Rounded corners:** 12px (rounded-xl)
- **Actions:** Right-aligned Cancel + Add Document buttons

## Usage

### Basic Integration

```typescript
const [showModal, setShowModal] = useState(false);

const handleAddDocument = (documentData) => {
  const newDocument = {
    id: `doc-${Date.now()}`,
    dealId: currentDealId,
    name: documentData.name,
    status: documentData.status,
    signatureStatus: documentData.signatureRequired 
      ? 'requested' 
      : 'not-required',
    dueDate: documentData.dueDate,
    referenceLink: documentData.referenceLink,
  };
  
  setDocuments([...documents, newDocument]);
};

<AddDocumentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onAdd={handleAddDocument}
/>
```

### With Button Trigger

```typescript
<button onClick={() => setShowModal(true)}>
  + Add Document
</button>

<AddDocumentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onAdd={handleAddDocument}
/>
```

### In DocumentList

Already integrated! The "Add Document" button in DocumentList automatically opens this modal.

## Data Flow

1. User clicks "Add Document" button
2. Modal opens with empty form
3. User fills in document details
4. User clicks "Add Document" or presses Enter
5. Modal calls `onAdd()` with document data
6. Parent component creates new DocumentItem
7. Modal resets form and closes

## Constraints

❌ **No file upload** - This is NOT for uploading files  
❌ **No complex fields** - Keep it simple and fast  
❌ **No nested forms** - Single-level form only  

## Optional Enhancements (Not Implemented)

Ideas for future enhancement:
- Pre-fill values for "Edit Document" mode
- Duplicate document name warning
- URL validation with visual feedback
- Template quick-select for common documents
- Auto-suggest signature requirement based on document name

## Examples

See `AddDocumentModal.example.tsx` for 5 complete usage examples:
1. Basic usage
2. With validation
3. Integration with DocumentList
4. Pre-filled values (edit mode concept)
5. With success feedback

## Integration Points

### Current Integrations:
- ✅ **DealDetail** - Integrated via onAddDocument prop
- ✅ **DocumentList** - "Add Document" button opens modal
- ✅ **App.tsx** - Document state management

### Type Definitions:
- Uses `DocumentStatus` from `types/index.ts`
- Returns data matching `DocumentItem` structure
- Signature requirement maps to `SignatureStatus`
