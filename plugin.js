/**
 * CSV Import Plugin for Thymer (Global Plugin)
 * Simplified version that works with the actual SDK APIs
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

    isDarkMode() {
        // Check if Thymer is in dark mode
        // Common methods: check body class, data attribute, or computed styles
        const body = document.body;
        
        // Method 1: Check for dark mode class
        if (body.classList.contains('dark') || body.classList.contains('dark-mode')) {
            return true;
        }
        
        // Method 2: Check data attribute
        if (body.dataset.theme === 'dark') {
            return true;
        }
        
        // Method 3: Check computed background color (if it's dark)
        const bgColor = window.getComputedStyle(body).backgroundColor;
        if (bgColor) {
            // Parse RGB and check if it's dark (low luminance)
            const rgb = bgColor.match(/\d+/g);
            if (rgb && rgb.length >= 3) {
                const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
                return luminance < 0.5;
            }
        }
        
        // Default to light mode
        return false;
    }

    getThemeColors() {
        const isDark = this.isDarkMode();
        
        if (isDark) {
            return {
                background: '#1e1e1e',
                backgroundSecondary: '#2d2d2d',
                border: '#3d3d3d',
                text: '#e0e0e0',
                textSecondary: '#a0a0a0',
                input: '#2d2d2d',
                inputBorder: '#3d3d3d',
                buttonBg: '#fff',
                buttonText: '#000',
                buttonBorder: '#3d3d3d',
                primary: '#4a9eff',
                primaryHover: '#3a8eef',
                success: '#5cb85c',
                error: '#d9534f',
                warning: '#f0ad4e',
                info: '#5bc0de',
                tableHeader: '#2d2d2d',
                tableRow: '#1e1e1e',
                tableRowAlt: '#252525',
                tableBorder: '#3d3d3d'
            };
        } else {
            return {
                background: '#fff',
                backgroundSecondary: '#f5f5f5',
                border: '#ccc',
                text: '#000',
                textSecondary: '#666',
                input: '#fff',
                inputBorder: '#ccc',
                buttonBg: '#fff',
                buttonText: '#000',
                buttonBorder: '#ccc',
                primary: '#4a9eff',
                primaryHover: '#3a8eef',
                success: '#5cb85c',
                error: '#d9534f',
                warning: '#f0ad4e',
                info: '#5bc0de',
                tableHeader: '#f5f5f5',
                tableRow: '#fff',
                tableRowAlt: '#fafafa',
                tableBorder: '#ddd'
            };
        }
    }

    showImportDialog() {
        console.log('[CSV Import] Showing dialog...');
        
        const colors = this.getThemeColors();
        
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
            background: ${colors.background};
            color: ${colors.text};
            border-radius: 8px;
            padding: 24px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            border: 1px solid ${colors.border};
        `;

        dialog.innerHTML = `
            <h2 style="margin: 0 0 16px 0; color: ${colors.text};">Import CSV</h2>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: ${colors.text};">Select Collection:</label>
                <select id="csv-collection-select" style="width: 100%; padding: 8px; border: 1px solid ${colors.inputBorder}; border-radius: 4px; background: ${colors.input}; color: ${colors.text};">
                    <option value="">-- Select a collection --</option>
                    <option value="__CREATE_NEW__">✨ Create New Collection</option>
                </select>
            </div>
            <div id="new-collection-name-container" style="margin-bottom: 16px; display: none;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: ${colors.text};">New Collection Name:</label>
                <input 
                    type="text" 
                    id="new-collection-name" 
                    placeholder="e.g., Tasks, Contacts, Projects"
                    style="width: 100%; padding: 8px; border: 1px solid ${colors.inputBorder}; border-radius: 4px; background: ${colors.input}; color: ${colors.text};"
                >
            </div>
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500; color: ${colors.text};">CSV Source:</label>
                <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                    <label style="flex: 1; text-align: center; padding: 8px; border: 2px solid ${colors.primary}; background: ${colors.backgroundSecondary}; border-radius: 4px; cursor: pointer; color: ${colors.text};">
                        <input type="radio" name="csv-source" value="paste" checked style="margin-right: 4px;">
                        Paste CSV
                    </label>
                    <label style="flex: 1; text-align: center; padding: 8px; border: 2px solid ${colors.border}; background: ${colors.backgroundSecondary}; border-radius: 4px; cursor: pointer; color: ${colors.text};">
                        <input type="radio" name="csv-source" value="upload" style="margin-right: 4px;">
                        Upload File
                    </label>
                </div>
                <div id="csv-paste-container">
                    <textarea 
                        id="csv-data-input" 
                        placeholder="Paste your CSV here (first row should be headers)"
                        style="width: 100%; height: 200px; font-family: monospace; font-size: 12px; padding: 8px; border: 1px solid ${colors.inputBorder}; border-radius: 4px; background: ${colors.input}; color: ${colors.text};"
                    ></textarea>
                </div>
                <div id="csv-upload-container" style="display: none;">
                    <input 
                        type="file" 
                        id="csv-file-input" 
                        accept=".csv,text/csv"
                        style="width: 100%; padding: 8px; border: 1px solid ${colors.inputBorder}; border-radius: 4px; background: ${colors.input}; color: ${colors.text};"
                    >
                    <div id="file-preview" style="margin-top: 8px; font-size: 12px; color: ${colors.textSecondary};"></div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button id="csv-cancel-btn" style="padding: 8px 16px; border: 1px solid ${colors.buttonBorder}; background: ${colors.buttonBg}; color: ${colors.buttonText}; border-radius: 4px; cursor: pointer;">Cancel</button>
                <button id="csv-import-btn" style="padding: 8px 16px; border: none; background: ${colors.primary}; color: #fff; border-radius: 4px; cursor: pointer;">Import</button>
            </div>
            <div id="csv-status" style="margin-top: 16px; display: none;"></div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Load collections
        this.loadCollections(dialog);

        // Handle collection selection (show/hide new collection name input)
        const collectionSelect = dialog.querySelector('#csv-collection-select');
        const newCollectionNameContainer = dialog.querySelector('#new-collection-name-container');
        collectionSelect.addEventListener('change', () => {
            if (collectionSelect.value === '__CREATE_NEW__') {
                newCollectionNameContainer.style.display = 'block';
            } else {
                newCollectionNameContainer.style.display = 'none';
            }
        });

        // Handle CSV source switching (paste vs upload)
        const pasteRadio = dialog.querySelector('input[value="paste"]');
        const uploadRadio = dialog.querySelector('input[value="upload"]');
        const pasteContainer = dialog.querySelector('#csv-paste-container');
        const uploadContainer = dialog.querySelector('#csv-upload-container');
        
        pasteRadio.addEventListener('change', () => {
            pasteContainer.style.display = 'block';
            uploadContainer.style.display = 'none';
            pasteRadio.parentElement.style.borderColor = colors.primary;
            pasteRadio.parentElement.style.background = colors.backgroundSecondary;
            uploadRadio.parentElement.style.borderColor = colors.border;
            uploadRadio.parentElement.style.background = colors.backgroundSecondary;
        });
        
        uploadRadio.addEventListener('change', () => {
            pasteContainer.style.display = 'none';
            uploadContainer.style.display = 'block';
            uploadRadio.parentElement.style.borderColor = colors.primary;
            uploadRadio.parentElement.style.background = colors.backgroundSecondary;
            pasteRadio.parentElement.style.borderColor = colors.border;
            pasteRadio.parentElement.style.background = colors.backgroundSecondary;
        });

        // Handle file upload
        const fileInput = dialog.querySelector('#csv-file-input');
        const filePreview = dialog.querySelector('#file-preview');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                filePreview.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            } else {
                filePreview.textContent = '';
            }
        });

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
        const fileInput = dialog.querySelector('#csv-file-input');
        const statusDiv = dialog.querySelector('#csv-status');
        const importBtn = dialog.querySelector('#csv-import-btn');
        const sourceRadio = dialog.querySelector('input[name="csv-source"]:checked');
        const newCollectionNameInput = dialog.querySelector('#new-collection-name');

        const collectionGuid = select.value;
        const isCreatingNew = collectionGuid === '__CREATE_NEW__';

        // Get CSV data from either paste or upload
        let csvData = '';
        if (sourceRadio.value === 'paste') {
            csvData = textarea.value.trim();
        } else {
            const file = fileInput.files[0];
            if (!file) {
                this.showStatus(statusDiv, 'Please select a CSV file', 'error');
                return;
            }
            try {
                csvData = await this.readFileAsText(file);
            } catch (error) {
                this.showStatus(statusDiv, `Error reading file: ${error.message}`, 'error');
                return;
            }
        }

        if (!csvData) {
            this.showStatus(statusDiv, 'Please provide CSV data', 'error');
            return;
        }

        // Validate collection selection
        if (!isCreatingNew && !collectionGuid) {
            this.showStatus(statusDiv, 'Please select a collection', 'error');
            return;
        }

        // Validate new collection name if creating new
        if (isCreatingNew) {
            const newName = newCollectionNameInput.value.trim();
            if (!newName) {
                this.showStatus(statusDiv, 'Please enter a name for the new collection', 'error');
                return;
            }
        }

        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';
        this.showStatus(statusDiv, 'Importing...', 'info');

        try {
            let collection;

            if (isCreatingNew) {
                // Parse CSV to check for type hints
                const parsed = this.parseCSV(csvData);
                const headers = parsed.headers;
                let dataRows = parsed.rows;
                let typeHints = null;

                // Check if second row contains type hints
                if (dataRows.length > 0 && this.isTypeHintRow(dataRows[0])) {
                    typeHints = dataRows[0];
                    dataRows = dataRows.slice(1); // Remove type hint row from data
                    console.log('[CSV Import] Found type hints in row 2:', typeHints);
                }

                // Show property configuration dialog
                const newName = newCollectionNameInput.value.trim();
                const propertyConfig = await this.showPropertyConfigDialog(headers, typeHints, dataRows.slice(0, 5));
                
                if (!propertyConfig) {
                    // User cancelled
                    importBtn.disabled = false;
                    importBtn.textContent = 'Import';
                    statusDiv.style.display = 'none';
                    return;
                }

                // Analyze CSV data to find unique values for choice fields
                console.log('[CSV Import] Analyzing choice fields...');
                const choiceOptions = this.buildChoiceOptions(headers, dataRows, propertyConfig);
                console.log('[CSV Import] Choice options:', choiceOptions);

                // Create collection with configured properties
                this.showStatus(statusDiv, `Creating collection "${newName}"...`, 'info');
                collection = await this.createCollectionWithProperties(newName, headers, propertyConfig, choiceOptions);
                
                if (!collection) {
                    throw new Error('Failed to create collection');
                }

                this.showStatus(statusDiv, `Collection created! Importing data...`, 'info');

                // Reconstruct CSV without type hint row
                csvData = this.reconstructCSV(headers, dataRows);
            } else {
                // Use existing collection
                const collections = await this.data.getAllCollections();
                collection = collections.find(c => c.getGuid() === collectionGuid);
                if (!collection) {
                    throw new Error('Collection not found');
                }
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

    isTypeHintRow(row) {
        const validTypes = ['text', 'number', 'datetime', 'date', 'checkbox', 'choice', 'url', 'email', 'phone'];
        // Check if at least half the values are valid type names
        const typeCount = row.filter(val => validTypes.includes(val.toLowerCase().trim())).length;
        return typeCount >= row.length / 2;
    }

    reconstructCSV(headers, rows) {
        const csvRows = [headers, ...rows];
        return csvRows.map(row => 
            row.map(cell => {
                // Escape quotes and wrap in quotes if contains comma or newline
                if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(',')
        ).join('\n');
    }

    async showPropertyConfigDialog(headers, typeHints, sampleRows) {
        const colors = this.getThemeColors();
        
        return new Promise((resolve) => {
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
                z-index: 10001;
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: ${colors.background};
                color: ${colors.text};
                border: 1px solid ${colors.border};
                border-radius: 8px;
                padding: 24px;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
            `;

            // Build property configuration UI
            let propertyRows = headers.map((header, idx) => {
                const typeHint = typeHints ? typeHints[idx].toLowerCase().trim() : null;
                const sampleVals = sampleRows.map(row => row[idx]).filter(v => v).slice(0, 3);
                
                return `
                    <tr style="border-bottom: 1px solid ${colors.tableBorder};">
                        <td style="padding: 8px; color: ${colors.text};">
                            <strong>${this.escapeHtml(header)}</strong>
                            ${sampleVals.length > 0 ? `<div style="font-size: 11px; color: ${colors.textSecondary}; margin-top: 4px;">Examples: ${sampleVals.map(v => this.escapeHtml(v)).join(', ')}</div>` : ''}
                        </td>
                        <td style="padding: 8px;">
                            <select class="property-type" data-header="${this.escapeHtml(header)}" style="width: 100%; padding: 4px; border: 1px solid ${colors.inputBorder}; border-radius: 4px; background: ${colors.input}; color: ${colors.text};">
                                <option value="text" ${typeHint === 'text' ? 'selected' : ''}>Text</option>
                                <option value="number" ${typeHint === 'number' ? 'selected' : ''}>Number</option>
                                <option value="datetime" ${typeHint === 'datetime' || typeHint === 'date' ? 'selected' : ''}>Date/Time</option>
                                <option value="checkbox" ${typeHint === 'checkbox' ? 'selected' : ''}>Checkbox</option>
                                <option value="choice" ${typeHint === 'choice' ? 'selected' : ''}>Choice (dropdown)</option>
                                <option value="url" ${typeHint === 'url' ? 'selected' : ''}>URL</option>
                            </select>
                        </td>
                    </tr>
                `;
            }).join('');

            dialog.innerHTML = `
                <h2 style="margin: 0 0 16px 0; color: ${colors.text};">Configure Properties</h2>
                <div style="margin-bottom: 16px; color: ${colors.textSecondary}; font-size: 14px;">
                    ${typeHints ? '✓ Type hints found in row 2. Review and adjust as needed.' : 'Select the type for each property:'}
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: ${colors.tableHeader};">
                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid ${colors.tableBorder}; color: ${colors.text};">Property Name</th>
                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid ${colors.tableBorder}; color: ${colors.text};">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${propertyRows}
                    </tbody>
                </table>
                <div style="margin-top: 16px; padding: 12px; background: ${this.isDarkMode() ? '#2d3d4d' : '#e3f2fd'}; border: 1px solid ${colors.primary}; border-radius: 4px; font-size: 13px; color: ${colors.text};">
                    <strong>💡 Tip:</strong> You can add a second row with type names (text, number, choice, etc.) to your CSV to skip this step next time.
                </div>
                <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px;">
                    <button id="prop-cancel-btn" style="padding: 8px 16px; border: 1px solid ${colors.buttonBorder}; background: ${colors.buttonBg}; color: ${colors.buttonText}; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button id="prop-confirm-btn" style="padding: 8px 16px; border: none; background: ${colors.primary}; color: #fff; border-radius: 4px; cursor: pointer;">Create Collection</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            // Handle buttons
            dialog.querySelector('#prop-cancel-btn').onclick = () => {
                document.body.removeChild(overlay);
                resolve(null);
            };

            dialog.querySelector('#prop-confirm-btn').onclick = () => {
                const selects = dialog.querySelectorAll('.property-type');
                const config = {};
                selects.forEach(select => {
                    const header = select.getAttribute('data-header');
                    config[header] = select.value;
                });
                document.body.removeChild(overlay);
                resolve(config);
            };

            // Close on overlay click
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(null);
                }
            };
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    buildChoiceOptions(headers, rows, propertyConfig) {
        const choiceOptions = {};

        headers.forEach((header, colIndex) => {
            const fieldType = propertyConfig[header];
            
            // Only process choice fields
            if (fieldType !== 'choice') return;

            // Extract all non-empty values from this column
            const values = rows
                .map(row => row[colIndex])
                .filter(val => val && val.trim())
                .map(val => val.trim());

            // Get unique values
            const uniqueValues = [...new Set(values)];

            // Build choice options array
            choiceOptions[header] = uniqueValues.map((value, idx) => ({
                id: this.normalizeFieldName(value) || `choice_${idx}`,
                label: value,
                color: String((idx % 12) + 1), // Cycle through colors 1-12
                active: true
            }));

            console.log(`[CSV Import] Found ${uniqueValues.length} unique values for choice field "${header}":`, uniqueValues);
        });

        return choiceOptions;
    }

    async createCollectionWithProperties(collectionName, headers, propertyConfig, choiceOptions = {}) {
        console.log('[CSV Import] Creating collection:', collectionName);
        console.log('[CSV Import] Properties:', propertyConfig);

        // Step 1: Create the collection
        const newCollection = await this.data.createCollection();
        if (!newCollection) {
            throw new Error('Failed to create collection');
        }

        console.log('[CSV Import] Collection created, GUID:', newCollection.getGuid());

        // Step 2: Get the existing configuration
        const config = newCollection.getConfiguration();
        console.log('[CSV Import] Initial config:', JSON.stringify(config, null, 2));

        // Step 3: Build fields array
        const fields = headers.map((header, idx) => {
            const fieldType = propertyConfig[header] || 'text';
            const fieldId = this.normalizeFieldName(header) || `field_${idx}`;

            const field = {
                id: fieldId,
                label: header,
                type: fieldType,
                icon: this.getIconForType(fieldType),
                many: false,
                read_only: false,
                active: true
            };

            // Add choices array for choice fields with actual options from CSV
            if (fieldType === 'choice') {
                field.choices = choiceOptions[header] || [];
                console.log(`[CSV Import] Added ${field.choices.length} choices for field "${header}"`);
            }

            return field;
        });

        console.log('[CSV Import] Built fields:', JSON.stringify(fields, null, 2));

        // Step 4: Update the existing configuration
        config.name = collectionName;
        config.icon = 'ti-database';
        config.item_name = 'Item';
        config.description = 'Imported from CSV';
        config.fields = fields;
        config.page_field_ids = fields.map(f => f.id);
        config.sidebar_record_sort_field_id = fields[0]?.id || 'title';
        config.sidebar_record_sort_dir = 'desc';
        config.show_sidebar_items = true;
        config.show_cmdpal_items = true;
        
        // Ensure views array exists and has a table view
        config.views = [
            {
                id: 'table',
                label: 'Table',
                description: 'Table view',
                type: 'table',
                icon: 'ti-table',
                shown: true,
                read_only: false,
                sort_field_id: fields[0]?.id || null,
                sort_dir: 'asc',
                group_by_field_id: null,
                field_ids: fields.map(f => f.id),
                query: '',
                opts: {}
            }
        ];

        console.log('[CSV Import] Updated config:', JSON.stringify(config, null, 2));

        // Step 5: Save the configuration
        console.log('[CSV Import] Calling saveConfiguration...');
        const success = await newCollection.saveConfiguration(config);
        console.log('[CSV Import] saveConfiguration returned:', success);
        
        if (success === false) {
            console.error('[CSV Import] saveConfiguration explicitly returned false');
            throw new Error('Failed to save collection configuration - API returned false');
        }

        // Step 6: Wait for sync (give it more time)
        console.log('[CSV Import] Waiting for configuration to sync...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 7: Get a fresh reference to the collection and verify
        console.log('[CSV Import] Getting fresh collection reference...');
        const allCollections = await this.data.getAllCollections();
        const freshCollection = allCollections.find(c => c.getGuid() === newCollection.getGuid());
        
        if (!freshCollection) {
            console.error('[CSV Import] Could not find collection after creation');
            throw new Error('Collection disappeared after creation');
        }

        const verifyConfig = freshCollection.getConfiguration();
        console.log('[CSV Import] Verification config:', JSON.stringify(verifyConfig, null, 2));
        console.log('[CSV Import] Verified fields count:', verifyConfig.fields?.length || 0);
        console.log('[CSV Import] Verified collection name:', verifyConfig.name);

        if (!verifyConfig.fields || verifyConfig.fields.length === 0) {
            console.error('[CSV Import] ERROR: Configuration fields are still empty after save and reload');
            console.error('[CSV Import] This might be a timing issue or API limitation');
            throw new Error('Failed to create fields - configuration did not persist');
        }

        console.log('[CSV Import] SUCCESS: Collection created with', verifyConfig.fields.length, 'fields');
        return freshCollection;
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    getIconForType(fieldType) {
        const iconMap = {
            'text': 'ti-text',
            'number': 'ti-123',
            'datetime': 'ti-calendar',
            'checkbox': 'ti-checkbox',
            'choice': 'ti-tag',
            'url': 'ti-link'
        };
        return iconMap[fieldType] || 'ti-text';
    }

    showStatus(statusDiv, message, type) {
        const colors = this.getThemeColors();
        statusDiv.style.display = 'block';
        statusDiv.textContent = message;
        statusDiv.style.padding = '12px';
        statusDiv.style.borderRadius = '4px';
        
        if (type === 'error') {
            statusDiv.style.background = this.isDarkMode() ? '#3d1f1f' : '#fee';
            statusDiv.style.border = `1px solid ${colors.error}`;
            statusDiv.style.color = colors.error;
        } else if (type === 'success') {
            statusDiv.style.background = this.isDarkMode() ? '#1f3d1f' : '#efe';
            statusDiv.style.border = `1px solid ${colors.success}`;
            statusDiv.style.color = colors.success;
        } else {
            statusDiv.style.background = this.isDarkMode() ? '#1f2d3d' : '#eef';
            statusDiv.style.border = `1px solid ${colors.info}`;
            statusDiv.style.color = colors.info;
        }
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
