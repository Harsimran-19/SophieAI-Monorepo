import Link from "next/link"
import { FileText, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeSwitcher } from "@/components/theme-switcher"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex size-full items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="from-sophie-pink to-sophie-blue flex size-8 items-center justify-center rounded-full bg-gradient-to-r">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="gradient-text text-xl font-bold">SophieAI</span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Resume</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li className="row-span-3">
                    <Link
                      href="/"
                      className="from-sophie-pink-light/50 to-sophie-blue-light/50 flex size-full select-none flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none focus:shadow-md"
                    >
                      <FileText className="text-sophie-pink h-6 w-6" />
                      <div className="mb-2 mt-4 text-lg font-medium">
                        Resume Builder
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Create, refine, or optimize your resume based on your
                        needs
                      </p>
                    </Link>
                  </li>
                  <li>
                    <Link href="/create" legacyBehavior passHref>
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">
                          Create New
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Build a professional resume from scratch
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <li>
                    <Link href="/refine" legacyBehavior passHref>
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">
                          Refine Existing
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Improve your current resume
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <li>
                    <Link href="/optimize" legacyBehavior passHref>
                      <NavigationMenuLink className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <div className="text-sm font-medium leading-none">
                          Optimize for Job
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Tailor your resume to specific job descriptions
                        </p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/documents" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Document Center
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Button
            asChild
            className="from-sophie-pink to-sophie-blue bg-gradient-to-r hover:opacity-90"
          >
            <Link href="/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
