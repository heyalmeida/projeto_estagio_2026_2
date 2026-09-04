import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminHeader } from "./AdminHeader";

/**
 * Layout for the admin section. Even though middleware already redirects
 * unauthenticated visitors to /login, we re-check the session here as a
 * defense-in-depth measure. Also provides the header chrome.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-ivory-50">
      <AdminHeader
        adminName={session.user.name ?? null}
        adminEmail={session.user.email ?? null}
      />
      <main id="conteudo" className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}