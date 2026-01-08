import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/sm-data-logo.jpeg';
import ceoImage from '@/assets/ceo-shamsuddeen.jpeg';
import { 
  Users, 
  Target, 
  Heart, 
  Award,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We exist to make digital services affordable for every Nigerian.' },
  { icon: Heart, title: 'Customer First', description: 'Every decision we make starts with our customers in mind.' },
  { icon: Award, title: 'Excellence', description: 'We strive for excellence in everything we do, from service to support.' },
  { icon: Users, title: 'Community', description: 'We believe in building a community of empowered users.' },
];

const WebAbout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/website')}>
              <img src={logo} alt="SM Data App" className="w-10 h-10 lg:w-12 lg:h-12 rounded-full" />
              <span className="font-bold text-xl lg:text-2xl text-secondary">SM Data App</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <button onClick={() => navigate('/website')} className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </button>
              <button className="text-foreground font-medium">
                About
              </button>
              <button onClick={() => navigate('/webpricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </button>
              <button onClick={() => navigate('/webcontact')} className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </button>
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/weblogin')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/weblogin')} size="lg">
                Get Started Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <nav className="flex flex-col gap-4">
                <button onClick={() => navigate('/website')} className="text-left text-muted-foreground hover:text-foreground">
                  Home
                </button>
                <button className="text-left text-foreground font-medium">
                  About
                </button>
                <button onClick={() => navigate('/webpricing')} className="text-left text-muted-foreground hover:text-foreground">
                  Pricing
                </button>
                <button onClick={() => navigate('/webcontact')} className="text-left text-muted-foreground hover:text-foreground">
                  Contact
                </button>
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => navigate('/weblogin')} className="flex-1">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/weblogin')} className="flex-1">
                    Get Started
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            About <span className="text-primary">SM Data App</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            We're on a mission to make digital services affordable and accessible to every Nigerian. 
            Learn about our journey and the team behind the platform.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary font-semibold mb-3">OUR STORY</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Built by Nigerians, for Nigerians
              </h2>
              <p className="text-muted-foreground mb-4">
                SM Data App was founded with a simple yet powerful vision: to make data, airtime, 
                and digital payments affordable for every Nigerian. We saw how much money people were 
                spending on basic digital services and knew there had to be a better way.
              </p>
              <p className="text-muted-foreground mb-4">
                From students stretching their allowances to business owners managing team expenses, 
                we've become the go-to platform for affordable digital services.
              </p>
              <p className="text-muted-foreground">
                Our commitment to low prices, instant delivery, and excellent customer service is 
                what drives us every day. And we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-3">OUR VALUES</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">What We Stand For</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-3">OUR LEADER</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Meet the Founder</h2>
          </div>
          <div className="flex justify-center">
            <div className="bg-card rounded-2xl p-8 text-center shadow-sm border border-border max-w-sm">
              <img 
                src={ceoImage} 
                alt="Shamsuddeen Muhammad"
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
              <h3 className="font-bold text-xl text-foreground">Shamsuddeen Muhammad</h3>
              <p className="text-primary font-medium">CEO & Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start saving money on data, airtime, and bill payments today.
          </p>
          <Button onClick={() => navigate('/weblogin')} size="lg" className="gap-2 text-lg px-8 py-6 mb-6">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          {/* App Store Badges */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="https://play.google.com/store" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] opacity-80">GET IT ON</p>
                <p className="text-sm font-semibold -mt-0.5">Google Play</p>
              </div>
            </a>
            <a 
              href="https://apps.apple.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <p className="text-[10px] opacity-80">Download on the</p>
                <p className="text-sm font-semibold -mt-0.5">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="SM Data App" className="w-10 h-10 rounded-full" />
              <span className="font-bold text-xl">SM Data App</span>
            </div>
            <nav className="flex gap-6 text-sm opacity-70">
              <button onClick={() => navigate('/website')} className="hover:opacity-100">Home</button>
              <button className="opacity-100">About</button>
              <button onClick={() => navigate('/webpricing')} className="hover:opacity-100">Pricing</button>
              <button onClick={() => navigate('/webcontact')} className="hover:opacity-100">Contact</button>
            </nav>
            <p className="text-sm opacity-70">© {new Date().getFullYear()} SM Data App</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebAbout;
