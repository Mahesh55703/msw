import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { resourcesData } from '../data/resources'
import { ChecklistContentPayload } from '../lib/validations/checklist'

const prisma = new PrismaClient()

async function migrateChecklists() {
  console.log('--- Starting Checklists Data Hydration ---')

  const dbChecklists = await prisma.article.findMany({
    where: { category: { in: ['checklists', 'checklist'] } },
  })

  console.log(`Found ${dbChecklists.length} existing checklists in Prisma database.`)

  for (const item of dbChecklists) {
    let currentContent: any = null
    try {
      currentContent = JSON.parse(item.content)
    } catch (e) {
      currentContent = null
    }

    // If already structured with sections, keep it
    if (currentContent && Array.isArray(currentContent.sections) && currentContent.sections.length > 0) {
      console.log(`- [${item.slug}] Already structured. Skipping.`)
      continue
    }

    // Match with static resourcesData
    const staticItem = resourcesData.find((r) => r.slug === item.slug)

    let sections: any[] = []
    let purpose = item.excerpt || 'A comprehensive statutory verification checklist to evaluate compliance standing.'
    let audience = ['Factory HR leadership', 'Compliance officers', 'Plant & factory managers', 'Principal employers']

    if (staticItem && Array.isArray((staticItem as any).checklistItems)) {
      sections = (staticItem as any).checklistItems.map((cat: any, cIdx: number) => ({
        id: `sec-${cIdx + 1}`,
        title: cat.category,
        items: (cat.items || []).map((text: string, iIdx: number) => ({
          id: `item-${cIdx + 1}-${iIdx + 1}`,
          text,
          guidance: `Verify records and compliance documents against statutory requirements.`,
        })),
      }))
    } else {
      // Default fallback section
      sections = [
        {
          id: 'sec-1',
          title: 'General Statutory Compliance Checkpoints',
          items: [
            { id: 'item-1-1', text: 'Applicable establishment registrations and licences verified', guidance: 'Check validity against statutory registry.' },
            { id: 'item-1-2', text: 'Mandatory statutory registers and muster rolls maintained', guidance: 'Ensure regular inspection and digital/physical backups.' },
            { id: 'item-1-3', text: 'Monthly wage computation and timely disbursement verified', guidance: 'Match bank statements with attendance and overtime sheets.' },
          ],
        },
      ]
    }

    const payload: ChecklistContentPayload = {
      purpose,
      audience,
      sections,
      downloadableFile: null,
      notes: item.content && !item.content.includes('Coming soon') ? item.content : '',
    }

    await prisma.article.update({
      where: { id: item.id },
      data: {
        category: 'checklists',
        content: JSON.stringify(payload),
        scheduledAt: item.scheduledAt || new Date('2026-08-28'),
      },
    })

    console.log(`+ [${item.slug}] Hydrated with ${sections.length} sections (${sections.reduce((a, s) => a + s.items.length, 0)} total items).`)
  }

  console.log('--- Checklists Data Hydration Complete ---')
}

migrateChecklists()
  .catch((err) => {
    console.error('Migration error:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
