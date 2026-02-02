import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy } from 'lucide-react';

interface OpenInBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
}

/** Asks user to open link in browser (for PWA). Open tries window.open; Copy link copies to clipboard so user can paste in browser. */
export function OpenInBrowserDialog({
  open,
  onOpenChange,
  url,
  title = 'Open in browser',
}: OpenInBrowserDialogProps) {
  const handleOpen = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onOpenChange(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onOpenChange(false);
      // Toast or alert: link copied
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast({ title: 'Link copied', description: 'Paste it in your browser to open.' });
      } else {
        alert('Link copied. Paste it in your browser to open.');
      }
    } catch {
      alert('Could not copy. Open the link manually: ' + url);
      onOpenChange(false);
    }
  };

  const displayUrl = url.length > 50 ? url.slice(0, 47) + '...' : url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Open this link in your browser? (In the app it may open inside the app.)
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground break-all font-mono py-2" title={url}>
          {displayUrl}
        </p>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            className="flex-1"
            onClick={handleOpen}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCopy}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
