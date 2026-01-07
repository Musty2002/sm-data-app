import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import logo from '@/assets/sm-data-logo.jpeg';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@smdataapp.com', description: 'Send us an email anytime' },
  { icon: Phone, label: 'Phone', value: '+234 800 123 4567', description: 'Mon-Fri from 8am to 6pm' },
  { icon: MapPin, label: 'Office', value: 'Lagos, Nigeria', description: 'Come say hello' },
  { icon: Clock, label: 'Response Time', value: 'Within 24 hours', description: 'We reply fast!' },
];

const faqs = [
  { 
    question: 'How do I create an account?', 
    answer: 'Simply click "Get Started" and sign up with your email or phone number. It takes less than 2 minutes!' 
  },
  { 
    question: 'Is my money safe?', 
    answer: 'Absolutely! We use bank-level 256-bit SSL encryption and advanced fraud detection to protect your funds.' 
  },
  { 
    question: 'How fast is data delivery?', 
    answer: 'Data, airtime, and most services are delivered instantly - usually within seconds of payment.' 
  },
  { 
    question: 'Can I get a refund?', 
    answer: 'Yes, we offer refunds for failed transactions. Contact support with your transaction details for assistance.' 
  },
];

const WebContact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

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
              <button onClick={() => navigate('/webpricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </button>
              <button className="text-foreground font-medium">
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
                <button onClick={() => navigate('/webpricing')} className="text-left text-muted-foreground hover:text-foreground">
                  Pricing
                </button>
                <button className="text-left text-foreground font-medium">
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
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions or need help? Our friendly support team is here to assist you. 
            Reach out and we'll respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 lg:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map(({ icon: Icon, label, value, description }) => (
              <div key={label} className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">{label}</h3>
                <p className="text-primary font-medium mb-1">{value}</p>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Send us a Message</h2>
                  <p className="text-muted-foreground text-sm">We'd love to hear from you</p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Frequently Asked</h2>
                  <p className="text-muted-foreground text-sm">Quick answers to common questions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-card rounded-xl p-5 border border-border">
                    <h3 className="font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-2xl">
                <p className="text-foreground font-medium mb-2">Still have questions?</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Can't find the answer you're looking for? Our support team is always ready to help.
                </p>
                <Button variant="outline" onClick={() => navigate('/weblogin')}>
                  Create Account & Chat with Support
                </Button>
              </div>
            </div>
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
              <button onClick={() => navigate('/webpricing')} className="hover:opacity-100">Pricing</button>
              <button className="opacity-100">Contact</button>
            </nav>
            <p className="text-sm opacity-70">© {new Date().getFullYear()} SM Data App</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebContact;
