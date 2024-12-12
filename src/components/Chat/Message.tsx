import { cn } from "@/lib/utils";
import { ExtendedMessage } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";
import { User, Bot } from "lucide-react";

interface MessageProps {
    message: ExtendedMessage;
    isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
    ({ message, isNextMessageSamePerson }, ref) => {
        const isUserMessage = message.isUserMessage;
        const messageClasses = cn(
            "flex flex-col space-y-2 text-base max-w-md mx-2",
            {
                "items-end order-1": isUserMessage,
                "items-start order-2": !isUserMessage,
            }
        );

        const bubbleClasses = cn(
            "px-4 py-2 rounded-lg inline-block",
            {
                "bg-blue-600 text-white rounded-br-none": isUserMessage && !isNextMessageSamePerson,
                "bg-gray-200 text-gray-900 rounded-bl-none": !isUserMessage && !isNextMessageSamePerson,
                "bg-blue-600 text-white": isUserMessage,
                "bg-gray-200 text-gray-900": !isUserMessage,
            }
        );

        const avatarClasses = cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center",
            {
                "order-2 bg-blue-600 rounded-sm": isUserMessage,
                "order-1 bg-zinc-800 rounded-sm": !isUserMessage,
                invisible: isNextMessageSamePerson,
            }
        );

        return (
            <div
                ref={ref}
                className={cn("flex items-end", {
                    "justify-end": isUserMessage,
                })}
            >
                <div className={avatarClasses}>
                    {isUserMessage ? (
                        <User className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
                    ) : (
                        <Bot className="fill-zinc-300 text-zinc-300 h-3/4 w-3/4" />
                    )}
                </div>
                <div className={messageClasses}>
                    <div className={bubbleClasses}>
                        {typeof message.text === "string" ? (
                            <ReactMarkdown
                                className={cn("prose", {
                                    "text-zinc-50": isUserMessage,
                                })}
                            >
                                {message.text}
                            </ReactMarkdown>
                        ) : (
                            message.text
                        )}
                        {message.id !== "loading-message" && (
                            <div
                                className={cn("text-xs select-none mt-2 text-right", {
                                    "text-zinc-500": !isUserMessage,
                                    "text-blue-300": isUserMessage,
                                })}
                            >
                                {format(new Date(message.createTime), "HH:mm")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
);

Message.displayName = "Message";

export default Message;
