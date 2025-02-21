import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";
import { Clock } from "lucide-react";

// Redirect /dashboard to /dashboard/overview
export default function DashboardPage() {
  redirect("/dashboard/overview");
}

