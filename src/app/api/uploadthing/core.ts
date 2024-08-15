import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
import { metadata } from "@/app/layout";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });

const middleware = async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
        throw new UploadThingError("UNAUTHORIZED");
    }

    const subscriptionPlan = await getUserSubscriptionPlan()

    return { subscriptionPlan, userId: user.id };
}

const onUploadComplete = async ({ metadata, file }: {
    metadata: Awaited<ReturnType<typeof middleware>>
    file: {
        key: string,
        name: string,
        url: string
    }
}) => {

    const isFileExist = await db.file.findFirst({
        where: {
            id: file.key
        }
    })

    if (isFileExist) return

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

            const pagesAmt = pageLevelDocs.length

            const { subscriptionPlan } = metadata
            const { isSubscribed } = subscriptionPlan

            const isProExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf
            const isFreeExceeded = pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;

            if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
                await db.file.update({
                    data: {
                        uploadStatus: "FAILED"
                    },
                    where: {
                        id: createdFile.id
                    }
                })
            }

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
}

export const ourFileRouter = {
    freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
    proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
        .middleware(middleware)
        .onUploadComplete(onUploadComplete),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
