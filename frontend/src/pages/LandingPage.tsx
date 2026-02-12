import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRight, Briefcase, DollarSign, FileText, LayoutDashboard, Users, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const LandingPage = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleLogin = () => {
        loginWithRedirect({
            appState: { returnTo: '/dashboard' }
        });
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center bg-gradient-to-b from-background to-secondary/20">
                <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex flex-col items-center gap-6 mb-6">
                        <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium rounded-full mb-4 animate-pulse">
                            Join our test group — Be the first to try Ottero
                        </Badge>
                        <img src="/logo-icon.png" alt="Ottero Logo" className="h-32 w-auto" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                        Ottero
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                        Simple invoicing, quotes, and client management for small businesses.
                        <br className="hidden sm:block" />
                        <span className="text-muted-foreground/80">An app that doesn't complicate things.</span>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Button
                            size="lg"
                            className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                            onClick={handleLogin}
                        >
                            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="text-lg px-8 py-6 rounded-full border-2"
                            onClick={() => navigate('/guide')}
                        >
                            Learn More
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-secondary/5">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<FileText className="h-10 w-10 text-yellow-500" />}
                        title="Win More Work"
                        description="Create professional quotes and invoices with attachments. Draw sketches on the spot. Send them before you leave the driveway."
                    />
                    <FeatureCard
                        icon={<DollarSign className="h-10 w-10 text-green-500" />}
                        title="Get Paid Faster"
                        description="Turn accepted quotes into tax invoices instantly. Send professional invoices in seconds so you get paid sooner."
                    />
                    <FeatureCard
                        icon={<Users className="h-10 w-10 text-purple-500" />}
                        title="Customer & Team"
                        description="Keep track of all your clients and employees in one place. Simple CRM features to build better relationships."
                    />
                    <FeatureCard
                        icon={<Briefcase className="h-10 w-10 text-orange-500" />}
                        title="Job Tracking"
                        description="Stay on top of every job. Track progress, assign tasks, and ensure nothing falls through the cracks."
                        badge="Coming Soon"
                    />
                    <FeatureCard
                        icon={<Wrench className="h-10 w-10 text-red-500" />}
                        title="Asset Management"
                        description="Never lose a tool again. Track who has what equipment and manage your assets efficiently."
                        badge="Coming Soon"
                    />
                    <FeatureCard
                        icon={<LayoutDashboard className="h-10 w-10 text-blue-500" />}
                        title="Intuitive Dashboard"
                        description="Track open quotes, unpaid invoices, and upcoming jobs in one simple view. No accounting jargon."
                    />
                </div>
            </section>
            {/* Pricing Section */}
            <section className="py-20 px-4 bg-background">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Flexible Plans for Every Stage of your Business</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Whether you're just starting out or scaling up, we have a plan that fits your needs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Plan */}
                        <PricingCard
                            name="Free"
                            price="$0"
                            description="Perfect for getting started"
                            features={['Up to 5 Quotes/Invoices per month', 'Email Support', 'Custom Templates', 'Customer & Employee CRM']}
                            buttonText="Get Started for Free"
                            variant="outline"
                            onSubscribe={handleLogin}
                        />

                        {/* Basic Plan */}
                        <PricingCard
                            name="Basic"
                            price="$5/mo"
                            description="For growing small businesses"
                            features={['1 Month Free Trial', 'Unlimited Quotes', 'Unlimited Invoices', 'Priority Support']}
                            buttonText="Start 1 Month Free Trial"
                            variant="default"
                            isPopular={true}
                            onSubscribe={handleLogin}
                        />

                        {/* Advanced Plan */}
                        <PricingCard
                            name="Advanced"
                            price="Coming Soon"
                            description="For established or larger businesses"
                            features={['Everything in Basic', 'Job Management', 'Asset Management', 'Advanced Analytics', 'Premium Support']}
                            buttonText="Coming Soon"
                            variant="secondary"
                            onSubscribe={() => { }}
                            disabled={true}
                        />
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer className="py-8 bg-black/10 text-center text-sm text-muted-foreground">
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                    <span>&copy; {new Date().getFullYear()} Ottero. All rights reserved.</span>
                    <span>AI Soft Labs Pty Ltd ACN 681823030</span>
                    <div className="flex gap-4">
                        <a href="/terms" className="hover:underline">Terms of Service</a>
                        <a href="/privacy" className="hover:underline">Privacy Policy</a>
                        <a href="/guide" className="hover:underline">Guides</a>
                        <a href="/contact" className="hover:underline">Contact</a>
                    </div>
                </div>
            </footer >
        </div >
    );
};

const FeatureCard = ({ icon, title, description, badge }: { icon: React.ReactNode, title: string, description: string, badge?: string }) => (
    <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        {badge && (
            <div className="absolute top-0 right-0 p-4">
                <Badge variant="secondary" className="text-xs">{badge}</Badge>
            </div>
        )}
        <div className="mb-4 p-3 bg-secondary/50 w-fit rounded-xl">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const PricingCard = ({
    name,
    price,
    description,
    features,
    buttonText,
    variant = "default",
    isPopular = false,
    onSubscribe,
    disabled = false
}: {
    name: string,
    price: string,
    description: string,
    features: string[],
    buttonText: string,
    variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link",
    isPopular?: boolean,
    onSubscribe: () => void,
    disabled?: boolean
}) => (
    <div className={`flex flex-col p-6 rounded-2xl bg-card border shadow-sm transition-all hover:shadow-lg relative ${isPopular ? 'border-primary ring-1 ring-primary scale-105' : ''} ${disabled ? 'opacity-75 grayscale-[0.5]' : ''}`}>
        {isPopular && (
            <div className="absolute top-0 right-0 -mr-2 -mt-2">
                <Badge className="px-3 py-1">Most Popular</Badge>
            </div>
        )}
        <div className="mb-5">
            <h3 className="text-2xl font-bold">{name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
        </div>
        <div className="mb-6">
            <span className="text-4xl font-bold">{price}</span>
            {price !== '$0' && !price.includes('/mo') && !price.includes('Coming') && <span className="text-muted-foreground">/month</span>}
        </div>
        <ul className="space-y-3 mb-8 flex-1">
            {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <Button className="w-full" variant={variant} size="lg" onClick={onSubscribe} disabled={disabled}>
            {buttonText}
        </Button>
    </div>
);

export default LandingPage;
