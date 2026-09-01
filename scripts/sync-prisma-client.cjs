const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// 1. Temporarily point generator client output to ./temp_client
const tempOutput = path.join(__dirname, '..', 'prisma', 'temp_client');
const modifiedSchema = schemaContent.replace(
  /generator\s+client\s+\{/,
  'generator client {\n  output = "./temp_client"'
);

fs.writeFileSync(schemaPath, modifiedSchema, 'utf8');

try {
  console.log('Running npx prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  const targetDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  console.log('Syncing files to', targetDir);

  function copyFiles(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyFiles(srcPath, destPath);
      } else if (!entry.name.endsWith('.node') && !entry.name.endsWith('.tmp')) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  copyFiles(tempOutput, targetDir);
  console.log('Prisma Client files synchronized successfully!');
} finally {
  // Revert schema.prisma
  fs.writeFileSync(schemaPath, schemaContent, 'utf8');
  if (fs.existsSync(tempOutput)) {
    fs.rmSync(tempOutput, { recursive: true, force: true });
  }
}
