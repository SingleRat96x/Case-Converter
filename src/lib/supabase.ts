import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://suzddwrutaoeuyiaxgfz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1emRkd3J1dGFvZXV5aWF4Z2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NjE4NDEsImV4cCI6MjA1MjMzNzg0MX0.78PSS_nDwZ0FsMlNKxYVOOIemQmFiTwmsfKbmK-9tmI';

export const supabase = createClient(supabaseUrl, supabaseKey); 