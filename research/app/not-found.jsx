import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl mt-3">Page Not Found</h2>
          <p className="mt-3 text-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/" className="mt-10">
                <Button>
                    Go back home
                </Button>
            </Link>
        </main>
      </div>
    )
  }
  