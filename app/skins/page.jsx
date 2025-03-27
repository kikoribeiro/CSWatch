'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { AppSidebar } from '@/components/app-sidebar';

// Import UI components from your components folder
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function SkinsPage() {
  const [skins, setSkins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSkins() {
      try {
        setLoading(true);
        // Use your own API instead of Valorant API
        const response = await fetch('/api/rest/skins');
        if (!response.ok) {
          throw new Error('Failed to fetch skins');
        }
        const data = await response.json();

        // Debug the response to see what we're getting
        console.log('API response:', data);

        // Ensure we have an array, even if the API doesn't return the expected structure
        if (data && Array.isArray(data.data)) {
          setSkins(data.data);
        } else if (data && Array.isArray(data)) {
          setSkins(data);
        } else {
          setSkins([]);
          setError('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching skins:', err);
        setError(err.message);
        setSkins([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSkins();
  }, []);

  // Ensure filteredSkins is always an array even if skins is not
  const filteredSkins = Array.isArray(skins)
    ? skins.filter(
        (skin) => skin && skin.name && skin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar className="hidden md:flex" />
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-6">CS2 Skins</h1>

          <Separator className="my-4" />

          {/* Search Bar */}
          <div className="max-w-md w-full mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={`skeleton-${index}`}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error message */}
          {error && !loading && (
            <Card className="bg-destructive/10 border-destructive">
              <CardContent className="p-4">
                <p className="text-destructive font-medium">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* Skins grid */}
          {!loading && !error && filteredSkins.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSkins.map((skin, index) => (
                <Card
                  key={skin.id || `skin-${index}`}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 bg-accent">
                    {skin.image && (
                      <Image
                        src={skin.image}
                        alt={skin.name || 'Unnamed skin'}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-1 truncate">
                      {skin.name || 'Unnamed skin'}
                    </h3>

                    <div className="flex items-center justify-between mt-2">
                      {skin.rarity && (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: skin.rarity.color
                              ? `${skin.rarity.color}15`
                              : undefined,
                            color: skin.rarity.color || undefined,
                            borderColor: skin.rarity.color || undefined,
                          }}
                        >
                          {skin.rarity.name}
                        </Badge>
                      )}

                      {typeof skin.price === 'number' && (
                        <span className="text-sm text-muted-foreground">
                          ${skin.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredSkins.length === 0 && !loading && !error && (
            <div className="text-center py-10">
              <p className="text-muted-foreground text-lg">No skins found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
