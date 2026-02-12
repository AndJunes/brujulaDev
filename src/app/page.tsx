import Navbar from "@/components/landing/navbar";
import HeroSection from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";
import ProblemSection from "@/components/landing/problem-section";
import WhyBrujula from "@/components/landing/why-brujula";
import MarketSection from "@/components/landing/market-section";
import BusinessModel from "@/components/landing/business-model";
import CTASection from "@/components/landing/cta";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <ProblemSection />
        <WhyBrujula />
        <MarketSection />
        <BusinessModel />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
