'use client';

import { useUser } from '@/context/UserContext';
import { Button } from './ui/button';

export default function UserProfile() {
  const { user, isLoading, refreshUser } = useUser();

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>Please sign in to view your profile</div>;
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
      </div>
      <Button 
        onClick={() => refreshUser()} 
        className="mt-4"
        variant="outline"
      >
        Refresh User Data
      </Button>
    </div>
  );
}
