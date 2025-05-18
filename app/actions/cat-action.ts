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
          mime_types: "gif",
        },
      },
    );

    console.log("===> RESPONSE", response.data);

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
