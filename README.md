# CSV Import Plugin for Thymer

Import CSV data into Thymer collections with automatic field mapping and type detection.

## Features

- **File upload or paste** - Import from files or clipboard
- **Create collections** - Automatically create collections from CSV structure
- **Auto-generate choices** - Choice fields automatically populated from unique values
- **Smart deduplication** - Updates existing records by title
- **Type coercion** - Automatic conversion to numbers, dates, booleans
- **Dark & Light mode support** - Adapts to your Thymer theme

## Installation

1. **Cmd+P** → "Plugins" → "Create Global Plugin"
2. Paste `plugin.json` into Configuration tab
3. Paste `plugin.js` into Code tab
4. Save

## Usage

### Import to Existing Collection

1. **Cmd+P** → "Import CSV"
2. Select your collection
3. Paste CSV or upload file
4. Click Import

### Create New Collection

1. **Cmd+P** → "Import CSV"
2. Select "✨ Create New Collection"
3. Enter collection name
4. Paste CSV or upload file
5. Configure field types (or use type hints - see below)
6. Click Create Collection

## Type Hints (Optional)

Add a second row with type names to skip manual configuration:

```csv
Name,Age,Email,Active,Status
text,number,url,checkbox,choice
John,25,john@example.com,yes,Active
Jane,30,jane@example.com,no,Pending
```

**Valid types:** `text`, `number`, `datetime`, `date`, `checkbox`, `choice`, `url`

## Choice Fields

When you mark a field as "choice" type, the plugin:
- Scans all values in that column
- Extracts unique values
- Creates dropdown options automatically
- Assigns colors

## Field Mapping

Headers are matched case-insensitively, ignoring spaces/dashes/underscores:
- `Due Date` = `due_date` = `DueDate` = `DUEDATE`

## Tips

- Use type hints for faster setup
- Test with small CSV first (5-10 rows)
- Use ISO dates: `2024-01-15` or `2024-01-15T14:30:00`
- Large files? Use file upload instead of paste
