/**
 * Simple script to run the WO-2025-022 migration
 * Run this from your project root with: npx tsx run-migration.ts
 */

import { migrateWO2025_022 } from './db/migrations/migrate_wo_2025_022'

async function main() {
  try {
    console.log('🚀 Starting WO-2025-022 migration...')
    const result = await migrateWO2025_022()
    console.log('✅ Migration completed successfully:', result)
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

main()