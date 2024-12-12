'use client'

import Link from "next/link";
import MaxWidthWrapper from "../components/MaxWidthWrapper";
import { ArrowRight, FileText, MessageSquare, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <>
      <MaxWidthWrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50"
        >
          <Sparkles className="h-5 w-5 text-blue-500" />
          <p className="text-sm font-semibold text-gray-700">
            Powered by Advanced AI
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl text-gray-900"
        >
          Transform your <span className="text-blue-600">documents</span> into conversations
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 max-w-prose text-zinc-700 text-lg"
        >
          Experience a new way to interact with your documents. Upload any PDF and start a natural conversation,
          getting instant answers and insights powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link 
            className={buttonVariants({ 
              size: "lg", 
              className: "mt-5 bg-blue-600 hover:bg-blue-700" 
            })} 
            href="/dashboard"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </MaxWidthWrapper>

      {/* Preview Section */}
      <div>
        <div className="relative isolate">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className='mx-auto max-w-6xl px-6 lg:px-8'
          >
            <div className='mt-16 flow-root sm:mt-24'>
              <div className='rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4'>
                <Image
                  alt="product preview"
                  src="/dashboard-preview.jpg"
                  width={1364}
                  height={866}
                  className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-12 px-6 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className='mt-2 font-bold text-4xl text-gray-900 sm:text-5xl'>
              Start chatting in minutes
            </h2>
            <p className='mt-4 text-lg text-gray-600'>
              Transform the way you interact with your documents using Lumina
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 md:grid-cols-3 px-6"
        >
          {[
            {
              icon: <FileText className="h-8 w-8 text-blue-500" />,
              title: "Simple Upload",
              description: "Drag and drop your PDF files instantly"
            },
            {
              icon: <MessageSquare className="h-8 w-8 text-blue-500" />,
              title: "Smart Conversations",
              description: "Chat naturally with your documents using AI"
            },
            {
              icon: <Sparkles className="h-8 w-8 text-blue-500" />,
              title: "Instant Insights",
              description: "Get accurate answers and analysis in seconds"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              viewport={{ once: true }}
              className="relative group rounded-2xl border border-gray-200 bg-white p-8 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="relative">
                {feature.icon}
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='mx-auto max-w-6xl px-6 lg:px-8 mt-16 sm:mt-24'
        >
          <div className='rounded-2xl bg-gray-900/5 p-2 shadow-xl ring-1 ring-gray-900/10'>
            <Image
              src='/file-upload-preview.jpg'
              alt='uploading preview'
              width={1419}
              height={732}
              quality={100}
              className='rounded-xl bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10'
            />
          </div>
        </motion.div>
      </div>
    </>
  );
}
