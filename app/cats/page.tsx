import { fetchCatsAction, CatImage } from "@/app/actions";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Cat Images | Next.js with Supabase",
  description: "A page displaying random cat images from The Cat API",
};

export default async function CatsPage() {
  const cats = await fetchCatsAction();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cat Images</h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      {cats.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-md">
          <p className="text-lg text-center mb-4">
            No cat images found. There might be an issue with the API or the API key.
          </p>
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cats.map((cat) => (
            <CatCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatCard({ cat }: { cat: CatImage }) {
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      <div className="relative h-64 w-full">
        <Image
          src={cat.url}
          alt={`Cat ${cat.id}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
}
