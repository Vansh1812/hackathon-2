import React from 'react'
import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  return (
    <div className="loading-container">
      <motion.div
        className={`loading-spinner ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
