const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const printerSchemaPath = path.join(__dirname, "schema", "printer.schema.json");
const filamentSchemaPath = path.join(__dirname, "schema", "filament.schema.json");

const printerSchema = JSON.parse(fs.readFileSync(printerSchemaPath, "utf8"));
const filamentSchema = JSON.parse(fs.readFileSync(filamentSchemaPath, "utf8"));

const ajv = new Ajv({ allErrors: true, verbose: true, strict: false, allowMatchingProperties: true });
addFormats(ajv);

const validatePrinter = ajv.compile(printerSchema);
const validateFilament = ajv.compile(filamentSchema);

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(content);
  
  let validate;
  if (json.op3d_schema === "printer") {
    validate = validatePrinter;
  } else if (json.op3d_schema === "filament") {
    validate = validateFilament;
  } else {
    return { valid: false, error: `Unknown schema type: ${json.op3d_schema}` };
  }
  
  const valid = validate(json);
  if (!valid) {
    return { valid: false, errors: validate.errors };
  }
  return { valid: true };
}

function getJsonFiles(dir, extensions = [".json"]) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getJsonFiles(filePath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const printerDir = path.join(__dirname, "printer");
const filamentDir = path.join(__dirname, "filament");

const printerFiles = getJsonFiles(printerDir);
const filamentFiles = getJsonFiles(filamentDir);

console.log(`Found ${printerFiles.length} printer profiles and ${filamentFiles.length} filament profiles\n`);

let printerErrors = [];
let filamentErrors = [];

console.log("=== Validating Printer Profiles ===");
printerFiles.forEach(file => {
  const result = validateFile(file);
  if (!result.valid) {
    printerErrors.push({ file, errors: result.errors || result.error });
    console.log(`FAIL: ${path.relative(__dirname, file)}`);
    if (result.errors) {
      result.errors.forEach(e => console.log(`  - ${e.instancePath}: ${e.message}`));
    } else {
      console.log(`  - ${result.error}`);
    }
  } else {
    console.log(`OK:  ${path.relative(__dirname, file)}`);
  }
});

console.log("\n=== Validating Filament Profiles ===");
filamentFiles.forEach(file => {
  const result = validateFile(file);
  if (!result.valid) {
    filamentErrors.push({ file, errors: result.errors || result.error });
    console.log(`FAIL: ${path.relative(__dirname, file)}`);
    if (result.errors) {
      result.errors.forEach(e => console.log(`  - ${e.instancePath}: ${e.message}`));
    } else {
      console.log(`  - ${result.error}`);
    }
  } else {
    console.log(`OK:  ${path.relative(__dirname, file)}`);
  }
});

console.log("\n=== Summary ===");
console.log(`Printer profiles: ${printerFiles.length - printerErrors.length}/${printerFiles.length} valid`);
console.log(`Filament profiles: ${filamentFiles.length - filamentErrors.length}/${filamentFiles.length} valid`);

if (printerErrors.length > 0 || filamentErrors.length > 0) {
  console.log(`\nTotal errors: ${printerErrors.length + filamentErrors.length}`);
  process.exit(1);
}
