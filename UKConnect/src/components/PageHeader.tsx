import { useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backButtonPath?: string
  rightContent?: React.ReactNode
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  showBackButton = false,
  backButtonPath = '/dashboard',
  rightContent,
  className = ''
}: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(backButtonPath)
  }

  // Generate class names based on className prop to match existing CSS
  const headerClass = className ? `${className}-header` : 'page-header'
  const containerClass = className ? `${className}-header-container` : 'page-header-container'
  const leftClass = className ? `${className}-header-left` : 'page-header-left'
  const backBtnClass = className ? `${className}-back-btn` : 'page-header-back-btn'
  const textClass = className ? `${className}-header-text` : 'page-header-text'
  const titleClass = className ? `${className}-title` : 'page-header-title'
  const subtitleClass = className ? `${className}-subtitle` : 'page-header-subtitle'
  const rightClass = className ? `${className}-header-right` : 'page-header-right'

  return (
    <header className={headerClass}>
      <div className={containerClass}>
        <div className={leftClass}>
          {showBackButton && (
            <button 
              className={backBtnClass}
              onClick={handleBack}
            >
              <HiOutlineArrowLeft />
            </button>
          )}
          <div className={textClass}>
            <h1 className={titleClass}>{title}</h1>
            {subtitle && (
              <p className={subtitleClass}>{subtitle}</p>
            )}
          </div>
        </div>
        {rightContent && (
          <div className={rightClass}>
            {rightContent}
          </div>
        )}
      </div>
    </header>
  )
}

