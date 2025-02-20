'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import type { Node, Edge } from 'reactflow';
import { Info } from 'lucide-react';

const ReactFlowProvider = dynamic(
  () => import('reactflow').then((mod) => mod.ReactFlowProvider),
  { ssr: false }
);

const ReactFlowWrapper = dynamic(
  () => import('reactflow').then((mod) => {
    const { Background, Controls, ReactFlow: Flow, MarkerType } = mod;
    return function Wrapper({ nodes, edges }: { nodes: Node[], edges: Edge[] }) {
      return (
        <ReactFlowProvider>
          <Flow
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable
            nodesConnectable={false}
            minZoom={0.1}
            maxZoom={1.5}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 24,
                height: 24,
              },
              style: {
                strokeWidth: 2,
                stroke: '#2563eb',
              },
            }}
          >
            <Background 
              gap={20}
              size={1}
              color="var(--grid-color, #f1f1f1)"
              className="dark:bg-gray-900"
            />
            <Controls className="dark:bg-gray-800 dark:border-gray-700" />
          </Flow>
        </ReactFlowProvider>
      );
    };
  }),
  { ssr: false }
);

// Import the CSS only on the client side
const ReactFlowStyles = () => {
  useEffect(() => {
    import('reactflow/dist/style.css').catch(() => {
      console.warn('Failed to load ReactFlow styles');
    });
  }, []);
  return null;
};

type Column = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

type TableSchema = {
  table_name: string;
  columns: Column[];
};

// Layout configuration
const LAYOUT_CONFIG = {
  SPACING_X: 350,
  SPACING_Y: 200,
  NODE_WIDTH: 220,
  NODE_HEIGHT: 40,
  LEVELS: {
    TOP: 50,      // Organizations
    SECOND: 250,  // Users, Projects
    THIRD: 450,   // Time Blocks, Invoices, Engagement Letters
    FOURTH: 650,  // Invoice Items
  }
};

// Define hierarchical positions for each table
const TABLE_POSITIONS = {
  organizations: { x: 600, y: LAYOUT_CONFIG.LEVELS.TOP },    // Center top
  
  // Second Level
  users: { x: 400, y: LAYOUT_CONFIG.LEVELS.SECOND },        // Left branch
  projects: { x: 800, y: LAYOUT_CONFIG.LEVELS.SECOND },     // Right branch
  
  // Third Level
  time_blocks: { x: 600, y: LAYOUT_CONFIG.LEVELS.THIRD },   // Center under projects
  invoices: { x: 900, y: LAYOUT_CONFIG.LEVELS.THIRD },      // Right
  engagement_letters: { x: 300, y: LAYOUT_CONFIG.LEVELS.THIRD }, // Left
  
  // Fourth Level
  invoice_items: { x: 900, y: LAYOUT_CONFIG.LEVELS.FOURTH }, // Under invoices
} as const;

// Relationship types and their colors - using more vibrant colors for dark mode visibility
const RELATIONSHIP_TYPES = {
  OWNERSHIP: {
    color: '#3b82f6',
    darkColor: '#60a5fa',
    description: 'Organizational Structure',
    thickness: 3,
  },
  WORKFLOW: {
    color: '#10b981',
    darkColor: '#34d399',
    description: 'Workflow Process',
    thickness: 2,
  },
  REFERENCE: {
    color: '#8b5cf6',
    darkColor: '#a78bfa',
    description: 'Reference',
    thickness: 1,
  }
} as const;

const SCHEMA_DESCRIPTIONS = {
  organizations: {
    description: 'Core entity representing companies or business units',
    relationships: 'Central entity that owns projects and users'
  },
  projects: {
    description: 'Client projects or engagements',
    relationships: 'Belongs to an organization, contains time blocks'
  },
  time_blocks: {
    description: 'Time entries for work performed',
    relationships: 'Connected to projects and users, can be billed through invoice items'
  },
  invoices: {
    description: 'Billing documents for clients',
    relationships: 'Contains invoice items, linked to organizations and users'
  },
  invoice_items: {
    description: 'Individual line items in invoices',
    relationships: 'Connected to invoices and time blocks'
  },
  users: {
    description: 'Individual users of the system',
    relationships: 'Belongs to an organization, creates time blocks and invoices'
  },
  engagement_letters: {
    description: 'Legal documents for client engagements',
    relationships: 'Belongs to organization, assigned to individual users'
  }
} as const;

export default function TestSupabase() {
  const [schemas, setSchemas] = useState<TableSchema[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'tables' | 'relationships'>('tables');

  useEffect(() => {
    async function fetchTableSchemas() {
      try {
        const { data: tables, error: tablesError } = await supabase
          .rpc('get_table_schemas')
          .select('*');

        if (tablesError) {
          await supabase.rpc('create_schema_function');
          const retryResult = await supabase.rpc('get_table_schemas').select('*');
          if (retryResult.error) throw retryResult.error;
          setSchemas(retryResult.data);
        } else {
          setSchemas(tables);
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTableSchemas();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold">Loading database schema...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-bold text-red-600">Error Loading Schema</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  function formatColumnDefault(value: string | null) {
    if (!value) return 'None';
    if (value === 'now()') return 'Current timestamp';
    if (value === 'uuid_generate_v4()') return 'Auto-generated UUID';
    return value;
  }

  function formatDataType(type: string) {
    switch (type) {
      case 'timestamp with time zone':
        return 'Date and time';
      case 'uuid':
        return 'Unique ID';
      case 'text':
        return 'Text';
      default:
        return type;
    }
  }

  function getRelationshipType(sourceTable: string, targetTable: string, fieldName: string) {
    // Organizational relationships
    if (fieldName === 'organization_id') {
      return RELATIONSHIP_TYPES.OWNERSHIP;
    }
    
    // Workflow relationships
    if (
      (sourceTable === 'time_blocks' && targetTable === 'projects') ||
      (sourceTable === 'invoice_items' && targetTable === 'invoices') ||
      (sourceTable === 'time_blocks' && targetTable === 'users')
    ) {
      return RELATIONSHIP_TYPES.WORKFLOW;
    }
    
    // All other relationships are references
    return RELATIONSHIP_TYPES.REFERENCE;
  }

  function generateFlowElements() {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Create nodes using predefined positions
    schemas.forEach((schema) => {
      const position = TABLE_POSITIONS[schema.table_name as keyof typeof TABLE_POSITIONS];
      
      nodes.push({
        id: schema.table_name,
        position: position || { 
          x: (nodes.length % 3) * LAYOUT_CONFIG.SPACING_X + 100,
          y: Math.floor(nodes.length / 3) * LAYOUT_CONFIG.SPACING_Y + 100
        },
        data: {
          label: (
            <div className="p-3 min-w-[220px] dark:text-gray-100">
              <div className="font-bold border-b pb-2 mb-2 text-blue-600 dark:text-blue-400 border-gray-200 dark:border-gray-700">
                {schema.table_name.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>
              <div className="text-xs space-y-1.5 dark:text-gray-300">
                {schema.columns.map(col => (
                  <div 
                    key={col.column_name} 
                    className={`py-0.5 flex justify-between items-center ${
                      col.column_name.endsWith('_id') 
                        ? 'text-blue-600 dark:text-blue-400 font-medium' 
                        : ''
                    }`}
                  >
                    <span>{col.column_name}</span>
                    {col.is_nullable === 'NO' && (
                      <span className="text-red-500 dark:text-red-400 ml-1 text-lg leading-none" title="Required">
                        *
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        },
        style: {
          background: 'var(--bg-color, #fff)',
          border: '1px solid var(--border-color, #e5e7eb)',
          borderRadius: '12px',
          boxShadow: isDark 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.24)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          padding: '0',
          width: LAYOUT_CONFIG.NODE_WIDTH,
        }
      });
    });

    // Create edges with improved routing
    schemas.forEach(schema => {
      schema.columns.forEach(column => {
        if (column.column_name.endsWith('_id') && column.column_name !== 'id') {
          const baseTableName = column.column_name.replace('_id', '');
          
          const possibleTargets = [
            baseTableName,
            baseTableName + 's',
            baseTableName.replace(/y$/, 'ies'),
          ];

          const targetTable = schemas.find(s => 
            possibleTargets.includes(s.table_name)
          )?.table_name;

          if (targetTable) {
            const relationshipType = getRelationshipType(schema.table_name, targetTable, column.column_name);
            const color = isDark ? relationshipType.darkColor : relationshipType.color;
            
            edges.push({
              id: `${schema.table_name}-${targetTable}`,
              source: schema.table_name,
              target: targetTable,
              label: column.column_name,
              type: 'smoothstep',  // Use smoothstep for better curved lines
              labelStyle: { 
                fill: color,
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '0.02em',
              },
              labelBgStyle: { 
                fill: 'var(--bg-color, #fff)',
                fillOpacity: isDark ? 0.9 : 0.8,
                stroke: color,
                strokeWidth: 1,
                rx: 4,
              },
              style: {
                stroke: color,
                strokeWidth: relationshipType.thickness,
              },
              animated: relationshipType === RELATIONSHIP_TYPES.WORKFLOW,
            });
          }
        }
      });
    });

    return { nodes, edges };
  }

  // Add CSS variables for theme colors
  const containerStyle = {
    '--bg-color': 'var(--tw-bg-opacity, 1) ? rgb(17 24 39 / var(--tw-bg-opacity)) : rgb(255 255 255)',
    '--border-color': 'var(--tw-border-opacity, 1) ? rgb(55 65 81 / var(--tw-border-opacity)) : rgb(229 231 235)',
    '--grid-color': 'var(--tw-bg-opacity, 1) ? rgb(31 41 55 / var(--tw-bg-opacity)) : rgb(241 241 241)',
  } as React.CSSProperties;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReactFlowStyles />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Database Structure</h2>
        <div className="flex items-center gap-8">
          {view === 'relationships' && (
            <>
              <div className="flex gap-6 items-center text-sm dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
                {Object.entries(RELATIONSHIP_TYPES).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full dark:bg-opacity-90 shadow-sm" 
                      style={{ 
                        backgroundColor: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches 
                          ? value.darkColor 
                          : value.color,
                        width: value.thickness * 4,
                        height: value.thickness * 4,
                      }} 
                    />
                    <span>{value.description}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm dark:text-gray-200 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <Info size={16} className="text-blue-500" />
                <span>Hover over tables for details</span>
              </div>
            </>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => setView('tables')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                view === 'tables'
                  ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-md'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setView('relationships')}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                view === 'relationships'
                  ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-md'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Relationship Map
            </button>
          </div>
        </div>
      </div>

      {view === 'tables' ? (
        <div className="space-y-8">
          {schemas.map((schema) => (
            <div key={schema.table_name} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                {schema.table_name.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="px-4 py-2 text-left dark:text-gray-200">Field Name</th>
                      <th className="px-4 py-2 text-left dark:text-gray-200">Type</th>
                      <th className="px-4 py-2 text-left dark:text-gray-200">Required</th>
                      <th className="px-4 py-2 text-left dark:text-gray-200">Default Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.columns.map((column) => (
                      <tr key={column.column_name} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2 font-medium dark:text-gray-200">
                          {column.column_name.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </td>
                        <td className="px-4 py-2 dark:text-gray-300">{formatDataType(column.data_type)}</td>
                        <td className="px-4 py-2">
                          {column.is_nullable === 'NO' ? (
                            <span className="text-red-600 dark:text-red-400">Yes</span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {formatColumnDefault(column.column_default)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-6">
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 flex-1" 
            style={{ height: '800px', ...containerStyle }}
          >
            <ReactFlowWrapper {...generateFlowElements()} />
          </div>
          <div className="w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 space-y-6 h-[800px] overflow-y-auto">
            <div>
              <h3 className="font-semibold text-lg mb-3 dark:text-white">How to Read This Diagram</h3>
              <div className="space-y-3 text-sm dark:text-gray-300">
                <p>• Tables are shown as boxes with their fields</p>
                <p>• <span className="text-red-500">*</span> indicates required fields</p>
                <p>• <span className="text-blue-500">Blue fields</span> show relationships</p>
                <p>• Line thickness indicates relationship importance</p>
                <p>• Arrows point from child to parent tables</p>
                <p>• Animated lines show workflow connections</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 dark:text-white">Schema Overview</h3>
              <div className="space-y-4">
                {Object.entries(SCHEMA_DESCRIPTIONS).map(([table, info]) => (
                  <div 
                    key={table} 
                    className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 text-sm space-y-1"
                    onMouseEnter={() => {
                      // Highlight the corresponding node (you could add this feature later)
                    }}
                  >
                    <h4 className="font-medium dark:text-white">
                      {table.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">{info.description}</p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs">{info.relationships}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 