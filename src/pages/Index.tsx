/**
 * ============================================
 * HOME PAGE (INDEX)
 * ============================================
 * 
 * Landing page for the application.
 * Shows hero section, features, how it works, and CTA.
 * 
 * To customize:
 * - Edit APP_NAME, APP_TAGLINE, APP_DESCRIPTION in src/config/appConfig.ts
 * - Modify sections below to change content
 */

import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, Users, Shield, MessageSquare, Star } from 'lucide-react';
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from '@/config/appConfig';

// ============================================
// MAIN INDEX COMPONENT
// ============================================

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* ================================
          HERO SECTION
          ================================
          Main landing section with headline and CTAs
      */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            {/* Main Headline - uses APP_TAGLINE from config */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Your Perfect <span className="text-primary">Student Home</span>
            </h1>
            
            {/* Subheadline - uses APP_DESCRIPTION from config */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              {APP_DESCRIPTION} Or find compatible roommates to share your journey.
            </p>
            
            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/listings">
                  <Search className="mr-2 h-5 w-5" />
                  Find Housing
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/roommates">
                  <Users className="mr-2 h-5 w-5" />
                  Find Roommates
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================================
          FEATURES SECTION
          ================================
          Highlights key features of the platform
      */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose {APP_NAME}?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make finding student accommodation simple, safe, and stress-free.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Verified Listings */}
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Verified Listings</CardTitle>
                <CardDescription>
                  All landlords and properties are verified by our admin team for your safety.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 2: Direct Messaging */}
            <Card>
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Direct Messaging</CardTitle>
                <CardDescription>
                  Chat directly with landlords or potential roommates through our secure platform.
                </CardDescription>
              </CardHeader>
            </Card>
            
            {/* Feature 3: Student-Focused */}
            <Card>
              <CardHeader>
                <Star className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Student-Focused</CardTitle>
                <CardDescription>
                  Designed specifically for students with university-friendly search filters.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ================================
          HOW IT WORKS SECTION
          ================================
          Step-by-step guide for new users
      */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in just a few simple steps.
            </p>
          </div>
          
          {/* Steps Grid */}
          <div className="grid md:grid-cols-4 gap-8">
            {/* Step definitions - edit these to change the process steps */}
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up as a student or landlord' },
              { step: '2', title: 'Get Verified', desc: 'Our team reviews your application' },
              { step: '3', title: 'Browse or List', desc: 'Find housing or post your property' },
              { step: '4', title: 'Connect', desc: 'Message and finalize your accommodation' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                {/* Step Number Circle */}
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================
          CTA SECTION
          ================================
          Final call-to-action to encourage sign-ups
      */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Find Your New Home?
              </h2>
              <p className="mb-6 opacity-90">
                Join thousands of students who found their perfect accommodation through {APP_NAME}.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth?tab=signup">
                  Get Started Today
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
