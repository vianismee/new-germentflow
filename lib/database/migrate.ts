import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function runMigrations() {
  const supabase = createClient()

  try {
    console.log('🚀 Starting RLS migrations...')

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`📁 Found ${migrationFiles.length} migration files`)

    // Create migration tracking table if it doesn't exist
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename TEXT UNIQUE NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    })

    if (tableError) {
      console.log('ℹ️ Migration table might already exist:', tableError.message)
    }

    // Run each migration that hasn't been executed yet
    for (const file of migrationFiles) {
      console.log(`📄 Processing migration: ${file}`)

      // Check if migration already executed
      const { data: executedMigrations } = await supabase
        .from('migrations')
        .select('filename')
        .eq('filename', file)

      if (executedMigrations && executedMigrations.length > 0) {
        console.log(`✅ Migration ${file} already executed, skipping...`)
        continue
      }

      // Read and execute migration
      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

      const { error: migrationError } = await supabase.rpc('exec_sql', {
        sql: migrationSQL
      })

      if (migrationError) {
        console.error(`❌ Error executing migration ${file}:`, migrationError)
        throw migrationError
      }

      // Record migration as executed
      const { error: recordError } = await supabase
        .from('migrations')
        .insert({ filename: file })

      if (recordError) {
        console.error(`❌ Error recording migration ${file}:`, recordError)
        throw recordError
      }

      console.log(`✅ Migration ${file} executed successfully`)
    }

    console.log('🎉 All RLS migrations completed successfully!')

    return { success: true, message: 'RLS policies implemented successfully' }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Helper function to create SQL executor function if it doesn't exist
export async function setupSQLExecutor() {
  const supabase = createClient()

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  })

  if (error) {
    console.log('ℹ️ SQL executor function might already exist:', error.message)
  }
}