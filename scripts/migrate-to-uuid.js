const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Path to items.json
const dataPath = path.join(__dirname, '..', 'data', 'items.json');

console.log('Reading items.json...');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let modified = false;

// Function to check if a string is already a UUID
function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Migrate best sellers
data.bestSellers = data.bestSellers.map(item => {
  if (!isUUID(item.id)) {
    modified = true;
    const oldId = item.id;
    const newId = crypto.randomUUID();
    console.log(`Converting best seller ID: ${oldId} -> ${newId}`);
    return {
      ...item,
      id: newId
    };
  }
  return item;
});

// Migrate sale items
data.saleItems = data.saleItems.map(item => {
  if (!isUUID(item.id)) {
    modified = true;
    const oldId = item.id;
    const newId = crypto.randomUUID();
    console.log(`Converting sale item ID: ${oldId} -> ${newId}`);
    return {
      ...item,
      id: newId
    };
  }
  return item;
});

if (modified) {
  // Backup original file
  const backupPath = dataPath + '.backup.' + Date.now();
  fs.writeFileSync(backupPath, fs.readFileSync(dataPath));
  console.log(`Backup created: ${backupPath}`);

  // Write migrated data
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Migration completed successfully!');
  console.log(`Updated ${data.bestSellers.length} best sellers and ${data.saleItems.length} sale items`);
} else {
  console.log('No migration needed. All items already have UUIDs.');
}
