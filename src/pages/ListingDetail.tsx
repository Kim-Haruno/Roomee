import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, Bed, Bath, Calendar, ArrowLeft, Home, 
  Check, Phone, Mail, User
} from 'lucide-react';
import { format } from 'date-fns';

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  property_type: string;
  amenities: string[];
  images: string[];
  available_from: string;
  landlord_id: string;
  max_occupants: number;
  current_occupants: number;
}

interface Landlord {
  full_name: string;
  email: string;
  phone: string | null;
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('status', 'approved')
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast({
            title: 'Not Found',
            description: 'This listing does not exist or has been removed.',
            variant: 'destructive',
          });
          navigate('/listings');
          return;
        }

        setListing(data);

        // Fetch landlord info
        const { data: landlordData } = await supabase
          .from('profiles')
          .select('full_name, email, phone')
          .eq('user_id', data.landlord_id)
          .maybeSingle();

        setLandlord(landlordData);
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'Error',
          description: 'Failed to load listing details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-16">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-96 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/listings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                {listing.images.length > 0 ? (
                  <img
                    src={listing.images[selectedImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Home className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <Badge className="absolute top-4 left-4 capitalize">
                  {listing.property_type}
                </Badge>
              </div>
              {listing.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${listing.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Details */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-1 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.address}, {listing.city}</span>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="h-4 w-4 text-primary" />
                    <span>{listing.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Bath className="h-4 w-4 text-primary" />
                    <span>{listing.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Available {format(new Date(listing.available_from), 'MMM d, yyyy')}</span>
                  </div>
                </div>

                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground whitespace-pre-line mb-6">
                  {listing.description}
                </p>

                {listing.amenities.length > 0 && (
                  <>
                    <h2 className="font-semibold mb-3">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {listing.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  R{listing.price.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Available from {format(new Date(listing.available_from), 'MMMM d, yyyy')}
                </p>
                <div className="mt-3 pt-3 border-t">
                  <p className={`text-sm font-medium ${listing.current_occupants >= listing.max_occupants ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {listing.current_occupants}/{listing.max_occupants} Occupants
                  </p>
                  {listing.current_occupants >= listing.max_occupants && (
                    <p className="text-xs text-destructive mt-1">Housing is full</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Landlord Contact */}
            {landlord && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Contact Landlord</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{landlord.full_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${landlord.email}`}
                        className="text-primary hover:underline"
                      >
                        {landlord.email}
                      </a>
                    </div>
                    {landlord.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={`tel:${landlord.phone}`}
                          className="text-primary hover:underline"
                        >
                          {landlord.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={() => navigate(`/listings/${id}/apply`)}
                    disabled={listing.current_occupants >= listing.max_occupants}
                  >
                    {listing.current_occupants >= listing.max_occupants ? 'Housing Full' : 'Apply for Housing'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;