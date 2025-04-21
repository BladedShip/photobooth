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
      className="relative rounded-2xl overflow-hidden shadow-md w-52 aspect-[4/3] cursor-move touch-none"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.img
        src={image.url}
        alt={`Captured ${image.id}`}
        className="w-full h-full object-cover"
        style={{ filter: getFilterStyle(image.filter) }}
        layoutId={image.id}
      />
      <motion.button
        onClick={() => deleteImage(image.id)}
        initial={{ opacity: 0.6 }}
        whileHover={{ opacity: 1 }}
        className="absolute top-2 right-2 bg-black/50 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-white"
      >
        <X size={16} />
      </motion.button>
    </motion.div>
  )
}

const CapturePage = () => {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImages, setCapturedImages] = useState<ImageItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('normal')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-6 bg-gray-100 font-poppins">
        <div className="flex flex-col items-center gap-6 mb-8">
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value.toUpperCase())}
            placeholder="EVENT TITLE"
            className="font-poppins text-center border-none bg-transparent outline-none text-black text-4xl tracking-widest border-b-2 border-black/10 p-2 w-[300px] font-semibold focus:border-black/30 placeholder:text-black/30"
          />
          <input
            type="text"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            placeholder="MM.DD.YY"
            className="font-poppins text-center border-none bg-transparent outline-none text-black text-xl tracking-widest border-b border-black/10 p-2 w-[200px] font-normal focus:border-black/30 placeholder:text-black/30"
          />
        </div>

        <div className="flex gap-6 w-full max-w-[75rem] justify-center items-start">
          <div className="relative w-full max-w-[42rem] rounded-2xl overflow-hidden shadow-md aspect-[4/3]">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                aspectRatio: 4/3,
                facingMode: "user"
              }}
              className="w-full h-full object-cover rounded-2xl"
              style={{ filter: getFilterStyle(selectedFilter) }}
            />
            {capturedImages.length === 3 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
              >
                <p className="text-white text-xl">Maximum images captured</p>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-4 h-full">
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
                  className="w-52 aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500"
                >
                  <span>Image {capturedImages.length + index + 1}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {filters.map((filter) => (
            <motion.button
              key={filter.name}
              onClick={() => setSelectedFilter(filter.name)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg border border-gray-300 ${
                selectedFilter === filter.name 
                  ? 'bg-black text-white' 
                  : 'bg-transparent text-black'
              } cursor-pointer transition-all duration-200`}
            >
              {filter.label}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-4 w-full max-w-[20rem] justify-center">
          <motion.button
            onClick={capturedImages.length === 3 ? handleGenerate : capture}
            disabled={isGenerating}
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
            className={`w-full max-w-[20rem] py-3 rounded-lg ${
              isGenerating 
                ? 'bg-gray-300 cursor-not-allowed' 
                : capturedImages.length === 3 
                  ? 'bg-indigo-600' 
                  : 'bg-black'
            } text-white border-none cursor-pointer transition-all duration-200 flex items-center justify-center gap-2`}
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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