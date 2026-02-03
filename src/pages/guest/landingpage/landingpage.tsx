
import React from 'react'
import Navbar from '../../../components/ui/navbar'
import HeroSection from '../../../components/guest/landingpage/heroSection'
import StoriesSection from '../../../components/guest/landingpage/storiesSection'
import AboutSection from '../../../components/guest/landingpage/aboutSection'
import PortfolioSection from '../../../components/guest/landingpage/portfolioSection'
import CertificationsSection from '../../../components/guest/landingpage/certificationsSection'
import ServicesSection from '../../../components/guest/landingpage/servicesSection'
import ExperienceSection from '../../../components/guest/landingpage/experienceSection'
import FAQSection from '../../../components/guest/landingpage/faqSections'
import FooterSection from '../../../components/ui/footer'
import InitialShimmer from '../../../components/ui/InitialShimmer'
import { LandingPageSkeleton } from '../../../components/ui/skeletons'

const LandingPage: React.FC = () => {
  return (
    <InitialShimmer delayMs={850} skeleton={<LandingPageSkeleton />}>
      <div id="home" className="min-h-screen bg-white">
        <Navbar />
        <HeroSection />
        <StoriesSection />
        <AboutSection />
        <PortfolioSection />
        <CertificationsSection />
        <ServicesSection />
        <ExperienceSection />
        <FAQSection />
        <FooterSection />
      </div>
    </InitialShimmer>
  )
}

export default LandingPage

