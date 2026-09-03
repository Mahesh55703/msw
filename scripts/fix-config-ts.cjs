const fs = require('fs');

let configContent = fs.readFileSync('app/actions/configuration.ts', 'utf8');

configContent = configContent.replace(
  "import { logAdminAction } from '@/lib/audit'\n",
  ""
);

configContent = configContent.replace(
  /await logAdminAction\('CONFIGURATION_UPDATED', session\.userId as string, null, \{\r?\n\s*changedFields: Object\.keys\(validated\.data\)\r?\n\s*\}\)/,
  `await prisma.adminAuditLog.create({
      data: {
        action: 'CONFIGURATION_UPDATED',
        actorId: session.userId,
        targetId: null,
        metadata: { changedFields: Object.keys(validated.data) },
      }
    })`
);

fs.writeFileSync('app/actions/configuration.ts', configContent);

let formContent = fs.readFileSync('app/admin/configuration/ConfigurationForm.tsx', 'utf8');
formContent = formContent.replace(/isOpen=\{isMediaPickerOpen\}/g, "open={isMediaPickerOpen}");
formContent = formContent.replace(/onClose=\{/g, "onOpenChange={(open) => !open && ");
fs.writeFileSync('app/admin/configuration/ConfigurationForm.tsx', formContent);
