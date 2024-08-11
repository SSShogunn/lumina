import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });

export const ourFileRouter = {
    pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {
            const { getUser } = getKindeServerSession();
            const user = await getUser();

            if (!user || !user.id) {
                throw new UploadThingError("UNAUTHORIZED");
            }

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const fileUrl = `https://utfs.io/f/${file.key}`;

            try {
                // Create file record in the database
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
                    // Fetch the PDF file
                    const response = await fetch(fileUrl);
                    const blob = await response.blob();
                    console.log("blob generated");

                    // Load PDF content
                    const loader = new PDFLoader(blob);
                    const pageLevelDocs = await loader.load();
                    console.log("pageLevelDocs generated");

                    // Initialize Pinecone and OpenAI embeddings
                    const pineconeIndex = pinecone.Index("lumina");
                    const embeddings = new OpenAIEmbeddings({
                        openAIApiKey: process.env.OPEN_API_KEY,
                    });
                    console.log("embeddings generated");
                    
                    // Vectorize and index the document
                    await PineconeStore.fromDocuments(
                        pageLevelDocs,
                        embeddings,
                        {
                            pineconeIndex,
                            namespace: createdFile.id,
                        }
                    );

                    // Update file status to SUCCESS
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

                    // Update file status to FAILED
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
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
