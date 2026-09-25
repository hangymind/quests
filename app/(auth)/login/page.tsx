import { redirect } from "next/navigation"; import { getSessionUser } from "@/lib/auth"; import { AuthForm } from "@/components/AuthForm";
export default async function LoginPage() { if (await getSessionUser()) redirect("/dashboard"); return <AuthForm mode="login"/>; }
