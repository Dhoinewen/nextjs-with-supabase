"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CatImage, fetchCatsAction } from "@/app/actions/cat-action";
import { useQuery } from "@tanstack/react-query";

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
        <p className="text-sm text-gray-500">ID: {cat.id}</p>
        <p className="text-sm text-gray-500">
          Size: {cat.width} x {cat.height}
        </p>
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
  const {
    data: cats,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["cats"],
    queryFn: fetchCatsAction,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cat Images</h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <p className="text-lg text-center mb-4">Loading cat images...</p>
        </div>
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
          {cats?.map((cat) => <CatCard key={cat.id} cat={cat} />)}
        </div>
      )}
    </div>
  );
};

export default CatsPage;
