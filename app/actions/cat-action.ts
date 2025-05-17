'use server'

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

        const response = await fetch(
            "https://api.thecatapi.com/v1/images/search?limit=10",
            {
                headers: {
                    "x-api-key": apiKey,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch cats: ${response.status} ${response.statusText}`);
        }

        const data: CatImage[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching cats:", error);
        return [];
    }
};