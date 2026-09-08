# Sync source repo plugin to installed Obsidian plugin
$source = "C:\Users\Faza\Documents\ASA VAULT\Private Github\PROJECTS\Trading\TradeRythm"
$installed = "C:\Users\Faza\Documents\ASA VAULT\.obsidian\plugins\trade-rythm"

# Copy plugin files (NOT data.json - that's personal)
Copy-Item "$source\main.js" "$installed\main.js" -Force
Copy-Item "$source\styles.css" "$installed\styles.css" -Force
Copy-Item "$source\manifest.json" "$installed\manifest.json" -Force
Write-Host "Synced plugin files to installed location"
Write-Host "Restart Obsidian to apply changes"
