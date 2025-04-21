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
          className="bg-white rounded-lg p-6 relative"
          onClick={e => e.stopPropagation()}
          style={{
            maxHeight: '90vh',
            width: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-10 hover:bg-opacity-20 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-semibold">Preview</h2>
            
            <div 
              className="relative overflow-hidden"
              style={{
                height: '70vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={imageUrl}
                alt="Photo Strip Preview"
                style={{
                  height: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>

            <button
              onClick={(e) => {
                e.preventDefault()
                onDownload()
              }}
              className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
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