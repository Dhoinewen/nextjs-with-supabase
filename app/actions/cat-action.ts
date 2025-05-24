"use server";

import axios from "axios";
import { createClient } from "@/utils/supabase/server";
import { Database } from "@/database.types";

export type CatImage = {
  id: string;
  url: string;
  width: number;
  height: number;
  breeds: any[]
};

type CatInsert = Database['public']['Tables']['cats']['Insert'];

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

    // Insert new cats
    const { error } = await supabase
      .from('cats')
      .insert(newCats);

    if (error) {
      console.error('Error saving cats to database:', error);
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
