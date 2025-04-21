'use client'

import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { generatePhotoStrip } from '@/utils/photoStripGenerator'
import PreviewModal from '@/components/PreviewModal'

interface ImageItem {
  id: string
  url: string
  filter: string
}

interface DragItem {
  id: string
  index: number
}

const ItemTypes = {
  IMAGE: 'image',
}

interface DraggableImageProps {
  image: ImageItem
  index: number
  moveImage: (dragIndex: number, hoverIndex: number) => void
  deleteImage: (id: string) => void
}

const getFilterStyle = (filter: string): string => {
  switch (filter) {
    case 'grayscale':
      return 'grayscale(100%)'
    case 'sepia':
      return 'sepia(100%)'
    case 'invert':
      return 'invert(100%)'
    default:
      return 'none'
  }
}

const DraggableImage: React.FC<DraggableImageProps> = ({ image, index, moveImage, deleteImage }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: { id: image.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop<DragItem>({
    accept: ItemTypes.IMAGE,
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      moveImage(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  drag(drop(ref))

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{
        position: 'relative',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '13rem',
        aspectRatio: '4/3',
        cursor: 'move',
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.img
        src={image.url}
        alt={`Captured ${image.id}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          filter: getFilterStyle(image.filter)
        }}
        layoutId={image.id}
      />
      <motion.button
        onClick={() => deleteImage(image.id)}
        initial={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: 'none',
          borderRadius: '50%',
          width: '2rem',
          height: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white'
        }}
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  )
}

const inputStyles = {
  base: {
    fontFamily: 'var(--font-poppins)',
    textAlign: 'center' as const,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    color: '#000',
    transition: 'border-color 0.2s ease',
  },
  title: {
    fontSize: '2rem',
    letterSpacing: '0.1em',
    borderBottom: '2px solid rgba(0, 0, 0, 0.1)',
    padding: '0.5rem',
    width: '300px',
    fontWeight: '600',
    '&:focus': {
      borderColor: 'rgba(0, 0, 0, 0.3)',
    },
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.3)',
    },
  },
  date: {
    fontSize: '1.25rem',
    letterSpacing: '0.2em',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '0.5rem',
    width: '200px',
    fontWeight: '400',
    '&:focus': {
      borderColor: 'rgba(0, 0, 0, 0.3)',
    },
    '&::placeholder': {
      color: 'rgba(0, 0, 0, 0.3)',
    },
  },
}

const CapturePage = () => {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImages, setCapturedImages] = useState<ImageItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('normal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [eventTitle, setEventTitle] = useState('YOUR EVENT')
  const [eventDate, setEventDate] = useState(new Date().toLocaleDateString('en-US', { 
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  }).replace(/\//g, '.'))

  const filters = [
    { name: 'normal', label: 'Normal' },
    { name: 'grayscale', label: 'Grayscale' },
    { name: 'sepia', label: 'Sepia' },
    { name: 'invert', label: 'Invert' },
  ]

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    const dragImage = capturedImages[dragIndex]
    setCapturedImages(prev => {
      const newImages = [...prev]
      newImages.splice(dragIndex, 1)
      newImages.splice(hoverIndex, 0, dragImage)
      return newImages
    })
  }

  const capture = () => {
    if (webcamRef.current && capturedImages.length < 3) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        setCapturedImages([...capturedImages, { 
          id: Date.now().toString(), 
          url: imageSrc,
          filter: selectedFilter 
        }])
      }
    }
  }

  const handleGenerate = async () => {
    if (capturedImages.length === 3) {
      setIsGenerating(true)
      try {
        const photoStripUrl = await generatePhotoStrip(
          capturedImages,
          {
            title: eventTitle,
            date: eventDate
          }
        )
        setPreviewUrl(photoStripUrl)
        setShowPreview(true)
      } catch (error) {
        console.error('Generation failed:', error)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = `photo-strip-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShowPreview(false)
  }

  const deleteImage = (idToDelete: string) => {
    setCapturedImages(prev => prev.filter(img => img.id !== idToDelete))
  }

  // Create placeholder array for empty slots
  const placeholders = Array(3 - capturedImages.length).fill(null)

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        gap: '1.5rem',
        backgroundColor: '#f5f5f5',
        fontFamily: 'var(--font-poppins)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value.toUpperCase())}
            placeholder="EVENT TITLE"
            style={{
              ...inputStyles.base,
              ...inputStyles.title,
            }}
          />
          <input
            type="text"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="MM.DD.YY"
            style={{
              ...inputStyles.base,
              ...inputStyles.date,
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '75rem',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '42rem',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            aspectRatio: '4/3'
          }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                aspectRatio: 4/3,
                facingMode: "user"
              }}
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '1rem',
                filter: getFilterStyle(selectedFilter)
              }}
            />
            {capturedImages.length === 3 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '1rem'
                }}>
                <p style={{ color: 'white', fontSize: '1.25rem' }}>Maximum images captured</p>
              </motion.div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            height: '100%'
          }}>
            <AnimatePresence mode="popLayout">
              {capturedImages.map((image, index) => (
                <DraggableImage
                  key={image.id}
                  image={image}
                  index={index}
                  moveImage={moveImage}
                  deleteImage={deleteImage}
                />
              ))}

              {placeholders.map((_, index) => (
                <motion.div
                  key={`placeholder-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  style={{
                    width: '13rem',
                    aspectRatio: '4/3',
                    borderRadius: '1rem',
                    border: '2px dashed #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}
                >
                  <span>Image {capturedImages.length + index + 1}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {filters.map((filter) => (
            <motion.button
              key={filter.name}
              onClick={() => setSelectedFilter(filter.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid #ccc',
                backgroundColor: selectedFilter === filter.name ? '#000' : 'transparent',
                color: selectedFilter === filter.name ? '#fff' : '#000',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          width: '100%',
          maxWidth: '20rem',
          justifyContent: 'center'
        }}>
          <motion.button
            onClick={capturedImages.length === 3 ? handleGenerate : capture}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
            style={{
              width: '100%',
              maxWidth: '20rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: isGenerating ? '#ccc' : capturedImages.length === 3 ? '#4F46E5' : '#000',
              color: '#fff',
              border: 'none',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%'
                  }}
                />
                <span>Generating...</span>
              </>
            ) : capturedImages.length === 3 ? (
              'Generate'
            ) : (
              'Capture Image'
            )}
          </motion.button>
        </div>
      </div>

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        imageUrl={previewUrl}
        onDownload={handleDownload}
      />
    </DndProvider>
  )
}

export default CapturePage