"use client";

import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowRight, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
    const [isOpen, setOpen] = useState<boolean>(false);

    const pathname = usePathname();

    const toggleOpen = () => setOpen((prev) => !prev);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    const closeOnCurrent = (href: string) => {
        if (pathname === href) {
            setOpen(false);
        }
    };

    return (
        <div className="sm:hidden">
            <Menu
                onClick={toggleOpen}
                className="relative z-50 h-5 w-5 text-zinc-700"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
            />

            {isOpen && (
                <div className="fixed inset-0 z-40 w-full animate-in slide-in-from-top-5 fade-in-20">
                    <ul
                        id="mobile-menu"
                        className="absolute grid w-full gap-3 px-10 pt-20 pb-8 bg-white border-b border-zinc-200 shadow-xl"
                    >
                        {isAuth ? (
                            <>
                                <li>
                                    <Link
                                        onClick={() => closeOnCurrent("/dashboard")}
                                        className="flex items-center w-full font-semibold"
                                        href="/dashboard"
                                    >
                                        Dashboard
                                    </Link>
                                </li>
                                <li className="my-3 h-px w-full bg-gray-300" />
                                <li>
                                    <LogoutLink className="flex items-center w-full font-semibold">
                                        Sign out
                                    </LogoutLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        onClick={() => closeOnCurrent("/sign-up")}
                                        className="flex items-center w-full font-semibold text-green-600"
                                        href="/sign-up"
                                    >
                                        Get started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </li>
                                <li className="my-3 h-px w-full bg-gray-300" />
                                <li>
                                    <Link
                                        onClick={() => closeOnCurrent("/sign-in")}
                                        className="flex items-center w-full font-semibold"
                                        href="/sign-in"
                                    >
                                        Sign in
                                    </Link>
                                </li>
                                <li className="my-3 h-px w-full bg-gray-300" />
                                <li>
                                    <Link
                                        onClick={() => closeOnCurrent("/pricing")}
                                        className="flex items-center w-full font-semibold"
                                        href="/pricing"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default MobileNav;
