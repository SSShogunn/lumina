import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db";
import { uploadToS3 } from "@/lib/file-upload";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { pinecone } from "@/lib/pinecone";

export async function POST(req: NextRequest) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return new NextResponse("Invalid file type", { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return new NextResponse("File too large", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${user.id}-${Date.now()}-${file.name}`;

    const fileUrl = await uploadToS3(buffer, fileName, file.type);

    const createdFile = await db.file.create({
      data: {
        key: fileName,
        name: file.name,
        userId: user.id,
        url: fileUrl,
        uploadStatus: "PROCESSING",
      },
    });

    try {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const loader = new PDFLoader(blob);
      const pageLevelDocs = await loader.load();

      const pineconeIndex = pinecone.Index("lumina");
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });

      await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
        pineconeIndex,
        namespace: createdFile.id,
      });

      await db.file.update({
        data: {
          uploadStatus: "SUCCESS",
        },
        where: {
          id: createdFile.id,
        },
      });
    } catch (err) {
      console.error("Error processing PDF:", err);
      await db.file.update({
        data: {
          uploadStatus: "FAILED",
        },
        where: {
          id: createdFile.id,
        },
      });
    }

    return NextResponse.json({ fileId: createdFile.id });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 