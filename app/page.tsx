import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, FileText, Zap, CheckCircle2, ArrowUpRight, Loader2, BarChart2, Brain, Shield, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, auth } from "@clerk/nextjs"
import { AnimatedSection } from "./components/animated-section"
import { OnboardingStatus } from "./components/onboarding-status"
import { OnboardingButton } from "./components/onboarding-button"
import Image from "next/image"

const features = [
  {
    icon: Zap,
    title: "Automatic Capture",
    description: "Seamlessly track your work with our desktop app. No manual input required."
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Smart categorization and insights powered by advanced machine learning algorithms."
  },
  {
    icon: FileText,
    title: "Smart Invoicing",
    description: "Generate professional invoices with a single click. Integrate with your billing system."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data is encrypted and secure. We never share your information with third parties."
  }
]

const testimonials = [
  {
    quote: "TimeTrack AI has transformed how we handle time tracking. The AI categorization is incredibly accurate!",
    author: "Sarah Johnson",
    role: "Engineering Manager",
    company: "TechCorp"
  },
  {
    quote: "The automatic time tracking has saved us countless hours. It's like having a personal assistant for time management.",
    author: "Michael Chen",
    role: "Freelance Developer",
    company: "Independent"
  }
]

const metrics = [
  { value: "85%", label: "Time Saved", description: "Reduction in manual time tracking" },
  { value: "99%", label: "Accuracy", description: "In AI-powered categorization" },
  { value: "24/7", label: "Monitoring", description: "Continuous activity tracking" },
  { value: "10k+", label: "Users", description: "Trust TimeTrack AI daily" }
]

const plans = [
  {
    name: "Starter",
    price: "$9",
    period: "/month",
    description: "Perfect for freelancers",
    features: [
      "Automatic time tracking",
      "Basic AI categorization",
      "Simple reporting",
      "Email support"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "Best for small teams",
    features: [
      "Everything in Starter",
      "Advanced AI insights",
      "Team collaboration",
      "Priority support",
      "Custom integrations"
    ],
    popular: true
  }
]

export default async function Home() {
  const session = await auth();
  const userId = session?.userId;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50/80 dark:from-background dark:via-background/95 dark:to-background/90">
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 p-1.5 text-white shadow-md">
              <Clock className="h-4 w-4" />
            </div>
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
                <Button variant="ghost" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <AnimatedSection delay={0.2}>
          <section className="container space-y-8 py-12 lg:py-24">
            <div className="relative">
              <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-violet-500 to-indigo-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
              </div>
            </div>

            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center">
              <div className="rounded-full border border-violet-200 dark:border-violet-900 bg-white/50 dark:bg-white/5 backdrop-blur-sm px-7 py-2 text-sm font-medium text-violet-900 dark:text-violet-300 shadow-sm">
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Introducing AI-powered time categorization
                </span>
              </div>
              
              <h1 className="text-4xl font-bold sm:text-6xl md:text-7xl lg:text-8xl">
                <span className="inline-block bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Automate Your
                </span>
                <br />
                <span className="inline-block text-foreground">
                  Time Tracking
                </span>
              </h1>
              
              <p className="max-w-[42rem] text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Effortlessly track time, generate invoices, and focus on what matters. 
                Our AI-powered system handles the rest.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {!userId ? (
                  <SignUpButton mode="modal" redirectUrl="/onboarding/profile">
                    <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Button>
                  </SignUpButton>
                ) : (
                  <OnboardingButton />
                )}
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800" asChild>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <section id="features" className="container py-24">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="relative rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-8 md:p-12 lg:p-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent" />
                
                <div className="relative space-y-4 text-center mb-12">
                  <h2 className="text-3xl font-bold">Powerful Features</h2>
                  <p className="text-lg text-muted-foreground max-w-[42rem] mx-auto">
                    Our intelligent system captures your work automatically and uses AI to classify tasks and generate
                    accurate timesheets.
                  </p>
                </div>

                <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  {features.map((feature) => (
                    <div 
                      key={feature.title}
                      className="group space-y-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                    >
                      <div className="inline-flex rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-3">
                        <feature.icon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.6}>
          <section className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Trusted by Thousands</h2>
                <p className="text-lg text-muted-foreground max-w-[42rem] mx-auto">
                  See what our users have to say about TimeTrack AI
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {testimonials.map((testimonial, index) => (
                  <div 
                    key={testimonial.author}
                    className="rounded-xl border bg-card p-6 transition-all hover:border-primary"
                  >
                    <div className="space-y-4">
                      <p className="text-lg italic text-muted-foreground">"{testimonial.quote}"</p>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={0.8}>
          <section className="container py-8 md:py-12 lg:py-24 bg-muted/50 rounded-3xl">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">By the Numbers</h2>
                <p className="text-lg text-muted-foreground max-w-[42rem] mx-auto">
                  Our impact in time tracking and productivity
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="text-center space-y-2">
                    <p className="text-4xl font-bold text-primary">{metric.value}</p>
                    <p className="font-semibold">{metric.label}</p>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection delay={1}>
          <section id="pricing" className="container py-8 md:py-12 lg:py-24">
            <div className="mx-auto max-w-5xl space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
                <p className="text-lg text-muted-foreground max-w-[42rem] mx-auto">
                  Choose the plan that works best for you
                </p>
              </div>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 lg:gap-12">
                {plans.map((plan) => (
                  <div 
                    key={plan.name}
                    className={`rounded-xl border bg-card p-8 transition-all relative ${
                      plan.popular ? 'border-primary shadow-lg' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                          Most Popular
                        </div>
                      </div>
                    )}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-xl">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full gap-2" variant={plan.popular ? "default" : "outline"}>
                        Get Started <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      </main>

      <footer className="border-t py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Clock className="h-5 w-5" />
                <span>TimeTrack AI</span>
              </Link>
              <div className="flex gap-4">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-sm text-muted-foreground">© 2024 TimeTrack AI. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <Users className="h-5 w-5" />
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">
                  <BarChart2 className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 