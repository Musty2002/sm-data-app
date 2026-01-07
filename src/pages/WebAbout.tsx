import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/sm-data-logo.jpeg';
import { 
  Users, 
  Target, 
  Heart, 
  Award,
  CheckCircle2,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const team = [
  { name: 'Samuel Adeyemi', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
  { name: 'Mary Okonkwo', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
  { name: 'David Eze', role: 'CTO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
  { name: 'Fatima Ibrahim', role: 'Customer Success Lead', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face' },
];

const values = [
  { icon: Target, title: 'Mission-Driven', description: 'We exist to make digital services affordable for every Nigerian.' },
  { icon: Heart, title: 'Customer First', description: 'Every decision we make starts with our customers in mind.' },
  { icon: Award, title: 'Excellence', description: 'We strive for excellence in everything we do, from service to support.' },
  { icon: Users, title: 'Community', description: 'We believe in building a community of empowered users.' },
];

const milestones = [
  { year: '2021', title: 'Founded', description: 'SM Data App was born with a vision to democratize access to affordable digital services.' },
  { year: '2022', title: '10,000 Users', description: 'We hit our first major milestone, proving our value to Nigerian consumers.' },
  { year: '2023', title: 'Expanded Services', description: 'Added electricity bills, TV subscriptions, and money transfer to our platform.' },
  { year: '2024', title: '50,000+ Users', description: 'Growing stronger every day with a community of loyal users across Nigeria.' },
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
                SM Data App was founded in 2021 with a simple yet powerful vision: to make data, airtime, 
                and digital payments affordable for every Nigerian. We saw how much money people were 
                spending on basic digital services and knew there had to be a better way.
              </p>
              <p className="text-muted-foreground mb-4">
                Today, we serve over 50,000 active users who trust us with their daily transactions. 
                From students stretching their allowances to business owners managing team expenses, 
                we've become the go-to platform for affordable digital services.
              </p>
              <p className="text-muted-foreground">
                Our commitment to low prices, instant delivery, and excellent customer service has 
                earned us the trust of thousands across Nigeria. And we're just getting started.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-primary mb-2">50K+</p>
                <p className="text-muted-foreground">Active Users</p>
              </div>
              <div className="bg-card rounded-2xl p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-secondary mb-2">₦500M+</p>
                <p className="text-muted-foreground">Transactions</p>
              </div>
              <div className="bg-card rounded-2xl p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-green-600 mb-2">99.9%</p>
                <p className="text-muted-foreground">Uptime</p>
              </div>
              <div className="bg-card rounded-2xl p-6 text-center shadow-sm">
                <p className="text-4xl font-bold text-yellow-600 mb-2">4.9/5</p>
                <p className="text-muted-foreground">User Rating</p>
              </div>
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

      {/* Timeline Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-3">OUR JOURNEY</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Milestones</h2>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-6 items-start">
                <div className="w-20 flex-shrink-0">
                  <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                </div>
                <div className="flex-1 bg-card rounded-2xl p-6 shadow-sm border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-lg text-foreground">{milestone.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-semibold mb-3">OUR TEAM</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Meet the People Behind SM Data</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold text-lg text-foreground">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start saving money on data, airtime, and bill payments today.
          </p>
          <Button onClick={() => navigate('/weblogin')} size="lg" className="gap-2 text-lg px-8 py-6">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
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
