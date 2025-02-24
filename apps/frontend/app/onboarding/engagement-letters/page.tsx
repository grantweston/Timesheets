"use client"

import { motion } from "framer-motion"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { useToast } from "@/app/components/ui/use-toast"
import { useState } from "react"
import { Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EngagementLettersPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one engagement letter to upload.",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    try {
      // TODO: Implement file upload logic here
      // This would typically involve creating signed URLs and uploading to your storage
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${files.length} engagement letter${files.length > 1 ? 's' : ''}.`
      })
      
      // Move to next step
      router.push('/onboarding/desktop')
    } catch (error) {
      console.error('Failed to upload files:', error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSkip = () => {
    router.push('/onboarding/desktop')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Upload Engagement Letters</h2>
            <p className="text-muted-foreground">
              Have engagement letters that weren't found in DocuSign or your email? Upload them here.
            </p>
          </div>

          <label 
            htmlFor="file-upload" 
            className="cursor-pointer relative border-2 border-dashed rounded-lg p-12 hover:border-primary transition-colors"
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PDF, DOC, DOCX (Max 10MB each)</p>
            </div>
          </label>

          {files.length > 0 && (
            <div className="w-full">
              <p className="mb-2 font-medium">Selected files:</p>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 