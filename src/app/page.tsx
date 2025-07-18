"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Document {
  id: number
  title: string
  description: string
  fileName: string
  uploadDate: string
  status: 'pending' | 'processed' | 'error'
}

export default function HomePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null
  })

  // Simular datos iniciales
  useEffect(() => {
    const mockDocuments: Document[] = [
      {
        id: 1,
        title: "Plan de Estudios 2024",
        description: "Documento con el plan de estudios actualizado para el año 2024",
        fileName: "plan_estudios_2024.pdf",
        uploadDate: "2024-01-15",
        status: "processed"
      },
      {
        id: 2,
        title: "Reglamento Académico",
        description: "Reglamento académico vigente de la universidad",
        fileName: "reglamento_academico.pdf",
        uploadDate: "2024-01-10",
        status: "processed"
      }
    ]
    setDocuments(mockDocuments)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.file) return

    setIsUploading(true)

    // Simular subida de archivo
    setTimeout(() => {
      const newDocument: Document = {
        id: documents.length + 1,
        title: formData.title,
        description: formData.description,
        fileName: formData.file?.name || '',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      }

      setDocuments(prev => [newDocument, ...prev])
      setFormData({ title: '', description: '', file: null })
      setShowUploadForm(false)
      setIsUploading(false)

      // Simular procesamiento
      setTimeout(() => {
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === newDocument.id 
              ? { ...doc, status: 'processed' as const }
              : doc
          )
        )
      }, 3000)
    }, 2000)
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'processed': return 'Procesado'
      case 'pending': return 'Procesando'
      case 'error': return 'Error'
      default: return 'Desconocido'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Sistema de Gestión de Documentos
              </h1>
              <p className="text-muted-foreground mt-1">
                Universidad ESPOCH - Gestión de Documentos Académicos
              </p>
            </div>
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-primary hover:bg-primary/90"
            >
              {showUploadForm ? 'Cancelar' : 'Subir Documento'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Form */}
        {showUploadForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subir Nuevo Documento</CardTitle>
              <CardDescription>
                Complete la información del documento que desea subir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Documento</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ingrese el título del documento"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Archivo</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción opcional del documento"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isUploading ? 'Subiendo...' : 'Subir Documento'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Documentos Recientes</h2>
            <p className="text-muted-foreground">
              {documents.length} documento{documents.length !== 1 ? 's' : ''} total{documents.length !== 1 ? 'es' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusText(doc.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="line-clamp-3">
                    {doc.description || 'Sin descripción disponible'}
                  </CardDescription>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Archivo:</span>
                      <span className="font-medium">{doc.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha:</span>
                      <span>{new Date(doc.uploadDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalles
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  No hay documentos disponibles
                </p>
                <p className="text-muted-foreground mt-2">
                  Haga clic en "Subir Documento" para comenzar
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-muted-foreground">
            <p>© 2024 Universidad ESPOCH - Sistema de Gestión de Documentos</p>
            <p className="text-sm mt-1">Desarrollado para la gestión académica institucional</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
