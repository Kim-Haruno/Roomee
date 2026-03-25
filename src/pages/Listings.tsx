import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MultiImageUpload } from '@/components/uploads/MultiImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, MapPin, Bed, Bath, DollarSign, Calendar, Plus, Loader2, Home } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  status: string;
}

const amenityOptions = [
  'WiFi', 'Parking', 'Laundry', 'Air Conditioning', 'Heating', 'Furnished',
  'Gym', 'Pool', 'Balcony', 'Garden', 'Security', 'Elevator', 'Dishwasher',
  'Pet Friendly', 'Study Room', 'Common Area',
];

const Listings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchCity, setSearchCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    property_type: 'apartment',
    amenities: [] as string[],
    images: [] as string[],
    available_from: '',
    max_occupants: '1',
    current_occupants: '0',
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setUserRole(profile?.role || null);
      }

      await fetchListings();
    };
    init();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (searchCity) {
        query = query.ilike('city', `%${searchCity}%`);
      }
      if (minPrice) {
        query = query.gte('price', parseInt(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseInt(maxPrice));
      }
      if (bedrooms) {
        query = query.eq('bedrooms', parseInt(bedrooms));
      }
      if (propertyType) {
        query = query.eq('property_type', propertyType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth');
      return;
    }

    if (formData.images.length < 5) {
      toast({
        title: 'Error',
        description: 'Please upload at least 5 images',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.from('listings').insert({
        landlord_id: user.id,
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        property_type: formData.property_type,
        amenities: formData.amenities,
        images: formData.images,
        available_from: formData.available_from,
        max_occupants: parseInt(formData.max_occupants),
        current_occupants: parseInt(formData.current_occupants),
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Listing submitted for approval',
      });
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        address: '',
        city: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        property_type: 'apartment',
        amenities: [],
        images: [],
        available_from: '',
        max_occupants: '1',
        current_occupants: '0',
      });
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create listing',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Home className="h-8 w-8 text-primary" />
              Find Accommodation
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse verified student-friendly properties
            </p>
          </div>
          {userRole === 'landlord' && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          )}
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city..."
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Min Price</Label>
                  <Input
                    type="number"
                    placeholder="R0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price</Label>
                  <Input
                    type="number"
                    placeholder="R50 000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No listings found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new properties.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  {listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Home className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 capitalize">
                    {listing.property_type}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {listing.bedrooms} bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {listing.bathrooms} bath
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-primary">
                      R{listing.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </span>
                    <Button size="sm" onClick={() => navigate(`/listings/${listing.id}`)}>View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Create Listing Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Listing</DialogTitle>
            <DialogDescription>
              Create a new property listing. Minimum 5 images required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-6">
            {/* Images */}
            <div className="space-y-2">
              <Label>Property Images (minimum 5)</Label>
              <MultiImageUpload
                images={formData.images}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                maxImages={15}
                minImages={5}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Cozy 2BR Apartment Near Campus"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your property..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={formData.city}
                  onValueChange={(v) => setFormData({ ...formData, city: v })}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Gauteng */}
                    <SelectItem value="Johannesburg">Gauteng — Johannesburg</SelectItem>
                    <SelectItem value="Pretoria">Gauteng — Pretoria</SelectItem>

                    {/* Western Cape */}
                    <SelectItem value="Cape Town">Western Cape — Cape Town</SelectItem>
                    <SelectItem value="Stellenbosch">Western Cape — Stellenbosch</SelectItem>

                    {/* KwaZulu-Natal */}
                    <SelectItem value="Durban">KwaZulu-Natal — Durban</SelectItem>
                    <SelectItem value="Pietermaritzburg">KwaZulu-Natal — Pietermaritzburg</SelectItem>

                    {/* Eastern Cape */}
                    <SelectItem value="Gqeberha">Eastern Cape — Gqeberha</SelectItem>
                    <SelectItem value="East London">Eastern Cape — East London</SelectItem>

                    {/* Free State */}
                    <SelectItem value="Bloemfontein">Free State — Bloemfontein</SelectItem>
                    <SelectItem value="Welkom">Free State — Welkom</SelectItem>

                    {/* Limpopo */}
                    <SelectItem value="Polokwane">Limpopo — Polokwane</SelectItem>
                    <SelectItem value="Thohoyandou">Limpopo — Thohoyandou</SelectItem>

                    {/* North West */}
                    <SelectItem value="Potchefstroom">North West — Potchefstroom</SelectItem>
                    <SelectItem value="Rustenburg">North West — Rustenburg</SelectItem>

                    {/* Mpumalanga */}
                    <SelectItem value="Mbombela">Mpumalanga — Mbombela</SelectItem>
                    <SelectItem value="Emalahleni">Mpumalanga — Emalahleni</SelectItem>

                    {/* Northern Cape */}
                    <SelectItem value="Kimberley">Northern Cape — Kimberley</SelectItem>
                    <SelectItem value="Upington">Northern Cape — Upington</SelectItem>

                    {/* Other */}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Monthly Rent (R)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="5000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(v) => setFormData({ ...formData, property_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  placeholder="2"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available_from">Available From</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={formData.available_from}
                  onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_occupants">Maximum Occupants</Label>
                <Input
                  id="max_occupants"
                  type="number"
                  min="1"
                  value={formData.max_occupants}
                  onChange={(e) => setFormData({ ...formData, max_occupants: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_occupants">Current Occupants</Label>
                <Input
                  id="current_occupants"
                  type="number"
                  min="0"
                  value={formData.current_occupants}
                  onChange={(e) => setFormData({ ...formData, current_occupants: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit for Approval
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Listings;
