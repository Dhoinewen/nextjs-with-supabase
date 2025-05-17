"use server";

import axios from "axios";

export type CatImage = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export const fetchCatsAction = async (): Promise<CatImage[]> => {
  try {
    const apiKey = process.env.CATS_API_KEY;

    if (!apiKey) {
      console.error("CATS_API_KEY environment variable is not set");
      return [];
    }

    const response = await axios.get(
      "https://api.thecatapi.com/v1/images/search?limit=10",
      {
          headers: {
              Authorization: apiKey
          }
      },
    );

    return response.data;
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
