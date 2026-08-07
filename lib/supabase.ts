import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ysjnahgmigdmroipxkay.supabase.co'
const supabaseKey = 'sb_publishable_QXqwXeDu3GuHq26yTYmNJQ_VGLHT_m2'

export const supabase = createClient(supabaseUrl, supabaseKey)
