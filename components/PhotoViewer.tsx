import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Image from 'next/image'

interface PhotoViewerProps {
  src: string
  onClose: () => void
}

export default function PhotoViewer({ src, onClose }: PhotoViewerProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0">
        <DialogTitle className="sr-only">Progress Picture Viewer</DialogTitle>
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt="Progress Picture"
            layout="responsive"
            width={1000}
            height={1000}
            objectFit="contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
