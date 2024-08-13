"use client"

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const AuthCallbackPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    const { data, isLoading, isError, isSuccess } = trpc.authCallback.useQuery();

    if (isSuccess) {
        if (data.success) {
            router.push(origin ? `/${origin}` : '/dashboard')
        }
    }

    if (isError) {
        router.push('/sign-in')
    }

    return (
        <div className='w-full mt-24 flex justify-center'>
            <div className='flex flex-col items-center gap-2'>
                {isLoading && <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />}
                <h3 className='font-semibold text-xl'>
                    Setting up your account...
                </h3>
                <p>You will be redirected automatically.</p>
            </div>
        </div>
    )
}

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallbackPage />
        </Suspense>
    )
}

export default Page
