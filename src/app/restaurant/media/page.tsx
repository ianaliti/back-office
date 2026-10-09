'use client'

import { useEffect, useState } from 'react'
import { getRestaurants, getDishes, createDish, deleteDish } from '@/lib/api'
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
        const user = (await import('@/lib/auth')).getUser()
        const { restaurants } = await getRestaurants()
        const mine = restaurants.find((r) => r.ownerId === user?.id) ?? restaurants[0] ?? null
        if (mine) {
          setRestaurantId(mine.id)
          const dishes = await getDishes(mine.id)
          setPhotos(dishes.filter((d) => d.category === 'Photo Media' && d.imageUrl))
          setVideos(dishes.filter((d) => d.category === 'Video Media'))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
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
        name: `Photo - ${new Date().toLocaleDateString('fr-FR')}`,
        price: 0,
        category: 'Photo Media',
        available: true,
        imageUrl: photoUrl.trim(),
      })
      setPhotos((prev) => [...prev, dish])
      setPhotoUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la photo")
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
        name: `Vidéo - ${new Date().toLocaleDateString('fr-FR')}`,
        price: 0,
        category: 'Video Media',
        available: true,
        imageUrl: videoUrl.trim(),
      })
      setVideos((prev) => [...prev, dish])
      setVideoUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la vidéo")
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
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
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
      // URL invalide
    }
    return url
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4E6939' }} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl p-3 text-sm" style={{ background: '#FEF2F2', color: '#B91C1C' }}>
          {error}
        </div>
      )}

      {/* Photos section */}
      <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {/* Section header */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'rgba(200,232,106,0.2)' }}
          >
            <ImageIcon className="h-4 w-4" style={{ color: '#4E6939' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>Photos</h2>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              Ajoutez des URLs de photos pour mettre en valeur votre restaurant
            </p>
          </div>
        </div>

        {/* Add photo input */}
        <div className="flex gap-2 mb-5">
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://exemple.com/photo.jpg"
            className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none transition"
            style={{
              border: '1px solid #E5E0D8',
              background: '#FAFAF9',
              color: '#111827',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4E6939')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E0D8')}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPhoto() } }}
          />
          <button
            onClick={handleAddPhoto}
            disabled={addingPhoto || !photoUrl.trim()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
          >
            {addingPhoto
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Plus className="h-4 w-4" />
            }
            Ajouter
          </button>
        </div>

        {/* Photo grid */}
        {photos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden"
                style={{ border: '1px solid #E5E0D8' }}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.name}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <button
                    onClick={() => setDeleteTarget({ id: photo.id, name: photo.name })}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium"
                    style={{ background: '#FEF2F2', color: '#EF4444' }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
                <div className="px-3 py-2" style={{ background: '#FAFAF9', borderTop: '1px solid #E5E0D8' }}>
                  <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{photo.imageUrl}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>
            Aucune photo ajoutée pour l'instant.
          </p>
        )}
      </div>

      {/* Videos section */}
      <div className="rounded-xl bg-white p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {/* Section header */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'rgba(200,232,106,0.2)' }}
          >
            <Film className="h-4 w-4" style={{ color: '#4E6939' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>Vidéos</h2>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              Ajoutez des URLs YouTube ou vidéo pour votre restaurant
            </p>
          </div>
        </div>

        {/* Add video input */}
        <div className="flex gap-2 mb-5">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none transition"
            style={{
              border: '1px solid #E5E0D8',
              background: '#FAFAF9',
              color: '#111827',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#4E6939')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E0D8')}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddVideo() } }}
          />
          <button
            onClick={handleAddVideo}
            disabled={addingVideo || !videoUrl.trim()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
            style={{ background: '#2D3B1F', color: '#C8E86A' }}
          >
            {addingVideo
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Plus className="h-4 w-4" />
            }
            Ajouter
          </button>
        </div>

        {/* Video grid */}
        {videos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {videos.map((video) => (
              <div key={video.id} className="space-y-2">
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{ border: '1px solid #E5E0D8' }}
                >
                  <iframe
                    src={getYouTubeEmbedUrl(video.imageUrl ?? '') ?? ''}
                    title={video.name}
                    className="w-full aspect-video"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs truncate flex-1" style={{ color: '#9CA3AF' }}>
                    {video.imageUrl}
                  </p>
                  <button
                    onClick={() => setDeleteTarget({ id: video.id, name: video.name })}
                    className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition"
                    style={{ background: '#FEF2F2' }}
                    aria-label="Supprimer la vidéo"
                  >
                    <Trash2 className="h-3.5 w-3.5" style={{ color: '#EF4444' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-sm" style={{ color: '#9CA3AF' }}>
            Aucune vidéo ajoutée pour l'instant.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le média"
        description={`Supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        loading={deleteLoading}
      />
    </div>
  )
}
