"use client"

import { trpc } from "@/app/_trpc/client"
import UploadButton from "./UploadButton"
import { Ghost, Loader2, Plus, Trash, FileText } from "lucide-react"
import Skeleton from 'react-loading-skeleton'
import Link from "next/link"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { useState } from "react"

const Dashboard = () => {
    const [currentlyDeletingFile, setCurrentlyDeletingFile] = useState<string | null>(null)

    const utils = trpc.useUtils()

    const { data: files, isLoading } = trpc.getUserFiles.useQuery()

    const { mutate: deleteFile } = trpc.deleteUserFiles.useMutation({
        onSuccess: () => {
            utils.getUserFiles.invalidate()
        },
        onMutate({ id }) {
            setCurrentlyDeletingFile(id)
        },
        onSettled() {
            setCurrentlyDeletingFile(null)
        }
    })

    return (
        <main className="mx-auto max-w-7xl md:p-10">
            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 px-2 sm:flex-row sm:items-center sm:gap-0">
                <h1 className="mb-3 font- text-4xl text-gray-900">My Files</h1>
                <UploadButton />
            </div>

            {files && files?.length !== 0 ? (
                <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {files
                        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
                        .map((file) => (
                            <li key={file.id}
                                className="group col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200">
                                <Link href={`/dashboard/${file.id}`} className="flex flex-col gap-2">
                                    <div className="px-6 py-4 flex items-center space-x-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl text-gray-900 truncate">
                                                {file.name.split('.')[0]}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>

                                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Plus className="h-4 w-4" />
                                                {format(new Date(file.createTime), "MMM d, yyyy")}
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                deleteFile({ id: file.id })
                                            }}
                                        >
                                            {currentlyDeletingFile === file.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                </ul>
            ) : isLoading ? (
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-[200px] rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="mt-16 flex flex-col items-center gap-2">
                    <Ghost className="h-8 w-8 text-zinc-800" />
                    <h3 className="font-semibold text-xl">Pretty empty around here</h3>
                    <p className="text-zinc-500">Let&apos;s upload your first PDF</p>
                </div>
            )}
        </main>
    )
}

export default Dashboard
