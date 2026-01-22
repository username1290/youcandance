import React from 'react'

/**
 * Loading Skeleton Component
 *
 * A customizable skeleton loading component that simulates content loading
 * with animated placeholder elements. No external dependencies required.
 */

const LoadingSkeleton = ({
  type = 'rect',
  width = '100%',
  height = '20px',
  count = 1,
  gap = '10px',
  animation = 'pulse',
  className = '',
  style = {},
  children = null,
}) => {
  // Generate multiple skeleton items
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <SkeletonItem
      key={`skeleton-${type}-${index}`}
      type={type}
      width={width}
      height={height}
      animation={animation}
      className={className}
      style={style}
    />
  ))

  return (
    <div className={`loading-skeleton ${animation}`} style={{ gap }}>
      {skeletonItems}
      {children}
    </div>
  )
}

const SkeletonItem = ({ type, width, height, animation, className, style }) => {
  // Apply type-specific styles
  const getTypeStyles = () => {
    switch (type) {
      case 'circle':
        return {
          borderRadius: '50%',
          width: height, // Make circle square
          aspectRatio: '1/1',
        }
      case 'text':
        return {
          height: '1em',
          marginBottom: '0.5em',
          borderRadius: '4px',
        }
      case 'button':
        return {
          height: '40px',
          borderRadius: '6px',
        }
      case 'card':
        return {
          height: '150px',
          borderRadius: '8px',
        }
      case 'avatar':
        return {
          borderRadius: '50%',
          width: height,
          aspectRatio: '1/1',
        }
      case 'rect':
      default:
        return { borderRadius: '4px' }
    }
  }

  const typeStyles = getTypeStyles()

  return (
    <div
      className={`skeleton-item ${type} ${animation} ${className}`}
      style={{
        width,
        height,
        ...typeStyles,
        ...style,
      }}
    />
  )
}

/**
 * Predefined Skeleton Layouts
 */

// Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="dashboard-skeleton">
    <LoadingSkeleton type="text" width="30%" height="32px" count={1} gap="20px" />

    <div className="skeleton-grid">
      <div className="skeleton-card">
        <LoadingSkeleton type="text" width="60%" height="24px" count={1} gap="15px" />
        <LoadingSkeleton type="rect" width="100%" height="100px" count={1} gap="15px" />
        <LoadingSkeleton type="text" width="40%" height="20px" count={1} gap="10px" />
      </div>

      <div className="skeleton-card">
        <LoadingSkeleton type="text" width="60%" height="24px" count={1} gap="15px" />
        <LoadingSkeleton type="rect" width="100%" height="100px" count={1} gap="15px" />
        <LoadingSkeleton type="text" width="40%" height="20px" count={1} gap="10px" />
      </div>

      <div className="skeleton-card">
        <LoadingSkeleton type="text" width="60%" height="24px" count={1} gap="15px" />
        <LoadingSkeleton type="rect" width="100%" height="100px" count={1} gap="15px" />
        <LoadingSkeleton type="text" width="40%" height="20px" count={1} gap="10px" />
      </div>
    </div>

    <LoadingSkeleton type="rect" width="100%" height="200px" count={1} gap="20px" />
  </div>
)

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="table-skeleton">
    {/* Header */}
    <div className="skeleton-table-header">
      {Array.from({ length: columns }, (_, index) => (
        <LoadingSkeleton
          key={`header-${index}`}
          type="text"
          width={`${100 / columns}%`}
          height="24px"
          count={1}
          gap="0"
        />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="skeleton-table-row">
        {Array.from({ length: columns }, (_, colIndex) => (
          <LoadingSkeleton
            key={`cell-${rowIndex}-${colIndex}`}
            type="text"
            width={`${100 / columns}%`}
            height="20px"
            count={1}
            gap="0"
          />
        ))}
      </div>
    ))}
  </div>
)

// Card Skeleton
export const CardSkeleton = () => (
  <div className="card-skeleton">
    <LoadingSkeleton type="rect" width="100%" height="150px" count={1} gap="15px" />
    <LoadingSkeleton type="text" width="80%" height="24px" count={1} gap="10px" />
    <LoadingSkeleton type="text" width="60%" height="20px" count={1} gap="8px" />
    <LoadingSkeleton type="text" width="90%" height="16px" count={2} gap="8px" />
  </div>
)

// List Skeleton
export const ListSkeleton = ({ items = 4 }) => (
  <div className="list-skeleton">
    {Array.from({ length: items }, (_, index) => (
      <div key={`list-item-${index}`} className="skeleton-list-item">
        <LoadingSkeleton type="circle" width="40px" height="40px" count={1} gap="15px" />
        <div className="skeleton-list-content">
          <LoadingSkeleton type="text" width="80%" height="20px" count={1} gap="8px" />
          <LoadingSkeleton type="text" width="60%" height="16px" count={1} gap="8px" />
        </div>
      </div>
    ))}
  </div>
)

// Form Skeleton
export const FormSkeleton = () => (
  <div className="form-skeleton">
    <LoadingSkeleton type="text" width="30%" height="24px" count={1} gap="20px" />

    <LoadingSkeleton type="rect" width="100%" height="40px" count={1} gap="15px" />
    <LoadingSkeleton type="rect" width="100%" height="40px" count={1} gap="15px" />
    <LoadingSkeleton type="rect" width="50%" height="40px" count={1} gap="15px" />

    <LoadingSkeleton type="button" width="20%" height="40px" count={1} gap="20px" />
  </div>
)

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="profile-skeleton">
    <div className="profile-header">
      <LoadingSkeleton type="circle" width="100px" height="100px" count={1} gap="20px" />
      <div className="profile-info">
        <LoadingSkeleton type="text" width="200px" height="32px" count={1} gap="15px" />
        <LoadingSkeleton type="text" width="150px" height="24px" count={1} gap="10px" />
        <LoadingSkeleton type="button" width="120px" height="36px" count={1} gap="15px" />
      </div>
    </div>

    <LoadingSkeleton type="rect" width="100%" height="1px" count={1} gap="20px" />

    <div className="profile-stats">
      <LoadingSkeleton type="text" width="80px" height="20px" count={3} gap="20px" />
    </div>
  </div>
)

// Full Page Skeleton
export const FullPageSkeleton = () => (
  <div className="full-page-skeleton">
    <div className="page-header">
      <LoadingSkeleton type="text" width="200px" height="36px" count={1} gap="20px" />
      <LoadingSkeleton type="button" width="120px" height="40px" count={1} gap="0" />
    </div>

    <div className="page-content">
      <DashboardSkeleton />
    </div>

    <div className="page-footer">
      <LoadingSkeleton type="text" width="150px" height="20px" count={1} gap="0" />
    </div>
  </div>
)

// Add CSS for skeleton animations
const addSkeletonCSS = () => {
  const style = document.createElement('style')
  style.textContent = `
    .loading-skeleton {
      display: flex;
      flex-direction: column;
    }
    
    .skeleton-item {
      background-color: #e0e0e0;
      background-image: linear-gradient(90deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%);
      background-size: 200% 100%;
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
    
    .skeleton-item.pulse {
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
    
    .skeleton-item.wave {
      animation: skeleton-wave 1.5s ease-in-out infinite;
    }
    
    .skeleton-item.shimmer {
      animation: skeleton-shimmer 2s linear infinite;
    }
    
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    @keyframes skeleton-wave {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes skeleton-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    /* Layout specific styles */
    .dashboard-skeleton, .table-skeleton, .card-skeleton, 
    .list-skeleton, .form-skeleton, .profile-skeleton, .full-page-skeleton {
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }
    
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    
    .skeleton-card {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .skeleton-table-header, .skeleton-table-row {
      display: flex;
      gap: 10px;
      padding: 10px 0;
    }
    
    .skeleton-table-header {
      margin-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .skeleton-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .profile-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .profile-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .profile-stats {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .page-content {
      min-height: 300px;
    }
    
    .page-footer {
      margin-top: 30px;
      text-align: center;
    }
    
    /* Theater mode support */
    .theater-mode .skeleton-item {
      background-color: #444;
      background-image: linear-gradient(90deg, #444 0%, #666 50%, #444 100%);
    }
    
    .theater-mode .skeleton-card {
      background-color: #333;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .theater-mode .skeleton-table-header {
      border-bottom-color: #666;
    }
    
    .theater-mode .skeleton-list-item {
      border-bottom-color: #666;
    }
  `

  document.head.appendChild(style)
}

// Auto-add CSS when component mounts
if (typeof window !== 'undefined') {
  addSkeletonCSS()
}

export default LoadingSkeleton
