import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default function middleware(req: any) {
    return withAuth(req, {
        isReturnToCurrentPage: true
    });
}
export const config = {
    matcher: ['/dashboard/:path*', '/auth-callback'],
};