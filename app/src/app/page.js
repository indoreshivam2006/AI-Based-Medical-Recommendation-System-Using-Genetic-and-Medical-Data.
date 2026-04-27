import Navbar from "./components/Navbar";

import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import DrugSection from "./components/DrugSection";
import HowItWorks from "./components/HowItWorks";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>

      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DrugSection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
