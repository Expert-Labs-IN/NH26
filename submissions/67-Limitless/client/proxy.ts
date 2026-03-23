import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        console.log(token, 'hello')
        if (!token) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        const userType = token.userType as string;

        if (path.startsWith("/admin") && userType !== "admin") {
            return NextResponse.redirect(new URL("/", req.url));
        }
        if (path.startsWith("/agent") && userType !== "agent") {
            return NextResponse.redirect(new URL("/", req.url));
        }
        if (path.startsWith("/user") && userType !== "user") {
            return NextResponse.redirect(new URL("/", req.url));
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        }
    }
);

export const config = {
    matcher: ["/admin/:path*", "/agent/:path*", "/user/:path*"],
};
