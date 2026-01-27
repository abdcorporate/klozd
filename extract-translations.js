const fs = require('fs');
const content = fs.readFileSync('/Users/hamzaabdessadek/Downloads/saveweb2zip-com-kleed-flow-lovable-app/js/index-BgtM3Jyb.js', 'utf8');

// Trouver l'objet de traduction complet
const start = content.indexOf('const fD={');
if (start === -1) {
  console.error('Translation object not found');
  process.exit(1);
}

let depth = 0;
let end = start;
for (let i = start + 9; i < content.length; i++) {
  if (content[i] === '{') depth++;
  if (content[i] === '}') {
    depth--;
    if (depth === 0) {
      end = i + 1;
      break;
    }
  }
}

const translations = content.substring(start + 9, end - 1);
// Nettoyer et formater
let cleaned = translations
  .replace(/!0/g, 'true')
  .replace(/!1/g, 'false')
  .replace(/void 0/g, 'undefined');

// Écrire dans un fichier
fs.writeFileSync('/Users/hamzaabdessadek/StudioProjects/klozd/translations-raw.json', cleaned);
console.log('Translations extracted to translations-raw.json');
console.log('Length:', cleaned.length);
console.log('First 2000 chars:');
console.log(cleaned.substring(0, 2000));
