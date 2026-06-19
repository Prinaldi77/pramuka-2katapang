const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace class names: prefix-pramuka -> prefix-primary
  // This covers text-pramuka, bg-pramuka, hover:bg-pramuka, etc.
  content = content.replace(/\b([a-z0-9:-]+)-pramuka\b/g, '$1-primary');
  
  // Replace prefix-pramuka/opacity
  content = content.replace(/\b([a-z0-9:-]+)-pramuka\/(\d+)\b/g, '$1-primary/$2');
  
  // Replace prefix-pramuka-number (e.g. text-pramuka-800)
  content = content.replace(/\b([a-z0-9:-]+)-pramuka-(\d+)\b/g, '$1-primary-$2');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log(`Done. Changed ${changedFiles} files.`);
