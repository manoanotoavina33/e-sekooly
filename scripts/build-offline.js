const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(process.cwd());
const backendDir = path.join(root, 'backend');

console.log('🔧 Préparation du build offline...');

// 1. Vérifier que le schéma est en mode SQLite
const schemaPath = path.join(backendDir, 'prisma', 'schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');
if (!schema.includes('provider = "sqlite"')) {
  console.error('❌ Le schéma Prisma n\'est pas en mode SQLite.');
  process.exit(1);
}

// 2. Générer le client Prisma
console.log('📦 Génération du client Prisma...');
execSync('npx prisma generate', { cwd: backendDir, stdio: 'inherit' });

// 3. Appliquer les migrations et seed
console.log('🗄️ Initialisation de la base SQLite...');
try {
  execSync('npx prisma migrate deploy', { cwd: backendDir, stdio: 'inherit' });
} catch (e) {
  console.log('⚠️ migrate deploy a échoué, tentative avec migrate dev...');
  execSync('npx prisma migrate dev --name init', { cwd: backendDir, stdio: 'inherit' });
}

console.log('🌱 Exécution du seed...');
try {
  execSync('npx prisma db seed', { cwd: backendDir, stdio: 'inherit' });
} catch (e) {
  console.log('⚠️ Seed échoué (peut-être déjà exécuté)');
}

// 4. Compiler le backend
console.log('🔨 Build du backend...');
execSync('npm run build', { cwd: backendDir, stdio: 'inherit' });

console.log('✅ Build offline prêt');
