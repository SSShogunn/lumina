import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { ChatContext } from "./ChatContext";

interface CharInputProps {
    isDisabled?: boolean;
}

const ChatInput = ({ isDisabled }: CharInputProps) => {
    const { addMessage, handleInputChange, isLoading, message } = useContext(ChatContext);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const buttonDisabled = textAreaRef.current?.value === "" || isLoading || isDisabled;

    return (
        <div className="absolute bottom-0 left-0 w-full">
            <div className="mx-2 flex flex-row gap-3 md:x-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                    <div className="relative flex flex-col w-full flex-grow p-4">
                        <div className="relative">
                            <Textarea
                                rows={1}
                                maxRows={4}
                                placeholder="Enter your questions ..."
                                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
                                autoFocus
                                ref={textAreaRef}
                                onKeyDown={(e) => {
                                    if (e.key == "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        addMessage();
                                        textAreaRef.current?.focus();
                                    }
                                }}
                                onChange={handleInputChange}
                                value={message}
                            />
                            <Button
                                className="absolute bottom-1.5 right-[8px]"
                                aria-label="send message"
                                disabled={buttonDisabled}
                                onClick={() => {
                                    addMessage();
                                    textAreaRef.current?.focus();
                                }}
                                >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
