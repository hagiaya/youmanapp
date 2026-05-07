import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tqfpbznpuhkdxzcwnvgj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZnBiem5wdWhrZHh6Y3dudmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTcxMzQsImV4cCI6MjA4OTM5MzEzNH0.WQfBP-0WvlsjyyBWps2OSCu_1-AsyOHbaipOxJe3vKE"

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRLS() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'users' })
  // Note: get_policies is not a standard RPC, but we can try to insert and see the error.
  
  console.log('Attempting a test insert to check for RLS...')
  const testEmail = `test_${Math.random()}@example.com`
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ 
        name: 'Test User', 
        email: testEmail, 
        password: 'password123',
        role: 'User',
        phone_verified: false
    }])

  if (insertError) {
    console.error('Insert failed:', insertError)
  } else {
    console.log('Insert successful! RLS might be permissive.')
    // Cleanup
    await supabase.from('users').delete().eq('email', testEmail)
  }
}

checkRLS()
