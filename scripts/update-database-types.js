const fs = require('fs');
const path = require('path');

// Additional tables that need to be added to database.types.ts
const additionalTables = `
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category_type?: string;
          display_order?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['categories']['Row']>;
        Update: Partial<Database['public']['Tables']['categories']['Row']>;
      };
      communities: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          location?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['communities']['Row']>;
        Update: Partial<Database['public']['Tables']['communities']['Row']>;
      };
      deals: {
        Row: {
          id: string;
          title: string;
          description?: string;
          business_id?: string;
          discount_percentage?: number;
          start_date?: string;
          end_date?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['deals']['Row']>;
        Update: Partial<Database['public']['Tables']['deals']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          content?: string;
          is_read?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notifications']['Row']>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          business_id: string;
          user_id: string;
          rating: number;
          content?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['reviews']['Row']>;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']>;
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      virtual_journalists: {
        Row: {
          id: string;
          name: string;
          bio?: string;
          avatar_url?: string;
          specialty?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['virtual_journalists']['Row']>;
        Update: Partial<Database['public']['Tables']['virtual_journalists']['Row']>;
      };`;

function updateDatabaseTypes() {
  const typesPath = path.join(__dirname, '..', 'src', 'types', 'database.types.ts');
  let content = fs.readFileSync(typesPath, 'utf8');
  
  // Find the location to insert new tables (before the closing of Tables)
  const insertPoint = content.indexOf('    };\n    Views: Record<string, never>;');
  
  if (insertPoint === -1) {
    console.error('Could not find insertion point in database.types.ts');
    return;
  }
  
  // Insert the new tables
  const beforeInsert = content.substring(0, insertPoint - 6); // -6 to remove the last };
  const afterInsert = content.substring(insertPoint - 6);
  
  content = beforeInsert + ';\n' + additionalTables + afterInsert;
  
  fs.writeFileSync(typesPath, content);
  console.log('Updated database.types.ts with missing tables');
}

updateDatabaseTypes();