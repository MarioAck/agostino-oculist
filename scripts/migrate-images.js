const fs = require('fs');
const path = require('path');

// Path to items.json
const dataPath = path.join(__dirname, '..', 'data', 'items.json');

console.log('Reading items.json...');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let modified = false;

// Migrate best sellers
data.bestSellers = data.bestSellers.map(item => {
  if (!item.images || item.images.length === 0) {
    modified = true;
    console.log(`Adding images array to best seller: ${item.id}`);
    return {
      ...item,
      images: [item.image]
    };
  }
  return item;
});

// Migrate sale items
data.saleItems = data.saleItems.map(item => {
  if (!item.images || item.images.length === 0) {
    modified = true;
    console.log(`Adding images array to sale item: ${item.id}`);
    return {
      ...item,
      images: [item.image]
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
  console.log('No migration needed. All items already have images array.');
}
