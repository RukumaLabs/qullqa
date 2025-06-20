import { z } from 'zod';
import { storageInstance } from '../storage.js';

export const listDataSchema = z.object({});

export type ListDataInput = z.infer<typeof listDataSchema>;

export async function executeListData(_input: ListDataInput) {
  try {
    const items = await storageInstance.list();
    
    if (items.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No data stored yet. Use the store-data tool to add items.'
          }
        ]
      };
    }
    
    const itemsList = items.map(item => 
      `• ${item.name} (${item.contentType}, ${item.size} bytes, ${new Date(item.timestamp).toLocaleString()})`
    ).join('\n');
    
    return {
      content: [
        {
          type: 'text',
          text: `Stored items (${items.length} total):\n\n${itemsList}\n\nAccess the web interface at http://localhost:1337/`
        }
      ]
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Failed to list data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}