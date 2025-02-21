import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, FileText, Zap, CheckCircle2, ArrowUpRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, auth } from "@clerk/nextjs"
import { AnimatedSection } from "./components/animated-section"
import { OnboardingStatus } from "./components/onboarding-status"
import { OnboardingButton } from "./components/onboarding-button"

const features = [
  {
    icon: Zap,
    title: "Automatic Capture",
    description: "Seamlessly track your work with our desktop app. No manual input required."
  },
  {
    icon: FileText,
    title: "Smart Invoicing",
    description: "Generate professional invoices with a single click. Integrate with your billing system."
  }
]

export default async function Home() {
  const session = await auth();
  const userId = session?.userId;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Clock className="h-5 w-5" />
            <span>TimeTrack AI</span>
          </Link>
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <OnboardingStatus />
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal" redirectUrl="/onboarding/profile">
                <Button variant="ghost" className="hover:bg-accent">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <AnimatedSection delay={0.2}>
          <section className="container space-y-6 py-8 md:py-12 lg:py-24">
            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
              <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                New: AI-powered time categorization
              </div>
              <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Automate Your Time Tracking with AI
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Effortlessly track time, generate invoices, and focus on what matters. Our AI-powered system handles the
                rest.
              </p>
              <div className="flex gap-4">
                {!userId ? (
                  <SignUpButton mode="modal" redirectUrl="/onboarding/profile">
                    <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                ) : (
                  <OnboardingButton />
                )}
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <section id="features" className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">How It Works</h2>
                <p className="text-lg text-muted-foreground">
                  Our intelligent system captures your work automatically and uses AI to classify tasks and generate
                  accurate timesheets.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature, index) => (
                  <div 
                    key={feature.title}
                    className="group space-y-2 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-primary/5"
                  >
                    <feature.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 TimeTrack AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
} 