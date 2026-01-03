import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/sm-data-logo.jpeg';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-sm">
        <img 
          src={logo} 
          alt="SM Data App" 
          className="w-28 h-28 mx-auto rounded-full shadow-xl mb-6 border-4 border-secondary" 
        />
        <h1 className="mb-2 text-3xl font-bold text-secondary">SM Data</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your trusted partner for affordable data, airtime & bill payments
        </p>
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full"
            size="lg"
          >
            Get Started
          </Button>
          <p className="text-xs text-muted-foreground">
            Fast • Reliable • Affordable
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;