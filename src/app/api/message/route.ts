import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { abort } from "process";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id: userId } = user;
        const { fileId, message } = SendMessageValidator.parse(body);

        const file = await db.file.findFirst({
            where: {
                id: fileId,
                userId,
            },
        });

        if (!file) {
            return new NextResponse("Not Found", { status: 404 });
        }

        await db.message.create({
            data: {
                text: message,
                isUserMessage: true,
                userId,
                fileId,
            },
        });

        // Vectorize message
        const embeddings = new OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const pineconeIndex = pinecone.Index("lumina");
        const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex,
            namespace: file.id,
        });

        const results = await vectorStore.similaritySearch(message, 4);

        const prevMessages = await db.message.findMany({
            where: {
                fileId,
            },
            orderBy: {
                createTime: "asc",
            },
            take: 6,
        });

        const formattedPrevMessages = prevMessages.map((msg) => ({
            role: msg.isUserMessage ? "user" : "assistant",
            content: msg.text,
        }));

        const responseStream = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0,
            stream: true,
            messages: [
                {
                    role: "system",
                    content: "You are a knowledgeable and detail-oriented assistant. Your task is to analyze the provided context and prior conversation to respond to the user's question accurately. Format your response in markdown. If you are unsure or lack sufficient information to answer confidently, clearly state that you don't know.",
                },
                {
                    role: "user",
                    content: `Answer the user's question based on the following information:

                    **Previous Conversation:**
                    ${formattedPrevMessages
                            .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
                            .join("\n")}

                    **Context:**
                    ${results.map((r) => r.pageContent).join("\n\n")}

                    **User's Question:**
                    ${message}

                    **Instructions:**
                    1. Format your response in markdown.
                    2. Reference specific parts of the context or conversation if applicable.
                    3. If the provided information is insufficient for a confident answer, indicate that explicitly.
                    4. Offer to clarify or provide additional details if necessary.`,
                },
            ],
        });

        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
            async start(controller) {
                let finalResponse = "";
                for await (const chunk of responseStream) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    finalResponse += text
                    controller.enqueue(encoder.encode(text));
                }
                await db.message.create({
                    data: {
                        text: finalResponse,
                        isUserMessage: false,
                        fileId,
                        userId
                    }
                })
                controller.close();
            },
        });
        return new NextResponse(readableStream, {
            headers: { "Content-Type": "text/event-stream" },
        });
    } catch (error) {
        console.error("Error processing request:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
