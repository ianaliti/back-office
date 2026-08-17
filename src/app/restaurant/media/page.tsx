'use client'

import { useEffect, useState } from 'react'
import { getRestaurants, getDishes, createDish, deleteDish } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Plus, Trash2, Loader2, Image as ImageIcon, Film } from 'lucide-react'
import type { Dish } from '@/types'

export default function MediaPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [photos, setPhotos] = useState<Dish[]>([])
  const [videos, setVideos] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [addingPhoto, setAddingPhoto] = useState(false)
  const [addingVideo, setAddingVideo] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const restaurants = await getRestaurants()
        if (restaurants.length > 0) {
          const rid = restaurants[0].id
          setRestaurantId(rid)
          const dishes = await getDishes(rid)
          setPhotos(dishes.filter((d) => d.category === 'Photo Media' && d.imageUrl))
          setVideos(dishes.filter((d) => d.category === 'Video Media'))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleAddPhoto() {
    if (!restaurantId || !photoUrl.trim()) return
    setAddingPhoto(true)
    setError('')
    try {
      const dish = await createDish(restaurantId, {
        name: `Photo - ${new Date().toLocaleDateString()}`,
        price: 0,
        category: 'Photo Media',
        available: true,
        imageUrl: photoUrl.trim(),
      })
      setPhotos((prev) => [...prev, dish])
      setPhotoUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add photo')
    } finally {
      setAddingPhoto(false)
    }
  }

  async function handleAddVideo() {
    if (!restaurantId || !videoUrl.trim()) return
    setAddingVideo(true)
    setError('')
    try {
      const dish = await createDish(restaurantId, {
        name: `Video - ${new Date().toLocaleDateString()}`,
        price: 0,
        category: 'Video Media',
        available: true,
        imageUrl: videoUrl.trim(),
      })
      setVideos((prev) => [...prev, dish])
      setVideoUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video')
    } finally {
      setAddingVideo(false)
    }
  }

  async function handleDelete() {
    if (!restaurantId || !deleteTarget) return
    setDeleteLoading(true)
    try {
      await deleteDish(restaurantId, deleteTarget.id)
      setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  function getYouTubeEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtube.com')) {
        const videoId = u.searchParams.get('v')
        if (videoId) return `https://www.youtube.com/embed/${videoId}`
      }
      if (u.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed${u.pathname}`
      }
    } catch {
      // not a valid URL
    }
    return url
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#685ED7]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#685ED7]" />
            Photos
          </CardTitle>
          <CardDescription>Add photo URLs to showcase your restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1"
            />
            <Button onClick={handleAddPhoto} loading={addingPhoto} disabled={!photoUrl.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {photos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photo.imageUrl}
                    alt={photo.name}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" fill="%239ca3af" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget({ id: photo.id, name: photo.name })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-500 truncate">{photo.imageUrl}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-8">No photos added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Videos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#685ED7]" />
            Videos
          </CardTitle>
          <CardDescription>Add YouTube or video URLs for your restaurant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1"
            />
            <Button onClick={handleAddVideo} loading={addingVideo} disabled={!videoUrl.trim()}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          {videos.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <div key={video.id} className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <iframe
                      src={getYouTubeEmbedUrl(video.imageUrl ?? '') ?? ''}
                      title={video.name}
                      className="w-full aspect-video"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate flex-1">{video.imageUrl}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget({ id: video.id, name: video.name })}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-8">No videos added yet</p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove Media"
        description={`Remove "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Remove"
        loading={deleteLoading}
      />
    </div>
  )
}
