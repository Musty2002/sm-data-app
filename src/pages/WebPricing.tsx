import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/sm-data-logo.jpeg';
import { 
  Check, 
  ArrowRight,
  Wifi,
  Phone,
  Zap,
  Tv,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const dataPrices = [
  { network: 'MTN', plans: [
    { data: '500MB', price: '₦130', validity: '30 days' },
    { data: '1GB', price: '₦250', validity: '30 days' },
    { data: '2GB', price: '₦480', validity: '30 days' },
    { data: '5GB', price: '₦1,200', validity: '30 days' },
    { data: '10GB', price: '₦2,400', validity: '30 days' },
  ]},
  { network: 'Airtel', plans: [
    { data: '500MB', price: '₦120', validity: '30 days' },
    { data: '1GB', price: '₦230', validity: '30 days' },
    { data: '2GB', price: '₦450', validity: '30 days' },
    { data: '5GB', price: '₦1,100', validity: '30 days' },
    { data: '10GB', price: '₦2,200', validity: '30 days' },
  ]},
  { network: 'Glo', plans: [
    { data: '500MB', price: '₦110', validity: '30 days' },
    { data: '1GB', price: '₦220', validity: '30 days' },
    { data: '2GB', price: '₦430', validity: '30 days' },
    { data: '5GB', price: '₦1,050', validity: '30 days' },
    { data: '10GB', price: '₦2,100', validity: '30 days' },
  ]},
  { network: '9Mobile', plans: [
    { data: '500MB', price: '₦100', validity: '30 days' },
    { data: '1GB', price: '₦200', validity: '30 days' },
    { data: '2GB', price: '₦400', validity: '30 days' },
    { data: '5GB', price: '₦950', validity: '30 days' },
    { data: '10GB', price: '₦1,900', validity: '30 days' },
  ]},
];

const otherServices = [
  { 
    icon: Phone, 
    title: 'Airtime Top-up', 
    description: 'All networks at face value',
    features: ['MTN, Airtel, Glo, 9Mobile', 'Instant delivery', '2% discount on bulk'],
    color: 'bg-green-100 text-green-600'
  },
  { 
    icon: Zap, 
    title: 'Electricity Bills', 
    description: 'All disco companies',
    features: ['EKEDC, IKEDC, AEDC, etc.', 'Instant token delivery', 'No service charges'],
    color: 'bg-yellow-100 text-yellow-600'
  },
  { 
    icon: Tv, 
    title: 'TV Subscriptions', 
    description: 'All cable TV providers',
    features: ['DStv, GOtv, Startimes', 'Instant activation', 'Up to 3% discount'],
    color: 'bg-red-100 text-red-600'
  },
];

const benefits = [
  'No hidden fees or charges',
  'Instant delivery guaranteed',
  'Earn cashback on every purchase',
  '24/7 customer support',
  'Secure payment processing',
  'Referral bonuses available',
];

const WebPricing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');

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
              <button onClick={() => navigate('/webabout')} className="text-muted-foreground hover:text-foreground transition-colors">
                About
              </button>
              <button className="text-foreground font-medium">
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
                <button onClick={() => navigate('/webabout')} className="text-left text-muted-foreground hover:text-foreground">
                  About
                </button>
                <button className="text-left text-foreground font-medium">
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
            Unbeatable <span className="text-primary">Prices</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the best rates on data, airtime, and bill payments in Nigeria. 
            Save up to 15% compared to traditional channels.
          </p>
        </div>
      </section>

      {/* Data Pricing Section */}
      <section className="py-12 lg:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Wifi className="w-4 h-4" />
              Data Bundles
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Data Prices by Network</h2>
          </div>

          {/* Network Tabs */}
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {dataPrices.map(({ network }) => (
              <Button
                key={network}
                variant={selectedNetwork === network ? "default" : "outline"}
                onClick={() => setSelectedNetwork(network)}
                className="min-w-[80px]"
              >
                {network}
              </Button>
            ))}
          </div>

          {/* Pricing Table */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 p-4 font-bold text-foreground">
                <span>Data</span>
                <span className="text-center">Price</span>
                <span className="text-right">Validity</span>
              </div>
              {dataPrices.find(d => d.network === selectedNetwork)?.plans.map((plan, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-3 p-4 border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium text-foreground">{plan.data}</span>
                  <span className="text-center text-primary font-bold">{plan.price}</span>
                  <span className="text-right text-muted-foreground">{plan.validity}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              * Prices may vary. Check app for current rates.
            </p>
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Other Services</h2>
            <p className="text-lg text-muted-foreground">All at the best rates in Nigeria</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {otherServices.map(({ icon: Icon, title, description, features, color }) => (
              <div key={title} className="bg-card rounded-2xl p-8 shadow-sm border border-border">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-5`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground mb-5">{description}</p>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="gradient-primary rounded-3xl p-10 lg:p-16 text-white">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Why Our Prices Are the Best
                </h2>
                <p className="opacity-90 mb-6">
                  We've built direct partnerships with networks and service providers to bring you 
                  the lowest possible rates. No middlemen, no markup.
                </p>
                <Button 
                  onClick={() => navigate('/weblogin')} 
                  size="lg" 
                  variant="secondary"
                  className="gap-2"
                >
                  Start Saving Today
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Start Saving?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Create your free account today and enjoy the best prices on data, airtime, and bills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/weblogin')} size="lg" className="gap-2 text-lg px-8 py-6">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/webcontact')} className="text-lg px-8 py-6">
              Contact Sales
            </Button>
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
              <button onClick={() => navigate('/webabout')} className="hover:opacity-100">About</button>
              <button className="opacity-100">Pricing</button>
              <button onClick={() => navigate('/webcontact')} className="hover:opacity-100">Contact</button>
            </nav>
            <p className="text-sm opacity-70">© {new Date().getFullYear()} SM Data App</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebPricing;
