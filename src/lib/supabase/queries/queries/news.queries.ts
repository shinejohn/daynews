import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type New = Database['public']['Tables']['news']['Row'];

// Server queries
export async function getNews() {
  const supabase = await createServerClient();

  const query = (supabase as any).from('news').select('*');

  // Add specific logic per table





  return query;
}

export async function getNewsByCategory(categoryName: string) {
  const supabase = await createServerClient();

  try {
    // Fetch categories that match the name
    const { data: categories, error: catError } = await (supabase as any).from('categories').
    select('id').
    ilike('name', `%${categoryName}%`);
    if (catError || !categories || categories.length === 0) {
      return { articles: [], featured: [] };
    }

    // Fetch news articles
    const { data: articles, error } = await (supabase as any).from('news').
    select(`
        *,
        author:virtual_journalists(*),
        community:communities(*),
        category:categories(*)
      `).
    in('category_id', categories.map((cat) => cat.id)).
    eq('status', 'published').
    order('published_at', { ascending: false }).
    limit(20);
    if (error || !articles) {
      return { articles: [], featured: [] };
    }

    const featuredArticles = articles.filter((article) => article.is_featured);

    return {
      articles: articles || [],
      featured: featuredArticles || []
    };
  } catch (error) {
    console.error('Error fetching news by category:', error);
    return { articles: [], featured: [] };
  }
}

// Client queries
export const newsQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('news').
    select('*').
    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('news').
    select('*').
    eq('id', id).
    single();
    if (error) throw error;
    return data;
  },

  byCommunity: async (communityId: string) => {
    const { data, error } = await (supabase as any).from('news').
    select('*').
    eq('community_id', communityId).
    order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  featured: async () => {
    const { data, error } = await (supabase as any).from('news').
    select('*').
    eq('is_featured', true).
    order('created_at', { ascending: false }).
    limit(5);
    if (error) throw error;
    return data;
  },

  byCategory: async (categoryName: string) => {
    const { data: categories, error: catError } = await (supabase as any).from('categories').
    select('id').
    ilike('name', `%${categoryName}%`);
    if (catError || !categories || categories.length === 0) {
      return [];
    }

    const { data, error } = await (supabase as any).from('news').
    select(`
        *,
        author:virtual_journalists(*),
        community:communities(*),
        category:categories(*)
      `).
    in('category_id', categories.map((cat) => cat.id)).
    eq('status', 'published').
    order('published_at', { ascending: false }).
    limit(20);
    if (error) return [];
    return data || [];
  },

  create: async (newsData: Database['public']['Tables']['news']['Insert']) => {
    const { data, error } = await (supabase as any).from('news').
    insert(newsData).
    select().
    single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, newsData: Database['public']['Tables']['news']['Update']) => {
    const { data, error } = await (supabase as any).from('news').
    update(newsData).
    eq('id', id).
    select().
    single();
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { data, error } = await (supabase as any).from('news').
    delete().
    eq('id', id).
    select().
    single();
    if (error) throw error;
    return data;
  }
};