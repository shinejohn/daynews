// Simplified database types to avoid deep instantiation issues
export type Database = {
  public: {
    Tables: {
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          slug: string;
          category: string;
          city?: string;
          author_id?: string;
          created_at: string;
          updated_at: string;
          published_at?: string;
          featured_image?: string;
          excerpt?: string;
          tags?: string[];
          view_count?: number;
          is_published?: boolean;
        };
        Insert: Partial<Database['public']['Tables']['news']['Row']>;
        Update: Partial<Database['public']['Tables']['news']['Row']>;
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description?: string;
          category?: string;
          address?: string;
          city?: string;
          phone?: string;
          email?: string;
          website?: string;
          hours?: any;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['businesses']['Row']>;
        Update: Partial<Database['public']['Tables']['businesses']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          role?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      events: {
        Row: {
          id: string;
          title: string;
          description?: string;
          start_date: string;
          end_date?: string;
          location?: string;
          category?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['events']['Row']>;
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          type?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['announcements']['Row']>;
        Update: Partial<Database['public']['Tables']['announcements']['Row']>;
      };
      marketplace_items: {
        Row: {
          id: string;
          title: string;
          description?: string;
          price?: number;
          category?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['marketplace_items']['Row']>;
        Update: Partial<Database['public']['Tables']['marketplace_items']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
