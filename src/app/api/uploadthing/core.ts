import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const f = createUploadthing();

const middleware = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        throw new UploadThingError("UNAUTHORIZED");
    }

    return { userId: user.id };
};

const onUploadComplete = async ({ metadata, file }: {
    metadata: Awaited<ReturnType<typeof middleware>>;
    file: {
        key: string;
        name: string;
        url: string;
    };
}) => {
    const isFileExist = await db.file.findFirst({
        where: {
            id: file.key
        }
    });

    if (isFileExist) return;

    const fileUrl = `https://utfs.io/f/${file.key}`;

    try {
        const createdFile = await db.file.create({
            data: {
                key: file.key,
                name: file.name,
                userId: metadata.userId,
                url: fileUrl,
                uploadStatus: "PROCESSING",
            }
        });

        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            const loader = new PDFLoader(blob);
            const pageLevelDocs = await loader.load();

            const pineconeIndex = pinecone.Index("lumina");
            const embeddings = new OpenAIEmbeddings({
                openAIApiKey: process.env.OPEN_API_KEY,
            });

            await PineconeStore.fromDocuments(
                pageLevelDocs,
                embeddings,
                {
                    pineconeIndex,
                    namespace: createdFile.id,
                }
            );

            await db.file.update({
                data: {
                    uploadStatus: "SUCCESS"
                },
                where: {
                    id: createdFile.id
                }
            });
        } catch (err) {
            console.error("Error processing PDF file:", err);

            await db.file.update({
                data: {
                    uploadStatus: "FAILED"
                },
                where: {
                    id: createdFile.id
                }
            });
        }
    } catch (error) {
        console.error("Error creating file record:", error);
    }
};

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "8MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
