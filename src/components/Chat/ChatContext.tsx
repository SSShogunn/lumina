import { createContext, ReactNode, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => { },
    message: "",
    handleInputChange: () => { },
    isLoading: false
})

interface ChatContextProps {
    fileId: string,
    children: ReactNode
}

export const ChatContextProvider = ({ fileId, children }: ChatContextProps) => {

    const [message, setMessage] = useState<string>("")

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const utils = trpc.useContext()

    const backupMessage = useRef('')

    const { toast } = useToast()

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: "POST",
                body: JSON.stringify({
                    fileId,
                    message
                })
            })

            if (!response.ok) {
                throw new Error("FAILED TO SEND MESSAGE")
            }

            return response.body
        },
        onMutate: async ({ message }) => {
            backupMessage.current = message
            setMessage("")

            await utils.getFileMessages.cancel()

            const prevMessages = utils.getFileMessages.getInfiniteData()

            utils.getFileMessages.setInfiniteData(
                { fileId, limit: INFINITE_QUERY_LIMIT },
                (old) => {
                    if (!old) {
                        return {
                            pages: [],
                            pageParams: []
                        }
                    }

                    let newPages = [...old.pages]

                    let latestPage = newPages[0]!

                    latestPage.messages = [
                        {
                            createTime: new Date().toISOString(),
                            id: crypto.randomUUID(),
                            text: message,
                            isUserMessage: true
                        },
                        ...latestPage.messages
                    ]

                    newPages[0] = latestPage

                    return {
                        ...old,
                        pages: newPages
                    }
                }
            )

            setIsLoading(true)

            return {
                prevMessages: prevMessages?.pages.flatMap((page) => page.messages) ?? []
            }
        },
        onSuccess: async (stream) => {
            setIsLoading(false)

            if (!stream) toast({
                title: "There was a problem sending this message",
                description: "Please refresh this page and try again",
                variant: "destructive"
            })

            const reader = stream?.getReader();
            const decoder = new TextDecoder();
            let done: boolean = false;

            let accResponse = "";

            while (!done) {
                const { value, done: doneReading } = await (reader?.read() ?? {});
                done = doneReading ?? false;
                const chunkValue = decoder.decode(value)
                accResponse += chunkValue

                utils.getFileMessages.setInfiniteData(
                    { fileId, limit: INFINITE_QUERY_LIMIT },
                    (old) => {
                        if (!old) return { pages: [], pageParams: [] }

                        let isAiResponseGenerated = old.pages.some(
                            (page) => page.messages.some((message) => message.id === "ai-response")
                        )

                        let updatedPages = old.pages.map((page) => {
                            if (page === old.pages[0]) {
                                let updatedMessages

                                if (!isAiResponseGenerated) {
                                    updatedMessages = [
                                        {
                                            createTime: new Date().toISOString(),
                                            id: "ai-response",
                                            text: accResponse,
                                            isUserMessage: false
                                        },
                                        ...page.messages
                                    ]
                                } else {
                                    updatedMessages = page.messages.map((message) => {
                                        if (message.id === "ai-response") {
                                            return {
                                                ...message,
                                                text: accResponse
                                            }
                                        }
                                        return message
                                    })
                                }
                                return {
                                    ...page,
                                    messages: updatedMessages
                                }
                            }
                            return page
                        })

                        return {
                            ...old,
                            pages: updatedPages
                        }
                    }
                )
            }
        },
        onError: (_, __, context) => {
            setMessage(backupMessage.current)
            utils.getFileMessages.setData(
                { fileId },
                { messages: context?.prevMessages ?? [] }
            )
        },
        onSettled: async () => {
            setIsLoading(false)

            await utils.getFileMessages.invalidate({ fileId })
        }
    })

    const addMessage = () => sendMessage({ message })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    }

    return (
        <ChatContext.Provider value={{ addMessage, message, handleInputChange, isLoading }}>
            {children}
        </ChatContext.Provider>
    )
}
