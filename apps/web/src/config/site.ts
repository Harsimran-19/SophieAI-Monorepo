import { type NavItem, type NavItemFooter } from "@/types"

const links = {
  twitter: "https://twitter.com/",
  linkedin: "https://www.linkedin.com/in/",
  discord: "",
  openGraphImage: "",
}

export const siteConfig = {
  name: "SophieAI",
  description:
    "SophieAI is a powerful AI assistant that can help you with a wide range of tasks. Whether you need help with writing, editing, or any other task, SophieAI can provide you with the help you need. With its advanced natural language processing capabilities, SophieAI can understand and respond to a wide variety of tasks, from simple to complex. Whether you're a beginner or an experienced user, SophieAI is the perfect tool for you.",
  links,
  url: "",
  ogImage: '',
  author: "Harsimran Singh",
  hostingRegion: "fra1",
  keywords: ["SaaS", "Next.js", "Template"],
  navItems: [
    {
      title: "About",
      href: "#hero-section",
    },
    {
      title: "Features",
      href: "#features-section",
    },
    // {
    //   title: "Pricing",
    //   href: "/pricing",
    // },
    {
      title: "FAQ",
      href: "#faq-section",
    },
    // {
    //   title: "Blog",
    //   href: "/blog",
    // },
  ] satisfies NavItem[],
  navItemsMobile: [],
  navItemsFooter: [
    {
      title: "Company",
      items: [
        {
          title: "About",
          href: "/about",
          external: false,
        },
        {
          title: "Privacy",
          href: "/privacy",
          external: false,
        },
        {
          title: "Terms",
          href: "/tos",
          external: false,
        },
        {
          title: "Careers",
          href: "/careers",
          external: false,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          title: "Docs",
          href: "/docs",
          external: false,
        },
        {
          title: "FAQ",
          href: "/faq",
          external: false,
        },
        {
          title: "Blog",
          href: "/blog",
          external: false,
        },
        {
          title: "Contact",
          href: "/contact",
          external: false,
        },
      ],
    },
  ] satisfies NavItemFooter[],
}
