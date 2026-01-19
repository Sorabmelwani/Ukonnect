import { useState, useRef, useEffect } from 'react'
import { 
  HiOutlineCheckCircle, 
  HiOutlineDocumentText, 
  HiOutlineUser, 
  HiOutlineOfficeBuilding, 
  HiOutlineHome,
  HiOutlineInformationCircle,
  HiOutlineUpload,
  HiOutlineDownload
} from 'react-icons/hi'
import { uploadDocument, getDocuments, downloadDocument, type DocumentCategory, type Document } from '../api/documents'
import ThemeToggle from '../components/ThemeToggle'
import PageHeader from '../components/PageHeader'

interface DocumentType {
  id: string
  title: string
  required: boolean
  category: DocumentCategory
  icon: JSX.Element
}

const documentTypes: DocumentType[] = [
  {
    id: 'visa',
    title: 'Visa Documents',
    required: true,
    category: 'VISA',
    icon: <HiOutlineDocumentText />
  },
  {
    id: 'passport',
    title: 'Passport Copy',
    required: true,
    category: 'IDENTITY',
    icon: <HiOutlineUser />
  },
  {
    id: 'bank',
    title: 'Bank Statements',
    required: false,
    category: 'FINANCE',
    icon: <HiOutlineOfficeBuilding />
  },
  {
    id: 'address',
    title: 'Proof of Address',
    required: true,
    category: 'HOUSING',
    icon: <HiOutlineHome />
  },
  {
    id: 'insurance',
    title: 'Insurance Documents',
    required: false,
    category: 'HEALTH',
    icon: <HiOutlineDocumentText />
  },
  {
    id: 'other',
    title: 'Other Documents',
    required: false,
    category: 'OTHER',
    icon: <HiOutlineDocumentText />
  }
]

export default function DocumentManager() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categoryInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const [uploadedCount, setUploadedCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([])

  const requiredCount = documentTypes.filter(doc => doc.required).length
  const remainingCount = requiredCount - uploadedCount

  // Load existing documents on mount
  useEffect(() => {
    loadDocuments()
  }, [])

  const calculateUploadedCount = (docs: Document[]): number => {
    const requiredCategories = documentTypes.filter(dt => dt.required).map(dt => dt.category)
    const uploadedRequiredCategories = new Set(
      docs
        .filter(doc => doc.category && requiredCategories.includes(doc.category))
        .map(doc => doc.category)
    )
    return uploadedRequiredCategories.size
  }

  const loadDocuments = async () => {
    try {
      const docs = await getDocuments()
      setUploadedDocuments(docs)
      setUploadedCount(calculateUploadedCount(docs))
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  const handleBrowseFiles = () => {
    fileInputRef.current?.click()
  }

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    
    if (file.size > maxSize) {
      return 'File size exceeds 10MB limit'
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, JPG, or PNG files'
    }
    
    return null
  }

  const uploadFile = async (file: File, category?: DocumentCategory) => {
    try {
      setUploading(true)
      setUploadError(null)
      setUploadSuccess(null)

      const validationError = validateFile(file)
      if (validationError) {
        setUploadError(validationError)
        setUploading(false)
        return
      }

      const uploadedDoc = await uploadDocument({
        file,
        category: category || undefined
      })

      setUploadedDocuments(prev => {
        const updated = [...prev, uploadedDoc]
        // Recalculate uploaded count based on unique required categories
        setUploadedCount(calculateUploadedCount(updated))
        return updated
      })

      setUploadSuccess(`Successfully uploaded ${file.name}`)
      setTimeout(() => setUploadSuccess(null), 3000)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload document'
      setUploadError(errorMessage)
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = async (files: FileList | null, category?: DocumentCategory) => {
    if (!files || files.length === 0) return

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i], category)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDocumentUpload = (docId: string) => {
    categoryInputRefs.current[docId]?.click()
  }

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      setDownloading(documentId)
      setUploadError(null)
      await downloadDocument(documentId, filename)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to download document'
      setUploadError(errorMessage)
      setTimeout(() => setUploadError(null), 5000)
    } finally {
      setDownloading(null)
    }
  }

  const getDocumentsForCategory = (category: DocumentCategory): Document[] => {
    return uploadedDocuments.filter(doc => doc.category === category)
  }

  return (
    <div className="document-manager">
      <PageHeader
        title="Document Manager"
        subtitle="Upload and manage your settlement documents securely"
        showBackButton={true}
        backButtonPath="/dashboard"
        rightContent={<ThemeToggle />}
        className="document-manager"
      />

      <main className="document-manager-main">
        <div className="document-manager-container">
          {/* Document Completion Progress Section */}
          <section className="document-progress-card">
            <div className="document-progress-header">
              <HiOutlineCheckCircle className="document-progress-icon" />
              <h2 className="document-progress-title">Document Completion Progress</h2>
            </div>
            <p className="document-progress-subtitle">Upload all required documents to complete your profile.</p>
            <div className="document-progress-content">
              <label className="document-progress-label">Required Documents</label>
              <div className="document-progress-bar">
                <div 
                  className="document-progress-bar-fill" 
                  style={{ width: `${(uploadedCount / requiredCount) * 100}%` }}
                />
              </div>
              <div className="document-progress-stats">
                <span className="document-progress-count">{uploadedCount}/{requiredCount}</span>
                <span className="document-progress-remaining">{remainingCount} documents remaining</span>
              </div>
            </div>
          </section>

          {/* Upload Status Messages */}
          {uploadError && (
            <div className="document-upload-error">
              {uploadError}
            </div>
          )}
          {uploadSuccess && (
            <div className="document-upload-success">
              {uploadSuccess}
            </div>
          )}

          {/* Drag and Drop Upload Section */}
          <section 
            className={`document-upload-area ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleBrowseFiles}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={uploading}
            />
            <HiOutlineUpload className="document-upload-icon" />
            <p className="document-upload-text-primary">
              {uploading ? 'Uploading...' : 'Drop your documents here'}
            </p>
            <p className="document-upload-text-secondary">Drag and drop files or click to browse.</p>
            <button 
              className="document-upload-browse-btn" 
              onClick={(e) => { e.stopPropagation(); handleBrowseFiles(); }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Browse Files'}
            </button>
            <p className="document-upload-hint">Supported formats: PDF, JPG, PNG • Max 10MB per file.</p>
          </section>

          {/* Individual Document Upload Cards */}
          <section className="document-cards-grid">
            {documentTypes.map((doc) => {
              const categoryDocuments = getDocumentsForCategory(doc.category)
              const isUploaded = categoryDocuments.length > 0
              return (
                <div key={doc.id} className="document-card">
                  <input
                    ref={(el) => { categoryInputRefs.current[doc.id] = el }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      handleFileSelect(e.target.files, doc.category)
                      if (e.target) e.target.value = '' // Reset input
                    }}
                    disabled={uploading}
                  />
                  <div className="document-card-icon">{doc.icon}</div>
                  <h3 className="document-card-title">{doc.title}</h3>
                  <span className={`document-card-tag ${doc.required ? 'required' : 'optional'}`}>
                    {doc.required ? 'Required' : 'Optional document'}
                  </span>
                  <div className="document-card-status">
                    <HiOutlineInformationCircle className="document-card-info-icon" />
                    <span>
                      {isUploaded ? `${categoryDocuments.length} document${categoryDocuments.length > 1 ? 's' : ''} uploaded` : doc.required ? 'Required document' : 'Optional document'}
                    </span>
                  </div>
                  
                  {/* Show uploaded documents with download buttons */}
                  {isUploaded && (
                    <div className="document-card-uploads-list">
                      {categoryDocuments.map((uploadedDoc) => (
                        <div key={uploadedDoc.id} className="document-upload-item">
                          <span className="document-upload-name" title={uploadedDoc.originalName}>
                            {uploadedDoc.originalName.length > 25 
                              ? `${uploadedDoc.originalName.substring(0, 25)}...` 
                              : uploadedDoc.originalName}
                          </span>
                          <button
                            className="document-download-btn"
                            onClick={() => handleDownload(uploadedDoc.id, uploadedDoc.originalName)}
                            disabled={downloading === uploadedDoc.id}
                            title="Download document"
                          >
                            <HiOutlineDownload className="document-download-icon" />
                            {downloading === uploadedDoc.id ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    className={`document-card-upload-btn ${isUploaded ? 'uploaded' : ''}`}
                    onClick={() => handleDocumentUpload(doc.id)}
                    disabled={uploading}
                  >
                    <HiOutlineUpload className="document-card-upload-icon" />
                    {isUploaded ? 'Upload Another' : 'Upload Document'}
                  </button>
                </div>
              )
            })}
          </section>
        </div>
      </main>
    </div>
  )
}
