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
                    content: `You are Lumina's AI assistant, specialized in analyzing and discussing PDF documents. Your responses should be:
                            1. Precise and directly related to the uploaded PDF content
                            2. Formatted in clean, readable markdown
                            3. Include direct quotes from the document when relevant, using '>' for quotations
                            4. Clear about any uncertainties or limitations in your knowledge
                            5. Professional yet approachable in tone, representing Lumina's helpful nature

                            When referencing the document, cite specific sections or pages when available. If the user asks about topics outside the current PDF, politely redirect them to focus on the uploaded document.`,
                },
                {
                    role: "user",
                    content: `Analyze the following context and respond to the user's question:

                    **Context from uploaded PDF:**
                    ${results.map((r) => r.pageContent).join("\n\n")}

                    **Previous Conversation:**
                    ${formattedPrevMessages
                            .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
                            .join("\n")}

                    **Current Question:**
                    ${message}

                    **Instructions:**
                    1. Focus exclusively on the uploaded PDF content and conversation history
                    2. Use markdown for formatting (headers, lists, bold, etc.)
                    3. Quote relevant document passages using '>' when appropriate
                    4. Clearly state if any requested information isn't found in the document
                    5. Maintain conversation context while staying within the document's scope`,
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
