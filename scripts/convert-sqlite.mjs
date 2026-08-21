import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'backend', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const knownEnums = [
  'SchoolType', 'RoleName', 'StudentStatus', 'Gender', 'ContractType',
  'ContractStatus', 'LeaveType', 'LeaveStatus', 'Weekday',
  'AttendanceStatus', 'AttendanceMethod', 'ExamType',
  'DeliberationStatus', 'DisciplineType', 'DisciplineSeverity',
  'AnnouncementAudience', 'NotificationChannel', 'NotificationDeliveryStatus',
  'InvoiceStatus', 'PaymentMethod', 'FinancialAidType',
  'CashSessionStatus', 'CashTransactionType', 'CashTransactionStatus',
  'AccountType', 'JournalSourceType', 'BackupType', 'BackupStatus',
  'SyncDirection', 'SyncStatus'
];

// Replace enum type names in field declarations
// Pattern: line with field name, whitespace, enum name, optional attributes
const lines = schema.split('\n');
const replaced = lines.map(line => {
  for (const enumName of knownEnums) {
    // Match: fieldName   EnumType   @attributes or just fieldName   EnumType
    // Avoid matching model names like SchoolCategory
    const regex = new RegExp(`^\\s+(\\w+)\\s+${enumName}(\\s+.*)?$`);
    const match = line.match(regex);
    if (match) {
      // Make sure it's not a model name by checking if the "field name" is actually a relation
      // Relations use @relation or reference model names
      const fieldName = match[1];
      const rest = match[2] || '';
      
      // If the rest contains @relation or references a model, skip (it's a relation field)
      if (rest.includes('@relation') || rest.includes('@db.')) {
        continue;
      }
      
      return line.replace(new RegExp(`\\s+${enumName}`), ' String');
    }
  }
  return line;
});

schema = replaced.join('\n');
fs.writeFileSync(schemaPath, schema);
console.log('Enum field types replaced with String');
