import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });
export const ourFileRouter = {

    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .middleware(async ({ req }) => {
            
            const {getUser} = getKindeServerSession();
            const user = await getUser();

            return {};
        })
        .onUploadComplete(async ({ metadata, file }) => {
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;