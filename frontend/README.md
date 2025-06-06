# Sophie AI

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** 
  - Radix UI
  - Shadcn/ui
  - Framer Motion
- **Authentication:** Supabase Auth
- **Database:** Supabase
- **State Management:** React Hooks
- **Development Tools:**
  - ESLint
  - Prettier
  - Husky (Git Hooks)

## 🚀 Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- pnpm (recommended package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Harsimran-19/SophieAI.git
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy the example environment file:
```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configuration

5. Start the development server:
```bash
pnpm dev
```

## 📁 Project Structure

- `src/`
  - `app/` - Next.js app router pages and layouts
  - `components/` - Reusable UI components
  - `config/` - Configuration files
  - `content/` - Static content and MDX files
  - `data/` - Data utilities and constants
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions and libraries
  - `providers/` - React context providers
  - `styles/` - Global styles and Tailwind configurations
  - `types/` - TypeScript type definitions
  - `validations/` - Form and data validation schemas

## 🛠️ Development

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm prettier:format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking

## 📝 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# App
NEXT_PUBLIC_APP_URL=

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
