# Magic Patterns to Next.js - Setup Guide

This guide will help you prepare your project for the Magic Patterns to Next.js conversion.

## 📋 Prerequisites

- Node.js 18+ installed
- Next.js project created (`npx create-next-app@latest`)
- Magic Patterns export from your project
- Supabase project (recommended) or other database

## 🗂️ Project Setup

### 1. Create Your Next.js Project Structure

```bash
npx create-next-app@latest your-project-name --typescript --tailwind --eslint --app
cd your-project-name
```

Your project should have this structure:
```
your-project/
├── src/
│   ├── app/              # Next.js App Router (will be populated by scripts)
│   ├── components/       # Target for converted components
│   ├── lib/             # Utilities and integrations
│   └── types/           # TypeScript types
├── public/              # Static assets
├── scripts/             # Copy conversion scripts here
└── package.json
```

### 2. Install Required Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query zustand  # For state management
npm install class-variance-authority clsx tailwind-merge  # For styling utilities
npm install lucide-react  # For icons (if using)
```

### 3. Set Up Database Integration

#### Option A: Supabase (Recommended)

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Create database types file**:
```bash
mkdir -p src/types
```

Create `src/types/database.types.ts`:
```typescript
// Simplified database types - customize for your project
export type Database = {
  public: {
    Tables: {
      // News/Content sites
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          slug: string;
          category: string;
          created_at: string;
          published_at?: string;
          featured_image?: string;
          excerpt?: string;
          is_published?: boolean;
        };
        Insert: Partial<Database['public']['Tables']['news']['Row']>;
        Update: Partial<Database['public']['Tables']['news']['Row']>;
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
        };
        Insert: Partial<Database['public']['Tables']['events']['Row']>;
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      };
      // Add more tables based on your project needs
      profiles: {
        Row: {
          id: string;
          email?: string;
          full_name?: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
```

3. **Create Supabase client**:
```bash
mkdir -p src/lib/supabase
```

Create `src/lib/supabase/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found. Using mock mode.')
}

// Create singleton instance
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  if (!supabaseUrl || !supabaseAnonKey) {
    // Mock client for development
    supabaseClient = {
      from: (table: string) => ({
        select: () => Promise.resolve({ data: [], error: null, count: null }),
        insert: () => Promise.resolve({ data: null, error: null, count: null }),
        update: () => Promise.resolve({ data: null, error: null, count: null }),
        delete: () => Promise.resolve({ data: null, error: null, count: null }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as any
  } else {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  
  return supabaseClient
}

export const supabase = getSupabaseClient()
export type { Database } from '@/types/database.types'
```

4. **Create environment variables**:
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Option B: Other Databases

For Prisma, MongoDB, or other databases, create appropriate client files in `src/lib/` and update the conversion config to match your data patterns.

### 4. Prepare Magic Patterns Export

1. **Export your Magic Patterns project** to a local directory

2. **Recommended directory structure**:
```bash
mkdir -p ../magic-patterns-export
# Extract your Magic Patterns export to this directory
```

Your structure should look like:
```
parent-directory/
├── your-next-project/        # Your Next.js project
│   ├── src/
│   ├── scripts/
│   └── package.json
└── magic-patterns-export/    # Magic Patterns source
    └── src/
        └── components/       # Magic Patterns components
```

3. **Alternative: Place Magic Patterns anywhere**
You can place your Magic Patterns export anywhere and specify the path:
```bash
export MAGIC_PATTERNS_DIR="/path/to/your/magic-patterns/src/components"
```

### 5. Copy Conversion Scripts

Copy the entire `scripts/` folder to your project:
```bash
# From the daynews project
cp -r /path/to/daynews/scripts/ ./scripts/
```

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### 6. Create Configuration File (Optional)

Create `conversion-config.js` in your project root:
```javascript
module.exports = {
  paths: {
    magicPatternsDir: '../magic-patterns-export/src/components',
    targetDir: './src/components',
    appDir: './src/app'
  },
  database: {
    type: 'supabase',
    dataPatterns: [
      // Customize based on your project type
      { keywords: ['product', 'item'], table: 'products' },
      { keywords: ['user', 'profile'], table: 'profiles' },
      { keywords: ['post', 'article'], table: 'posts' },
      { keywords: ['event'], table: 'events' }
    ]
  },
  rendering: {
    routeConfigs: {
      '/': { type: 'isr', revalidate: 60 },
      '/products/*': { type: 'isr', revalidate: 900 },
      '/dashboard': { type: 'csr' },
      '/admin': { type: 'csr' },
      '/about': { type: 'ssg' }
    }
  }
}
```

### 7. Create Route Mapping (Optional)

If you have a specific route structure, create `route-mapping.json`:
```json
{
  "routes": [
    {
      "path": "/",
      "nextPath": "/",
      "component": "HomePage",
      "file": "src/app/page.tsx"
    },
    {
      "path": "/products",
      "nextPath": "/products",
      "component": "ProductsPage", 
      "file": "src/app/products/page.tsx"
    }
  ]
}
```

*Note: If you don't provide this, the scripts will analyze your Magic Patterns components and create appropriate routes automatically.*

## 🚀 Ready to Convert

Once you've completed the setup:

1. **Validate your setup**:
```bash
node scripts/build-quality-validator.js
```

2. **Run the full conversion**:
```bash
bash scripts/full-conversion-suite.sh
```

3. **Or run individual steps**:
```bash
# Convert components
node scripts/smart-magic-patterns-converter.js

# Generate pages
node scripts/create-route-pages.js

# Validate quality
node scripts/build-quality-validator.js

# Test build
npm run build
```

## 🗃️ Database Table Examples

### E-commerce Project
```sql
-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal,
  category text,
  image_url text,
  created_at timestamp DEFAULT now()
);

-- Cart items
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  product_id uuid REFERENCES products(id),
  quantity integer DEFAULT 1,
  created_at timestamp DEFAULT now()
);
```

### News/Blog Project
```sql
-- News/Articles table
CREATE TABLE news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  slug text UNIQUE,
  category text,
  published_at timestamp,
  featured_image text,
  created_at timestamp DEFAULT now()
);

-- Events table
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_date timestamp,
  location text,
  created_at timestamp DEFAULT now()
);
```

## 🔧 Troubleshooting Setup

### Common Issues

1. **"Module not found" errors**:
   - Ensure all dependencies are installed
   - Check that database types file exists
   - Verify Supabase client is properly configured

2. **"Magic Patterns directory not found"**:
   - Check the path in your configuration
   - Use absolute paths if relative paths don't work
   - Set MAGIC_PATTERNS_DIR environment variable

3. **Build failures**:
   - Run quality validator first
   - Check that database types match your actual schema
   - Ensure all imported components exist

4. **Supabase connection issues**:
   - Verify environment variables are set
   - Check Supabase project URL and keys
   - Test connection with a simple query

### Getting Help

- Run `node scripts/build-quality-validator.js` to catch issues early
- Check the generated conversion logs for detailed error information
- Ensure your Magic Patterns export is complete and accessible

## 🎯 Next Steps

After successful setup and conversion:

1. **Test your converted app**: `npm run dev`
2. **Review converted components** for any manual adjustments needed
3. **Set up your database** with appropriate tables and data
4. **Configure deployment** (Vercel, Netlify, etc.)
5. **Add any custom business logic** specific to your project

---

*This setup ensures your Magic Patterns to Next.js conversion runs smoothly with proper database integration and optimal rendering strategies.*