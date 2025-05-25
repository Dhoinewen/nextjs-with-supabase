"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CatImage,
  fetchCatsAction,
  getCatsWithLikesAction,
  getPopularCatsAction,
} from "@/app/actions/cat-action";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/loaders/loader";
import CatLikeButton from "@/components/cat-like-button";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CatCardProps = {
  cat: CatImage;
};
const CatCard = ({ cat }: CatCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      <div className="relative h-64 w-56">
        <Image
          src={cat.url}
          alt={`Cat ${cat.id}`}
          fill
          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm text-gray-500">ID: {cat.id}</p>
            <p className="text-sm text-gray-500">
              Size: {cat.width} x {cat.height}
            </p>
          </div>
          <CatLikeButton
            catApiId={cat.id}
            initialLikeCount={cat.likeCount || 0}
            initialIsLiked={cat.isLikedByUser || false}
          />
        </div>
        <a
          href={cat.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm mt-2 inline-block"
        >
          View original image
        </a>
      </div>
    </div>
  );
};

const CatsPage = () => {
  const [catsWithLikes, setCatsWithLikes] = useState<CatImage[]>([]);

  const {
    data: cats,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["cats"],
    queryFn: () => fetchCatsAction("gif"),
  });

  const {
    data: popularCats,
    isLoading: isLoadingPopular,
    refetch: refetchPopular,
  } = useQuery({
    queryKey: ["popular-cats"],
    queryFn: () => getPopularCatsAction(6),
  });

  // Fetch like data for cats when cats data changes
  useEffect(() => {
    if (cats && cats.length > 0) {
      const fetchLikeData = async () => {
        const catApiIds = cats.map((cat) => cat.id);
        const catsWithLikeData = await getCatsWithLikesAction(catApiIds);

        // Merge API data with like data
        const mergedCats = cats.map((cat) => {
          const catWithLikes = catsWithLikeData.find((c) => c.id === cat.id);
          return {
            ...cat,
            dbId: catWithLikes?.dbId,
            likeCount: catWithLikes?.likeCount || 0,
            isLikedByUser: catWithLikes?.isLikedByUser || false,
          };
        });

        setCatsWithLikes(mergedCats);
      };

      fetchLikeData();
    } else {
      setCatsWithLikes([]);
    }
  }, [cats]);

  console.log("===> CATS", cats);
  console.log("===> CATS WITH LIKES", catsWithLikes);

  return (
    <div className="flex flex-col gap-8">
      <Tabs defaultValue="all">
        <TabsList className={"w-full"}>
          <TabsTrigger value="all" className={'w-1/2'}>All</TabsTrigger>
          <TabsTrigger value="popular" className={'w-1/2'}>Popular</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Cats</h1>
            </div>

            {isLoading ? (
                <Loader />
            ) : cats?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-md">
                  <p className="text-lg text-center mb-4">
                    No cat images found. There might be an issue with the API or the API
                    key.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => refetch()}>Try Again</Button>
                    <Link href="/">
                      <Button variant="outline">Go back home</Button>
                    </Link>
                  </div>
                </div>
            ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catsWithLikes?.map((cat) => <CatCard key={cat.id} cat={cat} />)}
                </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="popular" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Popular</h2>
              <Button
                onClick={() => refetchPopular()}
                variant="outline"
                size="sm"
              >
                Refresh Popular
              </Button>
            </div>

            {isLoadingPopular ? (
              <Loader />
            ) : popularCats && popularCats.length > 0 ? (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCats.map((cat) => (
                  <CatCard key={cat.id} cat={cat} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-gray-50">
                <p className="text-lg text-center mb-2">No popular cats yet!</p>
                <p className="text-sm text-gray-600 text-center">
                  Start liking some cats to see them appear here.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CatsPage;
