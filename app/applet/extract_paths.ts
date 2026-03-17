import fs from 'fs';

const content = fs.readFileSync('node_modules/react-nepal-map/dist/index.modern.js', 'utf8');
const matches = [...content.matchAll(/name:\s*'([^']+)',\s*zip:\s*\d+,\s*shape:\s*'([^']+)'/g)];

let totalLength = 0;
matches.forEach(m => {
  console.log(`${m[1]}: ${m[2].length} chars`);
  totalLength += m[2].length;
});
console.log(`Total path length: ${totalLength} chars`);
