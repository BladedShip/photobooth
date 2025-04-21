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

export const generatePhotoStrip = async (images: { url: string; filter: string }[], eventDetails?: { title?: string; date?: string }) => {
  // Create a canvas element
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  // Set dimensions for the photo strip (closer to 2x6 inch ratio at 300 DPI)
  const width = 600
  const height = 1800
  canvas.width = width
  canvas.height = height

  // Set white background
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  // Header Section
  ctx.fillStyle = 'black'
  ctx.textAlign = 'center'
  
  const headerStartY = 100
  let currentY = headerStartY

  // Process Title (assuming "Name1 & Name2" format)
  if (eventDetails?.title) {
    const parts = eventDetails.title.split('&').map(part => part.trim())
    if (parts.length === 2) {
      // Draw Name 1
      ctx.font = '60px Poppins' // Adjust font as needed
      ctx.fillText(parts[0].toUpperCase(), width / 2, currentY)
      currentY += 60 // Spacing after Name 1
      
      // Draw Ampersand
      ctx.font = '50px Poppins' // Adjust font as needed
      ctx.fillText('&', width / 2, currentY)
      currentY += 60 // Spacing after Ampersand

      // Draw Name 2
      ctx.font = '60px Poppins' // Adjust font as needed
      ctx.fillText(parts[1].toUpperCase(), width / 2, currentY)
      currentY += 50 // Spacing after Name 2
    } else {
      // Fallback for single title or different format
      ctx.font = '48px Poppins'
      ctx.fillText(eventDetails.title.toUpperCase(), width / 2, currentY)
      currentY += 60
    }
  }

  // Add date if provided
  if (eventDetails?.date) {
    ctx.font = '30px Poppins' // Adjust font as needed
    ctx.fillText(eventDetails.date, width / 2, currentY)
    currentY += 40 // Spacing after Date
  } else {
    currentY += 20 // Add some space even if no date
  }

  // Add horizontal line
  ctx.beginPath()
  ctx.moveTo(width * 0.15, currentY)
  ctx.lineTo(width * 0.85, currentY)
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 2
  ctx.stroke()
  
  const imagesStartY = currentY + 40 // Space after line

  // Load and draw images
  try {
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = url
      })
    }

    // Calculate image dimensions and spacing
    const imageWidth = width * 0.95 // Use more width
    const imageHeight = imageWidth * 0.75 // Make images slightly less tall (adjust aspect ratio as needed)
    const spacing = 15 // Reduce spacing between images
    let imageY = imagesStartY

    // Adjust starting Y if images might overlap footer (optional, depends on final layout)
    // const footerHeightEstimate = 150;
    // if (imageY + totalImageBlockHeight > height - footerHeightEstimate) {
    //   console.warn("Potential overlap, consider adjusting layout or image size");
    // }

    // Load and draw each image
    for (let i = 0; i < images.length; i++) {
      if (i > 0) {
        imageY += imageHeight + spacing
      }
      const img = await loadImage(images[i].url)
      
      // Draw image
      ctx.save()
      ctx.filter = getFilterStyle(images[i].filter) 
      ctx.drawImage(
        img,
        (width - imageWidth) / 2, // Center image
        imageY,
        imageWidth,
        imageHeight
      )
      ctx.restore()
    }

    // Footer Section
    const footerStartY = height - 100 // Move footer slightly up
    ctx.font = '24px Poppins' // Adjust font as needed
    ctx.fillStyle = '#AAAAAA' // Lighter gray
    ctx.fillText('FIND YOUR PHOTOS AT', width / 2, footerStartY)
    
    ctx.font = '28px Poppins' // Adjust font as needed
    ctx.fillStyle = '#888888' // Slightly darker gray
    ctx.fillText('WWW.PHOTOBOOTH.APP', width / 2, footerStartY + 35) // Reduce the offset from 50 to 35

    // Convert canvas to PNG
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Error generating photo strip:', error)
    throw error
  }
}