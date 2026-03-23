"use client";

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ValueStrip from "@/components/landing/ValueStrip";
import ProcessSection from "@/components/landing/ProcessSection";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import DashboardPreview from "@/components/landing/DashboardPreview";
import StatsSection from "@/components/landing/StatsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";
import { motion } from "framer-motion";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white selection:bg-[#0052FF]/10 selection:text-[#0052FF]">
            <LandingNavbar />

            <main>
                <HeroSection />
                <ValueStrip />
                <ProcessSection />
                <FeaturesGrid />
                <DashboardPreview />
                <StatsSection />
                <SecuritySection />
                <CTASection />
            </main>

            <LandingFooter />
        </div>
    );
}
