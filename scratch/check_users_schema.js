import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tqfpbznpuhkdxzcwnvgj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZnBiem5wdWhrZHh6Y3dudmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTcxMzQsImV4cCI6MjA4OTM5MzEzNH0.WQfBP-0WvlsjyyBWps2OSCu_1-AsyOHbaipOxJe3vKE"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUsersTable() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching users:', error)
    return
  }

  console.log('User columns found:', Object.keys(data[0] || {}))
}

checkUsersTable()
