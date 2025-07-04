"use client"
import { redirect } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
        return null;
    }

    return (
        <div className="p-4">
            <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {session.user?.image && (
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={50}
                                height={50}
                                className="rounded-full"
                            />
                        )}
                        <div>
                            <h2 className="text-xl font-bold">{session.user?.name}</h2>
                            {session.user?.email && (
                                <p className="text-gray-600">{session.user.email}</p>
                            )}
                            {(session.user as any)?.username && (
                                <p className="text-gray-500">@{(session.user as any).username}</p>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => signOut()}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
            {children}
        </div>
    );
};

export default Layout;