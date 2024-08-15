import { trpc } from '@/app/_trpc/client';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import { Loader2, MessageSquare } from 'lucide-react';
import { ChatContext } from './ChatContext';
import { useIntersection } from '@mantine/hooks';
import React, { useContext, useEffect, useRef } from 'react';
import Message from './Message';
import Skeleton from 'react-loading-skeleton';

interface MessagesProps {
    fileId: string;
}

const Messages = ({ fileId }: MessagesProps) => {
    const { isLoading: isAiThinking } = useContext(ChatContext);

    const { data, isLoading, fetchNextPage } = trpc.getFileMessages.useInfiniteQuery(
        { fileId, limit: INFINITE_QUERY_LIMIT },
        { getNextPageParam: (lastPage) => lastPage?.nextCursor }
    );

    const messages = data?.pages.flatMap((page) => page.messages) || [];

    const loadingMessage = {
        createTime: new Date().toISOString(),
        id: 'loading-message',
        isUserMessage: false,
        text: (
            <span className='flex h-full items-center justify-center'>
                <Loader2 className='h-4 w-4 animate-spin' />
            </span>
        ),
    };

    const combineMessages = [
        ...(isAiThinking ? [loadingMessage] : []),
        ...messages,
    ];

    const lastMessageRef = useRef<HTMLDivElement>(null);
    const { ref, entry } = useIntersection({
        threshold: 1,
    });

    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage();
        }
    }, [entry, fetchNextPage]);

    return (
        <div className='flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
            {combineMessages.length > 0 ? (
                combineMessages.map((message, i) => {
                    const isNextMessageSamePerson =
                        i > 0 && combineMessages[i - 1]?.isUserMessage === message.isUserMessage;

                    return (
                        <Message
                            ref={i === combineMessages.length - 1 ? ref : null}
                            key={message.id}
                            isNextMessageSamePerson={isNextMessageSamePerson}
                            message={message}
                        />
                    );
                })
            ) : isLoading ? (
                <div className='w-full flex flex-col gap-2'>
                    {[...Array(4)].map((_, index) => (
                        <Skeleton key={index} className='h-16' />
                    ))}
                </div>
            ) : (
                <div className='flex-1 flex flex-col justify-center items-center gap-2'>
                    <MessageSquare className='h-8 w-8 text-blue-500' />
                    <h3 className='font-semibold text-xl'>You&apos;re all set.</h3>
                    <p className='text-zinc-500 text-sm'>
                        Ask your first question to get started.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Messages;
