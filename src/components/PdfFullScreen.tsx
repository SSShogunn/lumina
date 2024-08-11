import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Expand, Loader2 } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { Page, Document } from 'react-pdf';
import { useToast } from './ui/use-toast';
import { useResizeDetector } from 'react-resize-detector';

interface PDFFullScreenProps {
    fileUrl: string;
}

const PdfFullScreen = ({ fileUrl }: PDFFullScreenProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [numPages, setNumPages] = useState<number>();
    const { width, ref } = useResizeDetector();
    const { toast } = useToast();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button aria-label="Full Screen" className="gap-1.5" variant="ghost" onClick={() => setIsOpen(true)}>
                    <Expand className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl w-full">
                <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
                    <div ref={ref} className="max-h-full">
                        <Document
                            file={fileUrl}
                            loading={
                                <div className="flex justify-center">
                                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                                </div>
                            }
                            onLoadError={() => {
                                toast({
                                    title: 'Error loading PDF.',
                                    description: 'Please try again later.',
                                    variant: 'destructive',
                                });
                            }}
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages);
                            }}
                        >
                            {numPages &&
                                new Array(numPages).fill(0).map((_, i) => (
                                    <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
                                ))}
                        </Document>
                    </div>
                </SimpleBar>
            </DialogContent>
        </Dialog>
    );
};

export default PdfFullScreen;
