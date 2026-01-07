import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/sm-data-logo.jpeg';
import { 
  Wifi, 
  Phone, 
  Zap, 
  Tv, 
  Send, 
  Gift, 
  Shield, 
  Clock, 
  Wallet,
  Star,
  ChevronRight,
  CheckCircle2,
  Users,
  Smartphone,
  ArrowRight
} from 'lucide-react';

const services = [
  { icon: Wifi, label: 'Data', description: 'Affordable data bundles', color: 'bg-purple-100 text-purple-600' },
  { icon: Phone, label: 'Airtime', description: 'Instant top-up', color: 'bg-green-100 text-green-600' },
  { icon: Zap, label: 'Electricity', description: 'Pay power bills', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Tv, label: 'TV Sub', description: 'Cable subscriptions', color: 'bg-red-100 text-red-600' },
  { icon: Send, label: 'Transfer', description: 'Send money fast', color: 'bg-blue-100 text-blue-600' },
  { icon: Gift, label: 'Cashback', description: 'Earn rewards', color: 'bg-pink-100 text-pink-600' },
];

const features = [
  { icon: Shield, title: 'Secure Payments', description: 'Bank-level encryption protects all your transactions' },
  { icon: Clock, title: 'Instant Delivery', description: 'Get your data and airtime delivered in seconds' },
  { icon: Wallet, title: 'Best Prices', description: 'Enjoy the lowest rates in the market' },
  { icon: Gift, title: 'Earn Rewards', description: 'Get ₦100 for every friend you refer' },
];

const testimonials = [
  { name: 'Adebayo O.', rating: 5, text: 'SM Data App has been a game-changer! The cheapest data prices I\'ve found anywhere.' },
  { name: 'Chioma E.', rating: 5, text: 'Super fast and reliable. I use it every week for my family\'s data subscriptions.' },
  { name: 'Ibrahim M.', rating: 5, text: 'The referral program is amazing. I\'ve earned over ₦5,000 just by sharing with friends!' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SM Data App" className="w-10 h-10 rounded-full" />
            <span className="font-bold text-lg text-secondary">SM Data App</span>
          </div>
          <Button onClick={() => navigate('/auth')} size="sm">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                <Star className="w-4 h-4 fill-current" />
                Nigeria's #1 Data App
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Buy Data & Airtime at the <span className="text-primary">Cheapest</span> Rates
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Save money on data, airtime, electricity bills, and TV subscriptions. 
                Fast, reliable, and secure payments with instant delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button onClick={() => navigate('/auth')} size="lg" className="gap-2">
                  Start Saving Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">50K+</p>
                  <p className="text-sm text-muted-foreground">Happy Users</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">₦10M+</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">4.9★</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="w-64 h-[500px] bg-card rounded-[2.5rem] shadow-2xl border-8 border-foreground/10 overflow-hidden">
                  <div className="h-6 bg-foreground/10 flex items-center justify-center">
                    <div className="w-20 h-4 bg-foreground/20 rounded-full" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-sm text-foreground">SM Data App</p>
                        <p className="text-xs text-muted-foreground">Welcome back!</p>
                      </div>
                    </div>
                    <div className="gradient-primary rounded-xl p-4 text-white mb-4">
                      <p className="text-xs opacity-80">Wallet Balance</p>
                      <p className="text-2xl font-bold">₦25,000</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {services.slice(0, 6).map(({ icon: Icon, label, color }) => (
                        <div key={label} className="flex flex-col items-center p-2">
                          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-1`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] text-foreground">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 top-20 bg-card rounded-xl p-3 shadow-lg border border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Data Delivered!</span>
                  </div>
                </div>
                <div className="absolute -left-4 bottom-32 bg-card rounded-xl p-3 shadow-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">₦100 Cashback</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Our Services</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Everything you need to stay connected, all in one app
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map(({ icon: Icon, label, description, color }) => (
              <div 
                key={label}
                className="bg-card rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Why Choose <span className="text-secondary">SM Data App?</span>
              </h2>
              <div className="space-y-5">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 h-40 flex flex-col justify-end">
                  <Smartphone className="w-10 h-10 text-primary mb-2" />
                  <p className="font-semibold text-foreground">Easy to Use</p>
                </div>
                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-6 h-52 flex flex-col justify-end">
                  <Users className="w-10 h-10 text-secondary mb-2" />
                  <p className="font-semibold text-foreground">Trusted by Thousands</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl p-6 h-52 flex flex-col justify-end">
                  <Wallet className="w-10 h-10 text-yellow-600 mb-2" />
                  <p className="font-semibold text-foreground">Save More Money</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 h-40 flex flex-col justify-end">
                  <Clock className="w-10 h-10 text-purple-600 mb-2" />
                  <p className="font-semibold text-foreground">24/7 Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Create Account</h3>
              <p className="text-muted-foreground text-sm">
                Sign up in seconds with your phone number or email
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Fund Your Wallet</h3>
              <p className="text-muted-foreground text-sm">
                Add money to your wallet using bank transfer or card
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Start Saving</h3>
              <p className="text-muted-foreground text-sm">
                Buy data, airtime, and pay bills at the best rates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">What Our Users Say</h2>
            <p className="text-muted-foreground">Trusted by thousands of Nigerians</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="gradient-primary rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Saving?
            </h2>
            <p className="text-lg opacity-90 mb-6 max-w-lg mx-auto">
              Join over 50,000 Nigerians who save money every day with SM Data App
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg" 
              variant="secondary"
              className="gap-2"
            >
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="SM Data App" className="w-10 h-10 rounded-full" />
                <span className="font-bold text-lg">SM Data App</span>
              </div>
              <p className="text-sm opacity-70">
                Your trusted partner for affordable data, airtime & bill payments
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>Data Bundles</li>
                <li>Airtime Top-up</li>
                <li>Electricity Bills</li>
                <li>TV Subscriptions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>About Us</li>
                <li>Contact</li>
                <li>FAQs</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-70">
            <p>© {new Date().getFullYear()} SM Data App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
