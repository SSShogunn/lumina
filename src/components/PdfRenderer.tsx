"use client";

import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Ghost,
    Loader2,
    RotateCw,
    Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
    url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
    const { toast } = useToast();

    const [numPages, setNumPages] = useState<number>();
    const [currPage, setCurrPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);

    const customPageValidator = z.object({
        page: z
            .string()
            .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
    });
    type TCustomPageValidator = z.infer<typeof customPageValidator>;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: "1",
        },
        resolver: zodResolver(customPageValidator),
    });

    const handlePageSubmit = ({ page }: TCustomPageValidator) => {
        setCurrPage(Number(page));
        setValue("page", String(page));
    };

    const { width, ref } = useResizeDetector();

    return (
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button
                        aria-label="previous page"
                        variant="ghost"
                        disabled={currPage <= 1}
                    >
                        <ChevronLeft
                            className="w-4 h-4"
                            onClick={() => {
                                setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
                                setValue("page", String(currPage - 1));
                            }}
                        />
                    </Button>
                    <div className="flex items-center gap-1.5">
                        <Input
                            className={cn(
                                "w-12 h-8",
                                errors.page && "focus-visible:ring-red-500"
                            )}
                            {...register("page")}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit(handlePageSubmit)();
                                }
                            }}
                        />
                        <p className="text-zinc-700 text-sm space-x-1">
                            <span>/</span>
                            <span>{numPages ?? "X"}</span>
                        </p>
                    </div>
                    <Button
                        aria-label="next page"
                        variant="ghost"
                        disabled={numPages === undefined || currPage === numPages}
                    >
                        <ChevronRight
                            className="w-4 h-4"
                            onClick={() => {
                                setCurrPage((prev) =>
                                    prev + 1 > numPages! ? numPages! : prev + 1
                                );
                                setValue("page", String(currPage + 1));
                            }}
                        />
                    </Button>
                </div>
                <div className="space-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                                <Search className="h-4 w-4" />
                                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                        <DropdownMenuItem
                                onSelect={() => {
                                    setScale(0.75);
                                }}
                            >
                                75%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setScale(1);
                                }}
                            >
                                100%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setScale(1.5);
                                }}
                            >
                                150%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setScale(2);
                                }}
                            >
                                200%
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setScale(2.5);
                                }}
                            >
                                250%
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        onClick={() => {
                            setRotation((prev) => prev + 90);
                        }}
                        variant="ghost"
                        aria-label="rotate 90 degerees"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
                    <div ref={ref} className="max-h-full">
                        <Document
                            file={url}
                            loading={
                                <div className="flex justify-center">
                                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                                </div>
                            }
                            onLoadError={() => {
                                toast({
                                    title: "Error loading PDF.",
                                    description: "Please try again later.",
                                    variant: "destructive",
                                });
                            }}
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages);
                            }}
                        >
                            <Page
                                width={width ? width : 1}
                                pageNumber={currPage}
                                scale={scale}
                                rotate={rotation}
                            />
                        </Document>
                    </div>
                </SimpleBar>
            </div>
        </div>
    );
};

export default PdfRenderer;
