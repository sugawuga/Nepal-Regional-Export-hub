import fs from 'fs';

const mapDataContent = fs.readFileSync('node_modules/react-nepal-map/dist/index.modern.js', 'utf8');
const matches = [...mapDataContent.matchAll(/name:\s*'([^']+)',\s*zip:\s*\d+,\s*shape:\s*'([^']+)'/g)];

const provinceMapping: Record<string, string> = {
  'Province 1': 'koshi',
  'Province 2': 'madhesh',
  'Province 3': 'bagmati',
  'Province 4': 'gandaki',
  'Province 5': 'lumbini',
  'Province 6': 'karnali',
  'Province 7': 'sudurpashchim'
};

let svgPaths = '';
matches.forEach(m => {
  const name = m[1];
  const shape = m[2];
  const id = provinceMapping[name];
  
  svgPaths += `
              <path
                id="${id}"
                d="${shape}"
                onMouseEnter={() => setHoveredProvince('${id}')}
                onMouseLeave={() => setHoveredProvince(null)}
                className={\`cursor-pointer transition-all duration-300 \${
                  hoveredProvince === '${id}'
                    ? 'fill-emerald-600 stroke-emerald-800 scale-[1.01] origin-center'
                    : 'fill-emerald-100 hover:fill-emerald-300'
                }\`}
              />`;
});

const componentPath = 'components/NepalInteractiveMap.tsx';
let componentContent = fs.readFileSync(componentPath, 'utf8');

// Replace the <g> contents
const startTag = '<g className="stroke-white stroke-2 stroke-linejoin-round">';
const endTag = '</g>';
const startIndex = componentContent.indexOf(startTag) + startTag.length;
const endIndex = componentContent.indexOf(endTag);

componentContent = componentContent.substring(0, startIndex) + svgPaths + '\n            ' + componentContent.substring(endIndex);

// Update viewBox
componentContent = componentContent.replace('viewBox="0 0 800 400"', 'viewBox="0 0 1029.19 522.34"');

fs.writeFileSync(componentPath, componentContent);
console.log('Component updated successfully.');
