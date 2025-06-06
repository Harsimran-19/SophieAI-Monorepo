'use client';
import Link from "next/link"
import Balancer from "react-wrap-balancer"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { useUser } from "@/hooks/use-user"

export  function HeroSection() {
  const {user,loading,error}=useUser();
  return (
    <section
      id="hero-section"
      aria-label="hero section"
      className="mt-16 w-full md:mt-48"
    >
      <div className="container flex flex-col items-center gap-6 text-center">
          <Link
            href={'/'}
            target="_blank"
            rel="noreferrer"
            className="z-10"
          >
            <Badge
              variant="outline"
              aria-hidden="true"
              className="rounded-md px-3.5 py-1.5 text-sm transition-all duration-1000 ease-out hover:opacity-80 md:text-base md:hover:-translate-y-2"
            >
              Your AI Career Coach
            </Badge>
            <span className="sr-only">Your AI Career Coach</span>
          </Link>
        <h1 className="animate-fade-up font-urbanist text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          <Balancer>
          Build Your Dream Career with{" "}
            <span className="bg-gradient-to-r from-pink-600 to-purple-400 bg-clip-text font-extrabold text-transparent">
            AI-Powered Guidance
            </span>
          </Balancer>
        </h1>

        <h3 className="max-w-2xl animate-fade-up text-muted-foreground sm:text-xl sm:leading-8">
          <Balancer>
          {"Create stunning resumes, get personalized career advice, and land your dream job with Sophie AI's intelligent career coaching."}
          </Balancer>
        </h3>

        <div className="z-10 flex animate-fade-up flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/app"
            className={cn(
              buttonVariants({ size: "lg" }),
              "transition-all duration-1000 ease-out md:hover:-translate-y-2"
            )}
          >
            {user?'Dashboard':'Get Started'}
          </Link>

          <Link
            href={'/'}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "transition-all duration-1000 ease-out md:hover:-translate-y-2"
            )}
          >
            Watch Demo
          </Link>
        </div>
      </div>
    </section>
  )
}
