import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [detailedLogs, setDetailedLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDetailedLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createTableSQL = `-- Create the images table
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  supabase_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  file_size TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'completed',
  message_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  ocr_text TEXT DEFAULT '',
  detected_objects JSONB DEFAULT '[]'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON images(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_supabase_path ON images(supabase_path);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations" ON images FOR ALL USING (true);`;

  const fixPermissionsSQL = `-- Fix permissions if you get 'permission denied'
DROP POLICY IF EXISTS "Allow all operations" ON images;
CREATE POLICY "Allow all operations" ON images FOR ALL USING (true);

-- Or for authenticated users only:
-- DROP POLICY IF EXISTS "Allow authenticated users" ON images;
-- CREATE POLICY "Allow authenticated users" ON images FOR ALL USING (auth.role() = 'authenticated');`;

  const testDatabase = async () => {
    try {
      setTestResult('🔍 Running comprehensive database tests...');
      setDetailedLogs([]);
      
      addLog('Starting database connection tests...');
      
      // Test 1: Basic connection (don't require auth for basic operations)
      addLog('Test 1: Basic Supabase connection...');
      try {
        // Just test if we can reach Supabase
        const { data: testConnection, error: connectionError } = await supabase
          .from('messages')  // Use existing table to test connection
          .select('count')
          .limit(1);
          
        if (connectionError) {
          addLog(`❌ Connection error: ${connectionError.message}`);
          setTestResult('❌ Cannot connect to Supabase. Check your internet connection and API keys.');
          return;
        } else {
          addLog('✅ Basic connection successful');
        }
      } catch (err) {
        addLog(`❌ Connection test failed: ${err}`);
        setTestResult('❌ Cannot connect to Supabase. Check your configuration.');
        return;
      }
      
      // Test 2: Check if images table exists
      addLog('Test 2: Checking if images table exists...');
      const { data: tableData, error: tableError } = await supabase
        .from('images')
        .select('*')
        .limit(1);
        
      if (tableError) {
        if (tableError.code === 'PGRST205') {
          addLog('❌ Images table does not exist');
          addLog('📝 SOLUTION: Create the images table using the SQL below');
          
          setTestResult(`❌ Images table missing!\n\n📋 Copy and run this SQL in your Supabase SQL Editor:\n\n${createTableSQL}`);
          return;
        } else {
          addLog(`❌ Unexpected table error: ${tableError.message}`);
          setTestResult(`❌ Table Error: ${tableError.message}`);
          return;
        }
      } else {
        addLog('✅ Images table exists and is accessible');
      }
      
      // Test 3: Test INSERT operation
      addLog('Test 3: Testing INSERT operation...');
      const testRecord = {
        filename: `test-${Date.now()}.png`,
        supabase_path: `test-path-${Date.now()}`,
        public_url: `https://example.com/test-${Date.now()}.png`,
        file_size: '1.0 MB',
        uploaded_at: new Date().toISOString(),
        status: 'completed',
        message_count: 0,
        tags: ['test'],
        ocr_text: 'test text',
        detected_objects: [{ label: 'test', confidence: 0.9 }],
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('images')
        .insert([testRecord])
        .select()
        .single();
        
      if (insertError) {
        addLog(`❌ INSERT error: ${insertError.message}`);
        
        if (insertError.message.includes('permission denied') || insertError.code === '42501') {
          addLog('🚫 SOLUTION: Check RLS policies');
          setTestResult(`❌ Permission denied!\n\n🔧 Run this SQL to fix permissions:\n\n${fixPermissionsSQL}`);
        } else {
          addLog(`Error code: ${insertError.code}`);
          setTestResult(`❌ INSERT Failed: ${insertError.message}\n\nCheck the detailed logs for more info.`);
        }
        
        // Clean up if partially inserted
        if (insertData?.id) {
          await supabase.from('images').delete().eq('id', insertData.id);
        }
      } else {
        addLog('✅ INSERT operation successful');
        addLog(`Test record ID: ${insertData.id}`);
        
        // Clean up test record
        await supabase.from('images').delete().eq('id', insertData.id);
        addLog('✅ Test record cleaned up');
        
        setTestResult('🎉 All tests passed! Your database is ready for uploads.');
      }
      
      // Test 4: Storage check
      addLog('Test 4: Testing storage access...');
      const { data: storageData, error: storageError } = await supabase.storage
        .from('images')
        .list('', { limit: 1 });
        
      if (storageError) {
        addLog(`❌ Storage error: ${storageError.message}`);
      } else {
        addLog('✅ Storage access successful');
      }
      
    } catch (err: any) {
      addLog(`💥 Unexpected error: ${err.message}`);
      setTestResult(`❌ Unexpected error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">🔧 Database Diagnostic Tool</h3>
      <Button onClick={testDatabase} className="mb-4">
        Run Full Diagnostic Test
      </Button>
      <div className="p-3 bg-muted rounded text-sm font-mono whitespace-pre-wrap mb-4">
        {testResult || 'Click the button to run comprehensive database tests'}
      </div>
      
      {detailedLogs.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-2">📋 Detailed Logs:</h4>
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono max-h-60 overflow-y-auto">
            {detailedLogs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
