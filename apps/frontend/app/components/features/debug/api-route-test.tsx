'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { useTimeBlocks } from '@/app/hooks/use-time-blocks';
import { useTimeBlockMutations, CreateTimeBlockInput } from '@/app/hooks/use-time-block-mutations';
import { TimeBlock } from '@/app/types/time-block';

export function ApiRouteTest() {
  const [activeTab, setActiveTab] = useState('fetch');
  const [logs, setLogs] = useState<string[]>([]);
  const [resultBlocks, setResultBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllBlocks, setShowAllBlocks] = useState(false);
  
  // Get hooks
  const { 
    timeBlocks: fetchedBlocks, 
    loading: fetchLoading, 
    error: fetchError, 
    usingApiRoute: fetchUsingApi 
  } = useTimeBlocks(
    showAllBlocks ? 'all' : 'today', 
    new Date(), 
    { showAllBlocks }
  );
  
  const {
    createTimeBlock,
    deleteTimeBlock,
    loading: mutationLoading,
    error: mutationError,
    usingApiRoute: mutationUsingApi
  } = useTimeBlockMutations();
  
  // Function to add a log message
  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev]);
  };
  
  // Clear logs
  const clearLogs = () => {
    setLogs([]);
  };
  
  // Fetch time blocks
  const fetchTimeBlocks = async () => {
    setLoading(true);
    addLog(`Fetching time blocks (using API: ${fetchUsingApi})`);
    
    try {
      // The fetchedBlocks are already loaded by the hook
      setResultBlocks(fetchedBlocks);
      
      if (fetchError) {
        addLog(`Error fetching time blocks: ${fetchError}`);
      } else {
        addLog(`Successfully fetched ${fetchedBlocks.length} time blocks`);
      }
    } catch (error: any) {
      addLog(`Error in fetch operation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Create a test time block
  const createTestTimeBlock = async () => {
    setLoading(true);
    
    try {
      addLog("Creating test time block...");
      
      // Create a time block for today from 10am to 11am
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(10, 0, 0, 0);
      const endTime = new Date(now);
      endTime.setHours(11, 0, 0, 0);
      
      const newBlock: CreateTimeBlockInput = {
        time_block_label: "Test Block via API",
        description: "Created through API route test",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_billable: true,
        client_id: "demo-client-123"
      };
      
      const result = await createTimeBlock(newBlock);
      
      if (!result) {
        addLog(`Error creating time block: ${mutationError || 'Unknown error'}`);
      } else {
        addLog(`Successfully created time block: ${result.time_block_id}`);
        setResultBlocks([result]);
      }
    } catch (error: any) {
      addLog(`Error in create operation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete a time block
  const handleDeleteTimeBlock = async (timeBlockId: string) => {
    setLoading(true);
    
    try {
      addLog(`Deleting time block: ${timeBlockId}`);
      
      const success = await deleteTimeBlock(timeBlockId);
      
      if (!success) {
        addLog(`Error deleting time block: ${mutationError || 'Unknown error'}`);
      } else {
        addLog(`Successfully deleted time block: ${timeBlockId}`);
        // Remove from the result blocks
        setResultBlocks(prev => prev.filter(block => block.time_block_id !== timeBlockId));
      }
    } catch (error: any) {
      addLog(`Error in delete operation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>API Route Testing</CardTitle>
        <CardDescription>
          Test the time block API routes for CRUD operations
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="fetch" className="flex-1">
              Fetch Time Blocks
            </TabsTrigger>
            <TabsTrigger value="create" className="flex-1">
              Create Time Block
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex-1">
              Delete Time Block
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="fetch">
            <div className="flex items-center gap-4 mb-4">
              <Button onClick={fetchTimeBlocks} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Time Blocks'}
              </Button>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showAllBlocks"
                  checked={showAllBlocks}
                  onChange={() => setShowAllBlocks(!showAllBlocks)}
                />
                <label htmlFor="showAllBlocks">Show All Blocks</label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="create">
            <Button onClick={createTestTimeBlock} disabled={loading}>
              {loading ? 'Creating...' : 'Create Test Time Block'}
            </Button>
          </TabsContent>
          
          <TabsContent value="delete">
            <div className="space-y-2">
              <p className="text-sm">Select a time block to delete:</p>
              {fetchedBlocks.length === 0 ? (
                <p className="text-sm italic">No time blocks available. Fetch blocks first.</p>
              ) : (
                <div className="grid gap-2">
                  {fetchedBlocks.map((block) => (
                    <div key={block.time_block_id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{block.time_block_label}</p>
                        <p className="text-xs">
                          {new Date(block.start_time).toLocaleString()} - {new Date(block.end_time).toLocaleString()}
                        </p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteTimeBlock(block.time_block_id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Results area */}
          <div className="mt-8 border rounded-md p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Results</h3>
              <Button variant="outline" size="sm" onClick={() => setResultBlocks([])}>Clear</Button>
            </div>
            
            {resultBlocks.length === 0 ? (
              <p className="text-sm italic">No results to display.</p>
            ) : (
              <div className="space-y-2">
                {resultBlocks.map((block) => (
                  <div key={block.time_block_id} className="p-2 border rounded bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{block.time_block_label}</p>
                        <p className="text-xs">{block.time_block_id}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p>{new Date(block.start_time).toLocaleString()}</p>
                        <p>to {new Date(block.end_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm mt-1">{block.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Debug logs */}
          <div className="mt-6 border rounded-md p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Debug Logs</h3>
              <Button variant="outline" size="sm" onClick={clearLogs}>Clear Logs</Button>
            </div>
            
            <div className="max-h-60 overflow-y-auto text-sm font-mono">
              {logs.length === 0 ? (
                <p className="text-sm italic">No logs to display.</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="border-b py-1 last:border-0">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-xs text-slate-500">
            API mode: {activeTab === 'fetch' ? (fetchUsingApi ? 'API Route' : 'Direct DB') : (mutationUsingApi ? 'API Route' : 'Direct DB')}
          </div>
          <div className="text-xs text-slate-500">
            {loading ? 'Processing...' : 'Idle'}
          </div>
        </CardFooter>
      </Tabs>
    </Card>
  );
} 