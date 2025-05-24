"use server";

import axios from "axios";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/database.types";

export type CatImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds: any[];
  // Database fields (when fetched from DB)
  dbId?: number;
  likeCount?: number;
  isLikedByUser?: boolean;
};

type CatInsert = Database['public']['Tables']['cats']['Insert'];
type CatLikeInsert = Database['public']['Tables']['cat_likes']['Insert'];

/**
 * Saves cat data to Supabase database
 * This function runs in the background and doesn't block the main response
 */
async function saveCatsToDatabase(cats: CatImage[]): Promise<void> {
  try {
    const supabase = await createClient();

    // Prepare data for insertion
    const catsToInsert: CatInsert[] = cats.map(cat => ({
      api_id: cat.id,
      image_url: cat.url,
      width: cat.width,
      height: cat.height,
    }));

    // Check for existing cats to avoid duplicates
    const existingCatsResponse = await supabase
      .from('cats')
      .select('api_id')
      .in('api_id', cats.map(cat => cat.id));

    console.log("===> EXISTING CATS ", existingCatsResponse)

    if (existingCatsResponse.error) {
      console.error('Error checking existing cats:', existingCatsResponse.error);
      return;
    }

    const existingApiIds = new Set(existingCatsResponse.data?.map(cat => cat.api_id) || []);
    const newCats = catsToInsert.filter(cat => !existingApiIds.has(cat.api_id));

    if (newCats.length === 0) {
      console.log('All cats already exist in database, skipping insertion');
      return;
    }

    // Insert new cats with upsert to handle any race conditions
    const { error } = await supabase
      .from('cats')
      .upsert(newCats, {
        onConflict: 'api_id',
        ignoreDuplicates: true
      });

    if (error) {
      console.error('Error saving cats to database:', error);
      // For RLS errors, we'll just log and continue - the cats will still be displayed from the API
      if (error.code === '42501') {
        console.log('RLS policy prevents cat insertion - cats will be displayed from API only');
      }
    } else {
      console.log(`Successfully saved ${newCats.length} new cats to database`);
    }
  } catch (error) {
    console.error('Unexpected error saving cats to database:', error);
  }
}

export const fetchCatsAction = async (type: 'gif' | 'jpg,png' | 'jpg,png,gif'): Promise<CatImage[]> => {
  try {
    const apiKey: string = process.env.CATS_API_KEY || "";

    if (!apiKey) {
      console.error("CATS_API_KEY environment variable is not set");
      return [];
    }

    const response = await axios.get(
      "https://api.thecatapi.com/v1/images/search",
      {
        headers: {
          "x-api-key": apiKey,
        },
        params: {
          limit: 10,
          mime_types: type,
        },
      },
    );

    console.log("===> RESPONSE", response.data);

    const cats: CatImage[] = response.data;

    // Save cats to database in the background (non-blocking)
    // This won't affect the response time or block the user experience
    if (cats.length > 0) {
      // Use setImmediate or setTimeout to ensure this runs after the response is sent
      setImmediate(() => {
        saveCatsToDatabase(cats).catch(error => {
          console.error('Background database save failed:', error);
        });
      });
    }

    return cats;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error fetching cats:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });
    } else {
      console.error("Error fetching cats:", error);
    }
    return [];
  }
};

/**
 * Toggle like/unlike for a cat
 */
export const toggleCatLikeAction = async (catApiId: string): Promise<{ success: boolean; isLiked: boolean; likeCount: number }> => {
  try {
    console.log("===> LIKE CAT START", catApiId)
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, isLiked: false, likeCount: 0 };
    }

    // First, ensure the cat exists in our database
    let { data: cat, error: catError } = await supabase
      .from('cats')
      .select('id')
      .eq('api_id', catApiId)
      .single();

    console.log("===> LIKE CAT DATA", cat)

    if (catError || !cat) {
      return { success: false, isLiked: false, likeCount: 0 };
    }

    // Check if user already liked this cat
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('cat_likes')
      .select('id')
      .eq('cat_id', cat.id)
      .eq('user_id', user.id)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if no like exists
      console.error('Error checking existing like:', likeCheckError);
      return { success: false, isLiked: false, likeCount: 0 };
    }

    let isLiked: boolean;

    if (existingLike) {
      // Unlike: remove the like
      const { error: deleteError } = await supabase
        .from('cat_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return { success: false, isLiked: true, likeCount: 0 };
      }
      isLiked = false;
    } else {
      // Like: add the like
      const likeData: CatLikeInsert = {
        cat_id: cat.id,
        user_id: user.id,
      };

      console.log("===> BEFORE INSERT CAT LIKE")

      const { error: insertError } = await supabase
        .from('cat_likes')
        .insert(likeData);

      if (insertError) {
        console.error('Error adding like:', insertError);
        return { success: false, isLiked: false, likeCount: 0 };
      }
      isLiked = true;
    }

    // Get updated like count
    const { data: likeCountData, error: countError } = await supabase
      .from('cat_likes')
      .select('id', { count: 'exact' })
      .eq('cat_id', cat.id);

    if (countError) {
      console.error('Error getting like count:', countError);
      return { success: false, isLiked, likeCount: 0 };
    }

    const likeCount = likeCountData?.length || 0;

    console.log("===> LIKE COUNT", likeCount)

    return { success: true, isLiked, likeCount };
  } catch (error) {
    console.error('Unexpected error in toggleCatLikeAction:', error);
    return { success: false, isLiked: false, likeCount: 0 };
  }
};

/**
 * Get cats with like data from database
 */
export const getCatsWithLikesAction = async (catApiIds: string[]): Promise<CatImage[]> => {
  try {
    const supabase = await createClient();

    // Get current user (might be null if not authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Get cats from database
    const { data: catsData, error: catsError } = await supabase
      .from('cats')
      .select('id, api_id, image_url, width, height')
      .in('api_id', catApiIds);

    if (catsError) {
      console.error('Error fetching cats with likes:', catsError);
      return [];
    }

    if (!catsData || catsData.length === 0) {
      return [];
    }

    const catIds = catsData.map(cat => cat.id);

    // Get like counts for all cats
    const { data: likeCounts, error: likeCountError } = await supabase
      .from('cat_likes')
      .select('cat_id')
      .in('cat_id', catIds);

    if (likeCountError) {
      console.error('Error fetching like counts:', likeCountError);
    }

    // Count likes per cat
    const likeCountMap = new Map<number, number>();
    if (likeCounts) {
      likeCounts.forEach(like => {
        const count = likeCountMap.get(like.cat_id) || 0;
        likeCountMap.set(like.cat_id, count + 1);
      });
    }

    // If user is authenticated, get their likes
    let userLikes: string[] = [];
    if (user) {
      const { data: userLikesData, error: userLikesError } = await supabase
        .from('cat_likes')
        .select('cat_id')
        .eq('user_id', user.id)
        .in('cat_id', catIds);

      if (!userLikesError && userLikesData) {
        userLikes = userLikesData.map(like => like.cat_id.toString());
      }
    }

    // Transform data to CatImage format
    const catsWithLikes: CatImage[] = catsData.map(cat => ({
      id: cat.api_id,
      url: cat.image_url,
      width: cat.width,
      height: cat.height,
      breeds: [],
      dbId: cat.id,
      likeCount: likeCountMap.get(cat.id) || 0,
      isLikedByUser: userLikes.includes(cat.id.toString()),
    }));

    return catsWithLikes;
  } catch (error) {
    console.error('Unexpected error in getCatsWithLikesAction:', error);
    return [];
  }
};
