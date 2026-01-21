/**
 * CSV Import Plugin for Thymer (Global Plugin)
 */

class Plugin extends AppPlugin {
    
    onLoad() {
        console.log('[CSV Import] Plugin loaded');
        
        // Register global command palette command
        this.ui.addCommandPaletteCommand({
            label: 'Import CSV',
            icon: 'ti-file-import',
            onSelected: () => {
                console.log('[CSV Import] Command selected');
                this.showImportDialog();
            }
        });
        
        console.log('[CSV Import] Command registered');
    }

    showImportDialog() {
        console.log('[CSV Import] Showing dialog...');
        
        // Create a simple modal using DOM manipulation
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #fff;
            border-radius: 8px;
            padding: 24px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        dialog.innerHTML = `
            <h2 style="margin: 0 0 16px 0;">Import CSV</h2>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Select Collection:</label>
                <select id="csv-collection-select" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    <option value="">-- Select a collection --</option>
                </select>
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">CSV Data:</label>
                <textarea 
                    id="csv-data-input" 
                    placeholder="Paste your CSV here (first row should be headers)"
                    style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                ></textarea>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button id="csv-cancel-btn" style="padding: 8px 16px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button id="csv-import-btn" style="padding: 8px 16px; border: none; background: #4a9eff; color: #fff; border-radius: 4px; cursor: pointer;">Import</button>
            </div>
            <div id="csv-status" style="margin-top: 16px; display: none;"></div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Load collections
        this.loadCollections(dialog);

        // Handle buttons
        dialog.querySelector('#csv-cancel-btn').onclick = () => {
            document.body.removeChild(overlay);
        };

        dialog.querySelector('#csv-import-btn').onclick = () => {
            this.performImport(dialog, overlay);
        };

        // Close on overlay click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    }

    async loadCollections(dialog) {
        try {
            const collections = await this.data.getAllCollections();
            const select = dialog.querySelector('#csv-collection-select');
            
            collections.forEach(collection => {
                const option = document.createElement('option');
                option.value = collection.getGuid();
                option.textContent = collection.getName();
                select.appendChild(option);
            });
        } catch (error) {
            console.error('[CSV Import] Error loading collections:', error);
        }
    }

    async performImport(dialog, overlay) {
        const select = dialog.querySelector('#csv-collection-select');
        const textarea = dialog.querySelector('#csv-data-input');
        const statusDiv = dialog.querySelector('#csv-status');
        const importBtn = dialog.querySelector('#csv-import-btn');

        const collectionGuid = select.value;
        const csvData = textarea.value.trim();

        if (!collectionGuid) {
            this.showStatus(statusDiv, 'Please select a collection', 'error');
            return;
        }

        if (!csvData) {
            this.showStatus(statusDiv, 'Please paste CSV data', 'error');
            return;
        }

        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';
        this.showStatus(statusDiv, 'Importing...', 'info');

        try {
            const collections = await this.data.getAllCollections();
            const collection = collections.find(c => c.getGuid() === collectionGuid);

            if (!collection) {
                throw new Error('Collection not found');
            }

            const result = await this.importCSV(collection, csvData);
            
            this.showStatus(statusDiv, `Import complete! Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`, 'success');
            
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 2000);

        } catch (error) {
            console.error('[CSV Import] Error:', error);
            this.showStatus(statusDiv, `Error: ${error.message}`, 'error');
            importBtn.disabled = false;
            importBtn.textContent = 'Import';
        }
    }

    showStatus(statusDiv, message, type) {
        statusDiv.style.display = 'block';
        statusDiv.textContent = message;
        statusDiv.style.padding = '12px';
        statusDiv.style.borderRadius = '4px';
        statusDiv.style.background = type === 'error' ? '#fee' : type === 'success' ? '#efe' : '#eef';
        statusDiv.style.border = `1px solid ${type === 'error' ? '#c00' : type === 'success' ? '#0c0' : '#00c'}`;
    }

    async importCSV(collection, csvData) {
        // Parse CSV
        const { headers, rows } = this.parseCSV(csvData);
        
        console.log('[CSV Import] Headers:', headers);
        console.log('[CSV Import] Rows:', rows.length);

        // Get configuration for field mapping
        const config = collection.getConfiguration();
        const mapping = this.buildFieldMapping(headers, config.fields);

        console.log('[CSV Import] Mapping:', mapping);

        // Get existing records for dedup
        const existingRecords = await collection.getAllRecords();
        const existingByTitle = new Map();
        for (const record of existingRecords) {
            const title = record.getName();
            if (title) {
                existingByTitle.set(title.toLowerCase(), record);
            }
        }

        let created = 0;
        let updated = 0;
        let skipped = 0;

        // Process rows in batches
        const BATCH_SIZE = 50;
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, Math.min(i + BATCH_SIZE, rows.length));

            for (const row of batch) {
                try {
                    const rowObject = this.rowToObject(headers, row);
                    
                    // Determine title
                    const titleField = mapping['title'] || mapping['name'] || Object.values(mapping).find(m => m.matched);
                    const title = titleField 
                        ? (rowObject[Object.keys(mapping).find(k => mapping[k] === titleField)] || 'Untitled')
                        : 'Untitled';

                    // Check if exists
                    const existingRecord = existingByTitle.get(title.toLowerCase());

                    if (existingRecord) {
                        this.updateRecord(existingRecord, rowObject, mapping);
                        updated++;
                    } else {
                        const record = await this.createRecord(collection, title, rowObject, mapping);
                        if (record) {
                            created++;
                            existingByTitle.set(title.toLowerCase(), record);
                        } else {
                            skipped++;
                        }
                    }
                } catch (error) {
                    console.error('[CSV Import] Row error:', error);
                    skipped++;
                }
            }

            // Pause between batches
            if (i + BATCH_SIZE < rows.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        return { created, updated, skipped };
    }

    async createRecord(collection, title, rowObject, mapping) {
        const recordGuid = collection.createRecord(title);
        if (!recordGuid) return null;

        // SDK quirk: wait for record to sync
        await new Promise(resolve => setTimeout(resolve, 50));
        const records = await collection.getAllRecords();
        const record = records.find(r => r.guid === recordGuid);

        if (!record) return null;

        this.updateRecord(record, rowObject, mapping);
        return record;
    }

    updateRecord(record, rowObject, mapping) {
        for (const [csvHeader, value] of Object.entries(rowObject)) {
            const fieldMapping = mapping[csvHeader];
            if (!fieldMapping || !fieldMapping.matched) continue;

            const { fieldId, fieldType } = fieldMapping;
            
            try {
                this.setFieldValue(record, fieldId, fieldType, value);
            } catch (error) {
                console.warn(`[CSV Import] Failed to set field ${fieldId}:`, error);
            }
        }
    }

    setFieldValue(record, fieldId, fieldType, value) {
        if (value === null || value === undefined || value === '') return;

        const prop = record.prop(fieldId);
        if (!prop) return;

        // Handle based on field type
        if (fieldType === 'choice') {
            const success = prop.setChoice(String(value).trim());
            if (!success) {
                console.log(`[CSV Import] Choice "${value}" not found in field ${fieldId}`);
            }
        } else if (fieldType === 'datetime') {
            const date = this.parseDate(value);
            if (date) {
                prop.set(new DateTime(date));
            }
        } else if (fieldType === 'number') {
            const num = this.coerceNumber(value);
            if (num !== null) prop.set(num);
        } else if (fieldType === 'checkbox') {
            prop.set(this.coerceBoolean(value));
        } else {
            prop.set(value);
        }
    }

    buildFieldMapping(csvHeaders, collectionFields) {
        const mapping = {};
        
        for (const header of csvHeaders) {
            const normalized = this.normalizeFieldName(header);
            
            const matchedField = collectionFields.find(field => {
                const fieldIdNorm = this.normalizeFieldName(field.id);
                const fieldLabelNorm = this.normalizeFieldName(field.label || '');
                
                return fieldIdNorm === normalized || fieldLabelNorm === normalized;
            });

            if (matchedField) {
                mapping[header] = {
                    fieldId: matchedField.id,
                    fieldType: matchedField.type,
                    matched: true
                };
            } else {
                mapping[header] = { matched: false };
            }
        }

        return mapping;
    }

    normalizeFieldName(name) {
        return name.toLowerCase().replace(/[\s\-_]+/g, '').trim();
    }

    parseCSV(csvText) {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;

        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
                if (char === '\r' && nextChar === '\n') i++;
                if (currentField || currentRow.length > 0) {
                    currentRow.push(currentField.trim());
                    rows.push(currentRow);
                    currentRow = [];
                    currentField = '';
                }
            } else {
                currentField += char;
            }
        }

        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.trim());
            rows.push(currentRow);
        }

        if (rows.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        return {
            headers: rows[0],
            rows: rows.slice(1)
        };
    }

    rowToObject(headers, rowData) {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            const value = rowData[i] || '';
            obj[headers[i]] = value === '' ? null : value;
        }
        return obj;
    }

    coerceNumber(value) {
        if (typeof value === 'number') return value;
        if (typeof value !== 'string') return null;
        
        const trimmed = value.trim();
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
            const num = Number(trimmed);
            return isNaN(num) ? null : num;
        }
        return null;
    }

    coerceBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value !== 'string') return false;
        
        const lower = value.toLowerCase().trim();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
        return false;
    }

    parseDate(value) {
        if (!value) return null;
        if (value instanceof Date) return value;
        
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }
}
