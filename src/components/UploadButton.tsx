"use client";

import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogTrigger, 
    DialogTitle,
    DialogDescription 
} from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useToast } from "./ui/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/file-upload";

const UploadDropzone = () => {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();

    const { mutate: startPolling } = trpc.getFile.useMutation({
        onSuccess: (file) => {
            router.push(`/dashboard/${file.id}`);
        },
        retry: true,
        retryDelay: 500,
    });

    const startProgress = () => {
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 95) {
                    clearInterval(interval);
                    return prevProgress;
                } else {
                    return prevProgress + 5;
                }
            });
        }, 500);
        return interval;
    };

    return (
        <Dropzone
            multiple={false}
            onDrop={async (acceptedFiles) => {
                setIsUploading(true);
                const progressInterval = startProgress();

                try {
                    const file = acceptedFiles[0];
                    
                    if (!file) {
                        throw new Error("No file selected");
                    }

                    const response = await uploadFile(file);
                    
                    if (!response?.fileId) {
                        throw new Error("Upload failed");
                    }

                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    
                    startPolling({ key: response.fileId });
                } catch (error) {
                    console.error(error);
                    clearInterval(progressInterval);
                    setIsUploading(false);
                    toast({
                        title: "Something went wrong",
                        description: (error as Error).message || "Please try again later",
                        variant: "destructive",
                    });
                }
            }}
            accept={{
                'application/pdf': ['.pdf']
            }}
            maxSize={8 * 1024 * 1024}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div
                    {...getRootProps()}
                    className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
                >
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Cloud className="h-6 w-6 text-zinc-500" />
                                <p className="mb-2 text-sm text-zinc-700">
                                    Click to upload or drag & drop
                                </p>
                                <p className="text-xs text-zinc-500">PDF (up to 8MB)</p>
                            </div>
                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                                    <div className="px-3 py-2 h-full grid place-items-center">
                                        <File className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="px-4 py-2 h-full text-sm truncate">
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}

                            {isUploading ? (
                                <div className="w-full mt-4 max-w-xs mx-auto">
                                    <Progress
                                        value={uploadProgress}
                                        className="h-1 w-full bg-zinc-200"
                                        indicatorColor={uploadProgress === 100 ? "bg-green-500" : ""}
                                    />
                                    {uploadProgress === 100 ? (
                                        <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Redirecting...
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <input {...getInputProps()} className="hidden" />
                        </div>
                    </div>
                </div>
            )}
        </Dropzone>
    );
};

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(newOpen) => {
                if (!newOpen) {
                    setIsOpen(false);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button onClick={() => setIsOpen(true)}>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogTitle className="text-xl mb-2">
                    Upload your PDF (Max file size: 8MB)
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mb-4 hidden">
                </DialogDescription>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    );
};

export default UploadButton;