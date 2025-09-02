import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uhtbtbenblexmyvjegca.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVodGJ0YmVuYmxleG15dmplZ2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MDMzMjMsImV4cCI6MjA3MjM3OTMyM30.zDC1NCKaofHpZ5QuKkMpVqgwq1kiWH3C_mvkTNqscVo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);