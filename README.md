# CSV Import Plugin for Thymer

A simple Thymer plugin that imports CSV data into any collection with intelligent field mapping.

## Features

- **Intelligent Field Mapping** - Automatically matches CSV headers to collection fields (case-insensitive, ignores spaces/dashes/underscores)
- **Smart Deduplication** - Updates existing records by title or creates new ones
- **Type Coercion** - Automatically converts strings to numbers, booleans, and dates
- **Batch Processing** - Handles large CSVs efficiently
- **Multiple Field Types** - Supports text, numbers, dates, choice fields, checkboxes

## Installation

1. In Thymer, press **Cmd+P** (Mac) or **Ctrl+P** (Windows/Linux)
2. Type **"Plugins"** and select it
3. Click **"Create Global Plugin"**
4. Copy the contents of `plugin.json` into the JSON editor
5. Copy the contents of `plugin.js` into the Code editor
6. Click **"Save"**

## Usage

1. Press **Cmd+P** / **Ctrl+P** to open command palette
2. Type **"Import CSV"** and select it
3. Choose your target collection from the dropdown
4. Paste your CSV data (first row must be headers)
5. Click **"Import"**

### Example CSV

```csv
Title,Status,Priority,Due Date
Fix login bug,In Progress,High,2024-01-15
Update docs,Done,Low,2024-01-20
Add feature,To Do,Medium,2024-01-25
```

The plugin will automatically match:
- `Title` → `title`
- `Status` → `status`
- `Priority` → `priority`
- `Due Date` → `due_date`

## Field Mapping

Headers are matched using fuzzy logic - all of these work:

| CSV Header | Matches Field |
|------------|---------------|
| `Due Date` | `due_date` |
| `DueDate` | `due_date` |
| `due-date` | `due_date` |
| `DUEDATE` | `due_date` |

The plugin matches against both field IDs and field labels.

## Deduplication

Records are deduplicated by **title**:
- If a record with the same title exists → **update it**
- If not → **create new record**

## Supported Data Types

- **Text**: Any string value
- **Numbers**: Numeric values (auto-detected)
- **Booleans**: `true`, `false`, `yes`, `no`, `1`, `0`
- **Dates**: ISO format (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`)
- **Choice Fields**: Use the choice label (e.g., "In Progress")

## Tips

- Test with a small CSV first (5-10 rows)
- Make sure choice fields have all required values defined
- Empty cells become `null`
- Check browser console (F12) for detailed logs

## Requirements

- Thymer account
- Any collection in your workspace

## License

MIT
