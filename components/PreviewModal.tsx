import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  onDownload: () => void
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onDownload,
}) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-4 sm:p-6 relative flex flex-col items-center gap-4 sm:gap-6 
                     w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold text-black">Preview</h2>
            
            <div 
              className="relative overflow-hidden border border-black shadow-lg h-[50vh] sm:h-[60vh] md:h-[65vh] 
                         flex items-center justify-center w-auto"
              style={{ transform: 'rotate(-3deg) scale(0.95)' }}
            >
              <img
                src={imageUrl}
                alt="Photo Strip Preview"
                className="h-full w-auto object-contain rounded-md shadow-sm"
              />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault()
                onDownload()
              }}
              className="bg-black text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-800 transition-colors"
            >
              Download Photo Strip
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PreviewModal 