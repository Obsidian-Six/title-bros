import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Process from "@/components/Process";
import LoanEstimator from "@/components/loan/LoanEstimator";
import FAQPreview from "@/components/FAQPreview";
import Marquee from "@/components/Marquee";
import Button from "@/components/common/Button";
import WhyUsSec from "@/components/WhyUsSec";
import TestimonialsSec from "@/components/TestimonialsSec";
import ReadySection from "@/components/common/ReadySection";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Process />
      <Marquee />
      <LoanEstimator />
      <WhyUsSec />
      <TestimonialsSec />
      <FAQPreview />
     <ReadySection />
    </>
  );
}
