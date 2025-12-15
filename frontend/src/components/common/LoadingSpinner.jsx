const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  }

  return (
    <div className={`inline-block ${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

export default LoadingSpinner
