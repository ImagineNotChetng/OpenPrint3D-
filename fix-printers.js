const fs = require("fs");
const path = require("path");

const printerDir = path.join(__dirname, "printer");

function getJsonFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFiles(filePath));
    } else if (file.endsWith(".json")) {
      results.push(filePath);
    }
  });
  return results;
}

const fixes = {
  min_temp: { from: 0, to: 170 },
  chamber: { from: '"max_temp": 0', to: '' },
  firmware: { from: '"flavor": "Marlin"', to: '"flavor": "marlin"' },
  firmware_klipper: { from: '"flavor": "Klipper"', to: '"flavor": "klipper"' },
  firmware_bambu: { from: '"flavor": "Bambu"', to: '"flavor": "bambu"' },
  nozzle_material_hardened: { from: '"nozzle_material": "Hardened Steel"', to: '"nozzle_material": "hardened-steel"' },
  nozzle_material_stainless: { from: '"nozzle_material": "Stainless Steel"', to: '"nozzle_material": "stainless-steel"' },
};

const printerFiles = getJsonFiles(printerDir);
let fixedCount = 0;

printerFiles.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  let original = content;

  content = content.replace(/"min_temp":\s*0/g, '"min_temp": 170');
  content = content.replace(/"max_temp":\s*0/g, '"max_temp": 100');
  content = content.replace(/"flavor":\s*"Marlin"/g, '"flavor": "marlin"');
  content = content.replace(/"flavor":\s*"Klipper"/g, '"flavor": "klipper"');
  content = content.replace(/"flavor":\s*"Bambu"/g, '"flavor": "bambu"');
  content = content.replace(/"flavor":\s*"RepRap"/g, '"flavor": "reprap"');
  content = content.replace(/"flavor":\s*"Prusa"/g, '"flavor": "prusa"');
  content = content.replace(/"flavor":\s*"Unknown"/g, '"flavor": "other"');
  content = content.replace(/"flavor":\s*"Creality"/g, '"flavor": "marlin"');
  content = content.replace(/"nozzle_material":\s*"Hardened Steel"/g, '"nozzle_material": "hardened-steel"');
  content = content.replace(/"nozzle_material":\s*"Stainless Steel"/g, '"nozzle_material": "stainless-steel"');
  content = content.replace(/"nozzle_material":\s*"Ruby"/g, '"nozzle_material": "hardened-steel"');
  content = content.replace(/"flavor":\s*"IdeaMaker"/g, '"flavor": "marlin"');
  content = content.replace(/"flavor":\s*"S3G"/g, '"flavor": "other"');
  content = content.replace(/"flavor":\s*"n\/a"/g, '"flavor": "other"');
  content = content.replace(/"flavor":\s*"Makerbot"/g, '"flavor": "other"');
  content = content.replace(/"flavor":\s*"Stratasys"/g, '"flavor": "other"');
  content = content.replace(/"flavor":\s*"Ultimaker"/g, '"flavor": "marlin"');
  content = content.replace(/"chamber":\s*\{[^}]*"max_temp":\s*0[^}]*\}/g, (match) => {
    return match.replace(/"max_temp":\s*0,?/g, '').replace(/,\s*}/, '}').replace(/\{\s*\}/, '{}');
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Fixed: ${path.relative(__dirname, file)}`);
    fixedCount++;
  }
});

console.log(`\nTotal files fixed: ${fixedCount}`);
