import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden font-plus-jakarta">
            {/* Background Neural Glows */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#0052FF]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#4CAF9A]/10 rounded-full blur-[120px]" />

            <AuthForm type="login" />

            <p className="mt-8 text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">WorkSync &bull; Secure Node Entry &bull; v2.0.4</p>
        </main>
    );
}
