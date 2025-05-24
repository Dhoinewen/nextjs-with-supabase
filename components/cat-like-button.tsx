'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { toggleCatLikeAction } from '@/app/actions/cat-action';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { paths } from '@/utils/paths';

interface CatLikeButtonProps {
  catApiId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  showSignInRequired?: boolean;
}

export default function CatLikeButton({
  catApiId,
  initialLikeCount,
  initialIsLiked,
  showSignInRequired = true
}: CatLikeButtonProps) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const likeMutation = useMutation({
    mutationFn: () => toggleCatLikeAction(catApiId),
    onMutate: async () => {
      // Optimistic update
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;

      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);

      return { previousIsLiked: isLiked, previousLikeCount: likeCount };
    },
    onError: (error, variables, context) => {
      // Revert optimistic update on error
      if (context) {
        setIsLiked(context.previousIsLiked);
        setLikeCount(context.previousLikeCount);
      }
      console.error('Error toggling like:', error);
    },
    onSuccess: (data) => {
      // Update with server response
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
        // Invalidate cats queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['cats'] });
        queryClient.invalidateQueries({ queryKey: ['popular-cats'] });
      }
    },
  });

  const handleLikeClick = () => {
    if (!user) {
      if (showSignInRequired) {
        router.push(paths.signIn);
      }
      return;
    }

    likeMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" disabled>
          <Heart className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-500">-</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLikeClick}
        disabled={likeMutation.isPending}
        className={`transition-colors ${
          isLiked
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-400 hover:text-red-500'
        }`}
      >
        <Heart
          className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
        />
      </Button>
      <span className="text-sm text-gray-500">
        {likeCount}
      </span>
      {!user && showSignInRequired && (
        <span className="text-xs text-gray-400 ml-1">
          (Sign in to like)
        </span>
      )}
    </div>
  );
}
