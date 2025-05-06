import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  Save,
  ExternalLink,
  ShoppingCart, 
  Tag, 
  PackageCheck,
  Ruler,
  Scale,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Truck,
  RefreshCw,
  CloudCog
} from 'lucide-react';

// Interface for the product data structure
interface ShopifyProduct {
  id: string;
  shopify_product_id: string;
  name: string;
  handle: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  taxable: boolean;
  inventory_quantity: number;
  weight: number;
  weight_unit: string;
  image_url: string;
  category: string;
  supplier: string;
  ean: string;
  commodity_code: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cost_price: number;
  trade_price: number;
  trade_price_discount: {
    ten: number;
    twenty: number;
    thirty: number;
  };
  list_price: number;
  shopify_variant_id?: string;
}

// Function to safely format price
const formatPrice = (price: any): string => {
  if (typeof price === 'number') {
    return price.toFixed(2);
  }
  return parseFloat(price || 0).toFixed(2);
};

export default function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [listPrice, setListPrice] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCost, setIsSavingCost] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncingSingle, setIsSyncingSingle] = useState(false);
  const { toast } = useToast();

  // Memoize fetch function to avoid re-creating it on every render
  const fetchProductDetails = useCallback(async () => {
    if (!productId) return;
    console.log(`Fetching product details from DB for ID: ${productId}`);
    // Mark as loading ONLY if not already syncing/refreshing something else
    // to avoid multiple spinners
    if (!isSyncingSingle && !isRefreshing) {
        setLoading(true); 
    }
    setError(null);
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate trade price discounts if not already available
      if (data.trade_price && !data.trade_price_discount) {
        data.trade_price_discount = {
          ten: data.trade_price * 0.9,
          twenty: data.trade_price * 0.8,
          thirty: data.trade_price * 0.7
        };
      }
      
      // Create dimensions object if individual dimensions are provided
      if (!data.dimensions && (data.length || data.width || data.height)) {
        data.dimensions = {
          length: data.length || 0,
          width: data.width || 0,
          height: data.height || 0
        };
      }
      
      setProduct(data);
      setPrice(data.price || 0);
      setCostPrice(data.cost_price || 0);
      setListPrice(data.list_price || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching product details:', err);
    } finally {
      // Only set loading false if nothing else is running
      if (!isSyncingSingle && !isRefreshing) {
          setLoading(false);
      }
    }
  }, [productId, user, isSyncingSingle, isRefreshing]);

  // Fetch product details when component mounts or fetch function changes
  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  // Handle price updates
  const handlePriceUpdate = async () => {
    if (!product) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/products/${productId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ price })
      });

      if (!response.ok) {
        throw new Error(`Error updating price: ${response.status}`);
      }
      
      // Update the product data with the new price
      setProduct(prev => prev ? {...prev, price} : null);

      toast({
        title: "Price updated",
        description: `Price for ${product.name} updated to £${formatPrice(price)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price');
      toast({
        variant: "destructive",
        title: "Failed to update price",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cost price updates
  const handleCostPriceUpdate = async () => {
    if (!product) return;

    try {
      setIsSavingCost(true);
      console.log("Sending cost price update request with value:", costPrice);
      
      const response = await fetch(`/api/products/${productId}/cost_price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cost_price: costPrice })
      });

      if (!response.ok) {
        throw new Error(`Error updating cost price: ${response.status}`);
      }
      
      // Get the response data to ensure we have the correct price
      const updatedProduct = await response.json();
      console.log("Received updated product:", updatedProduct);
      
      // Update the product data with the new cost price and use the value from the response
      setProduct(prev => prev ? {...prev, cost_price: updatedProduct.cost_price || costPrice} : null);

      toast({
        title: "Cost price updated",
        description: `Cost price for ${product.name} updated to £${formatPrice(updatedProduct.cost_price || costPrice)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cost price');
      toast({
        variant: "destructive",
        title: "Failed to update cost price",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setIsSavingCost(false);
    }
  };

  // Handle list price updates
  const handleListPriceUpdate = async () => {
    if (!product) return;

    try {
      setIsSavingList(true);
      const response = await fetch(`/api/products/${productId}/list_price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify({ list_price: listPrice })
      });

      if (!response.ok) {
        throw new Error(`Error updating list price: ${response.status}`);
      }
      
      // Update the product data with the new list price
      setProduct(prev => prev ? {...prev, list_price: listPrice} : null);

      toast({
        title: "List price updated",
        description: `List price for ${product.name} updated to £${formatPrice(listPrice)}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list price');
      toast({
        variant: "destructive",
        title: "Failed to update list price",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setIsSavingList(false);
    }
  };

  // --- NEW: Handle Single Product Sync from Shopify ---
  const handleSingleSync = async () => {
    if (!product || !product.shopify_variant_id) {
      toast({ variant: "destructive", title: "Cannot Sync", description: "Product is not linked to Shopify." });
      return;
    }
    console.log(`Syncing single product from Shopify for local ID: ${productId}, Shopify Variant ID: ${product.shopify_variant_id}`);
    setIsSyncingSingle(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/${productId}/sync-single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        // No body needed, ID is in URL
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `Error syncing product: ${response.status}`);
      }

      const updatedProductData = await response.json();
      console.log("Single sync successful, received updated data:", updatedProductData);
      
      // Update state with the fresh data from the sync response
      setProduct(updatedProductData);
      setPrice(updatedProductData.price || 0);
      setCostPrice(updatedProductData.cost_price || 0);
      setListPrice(updatedProductData.list_price || 0);

      toast({
        title: "Product Synced",
        description: `${updatedProductData.name} updated from Shopify.`,
      });

    } catch (err) {
      console.error('Error syncing single product:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync product');
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setIsSyncingSingle(false);
    }
  };

  // --- Refresh from DB Function (Keep or Modify) ---
  const refreshFromDb = async () => {
    console.log("Refreshing product data from DB for ID:", productId);
    setIsRefreshing(true);
    await fetchProductDetails(); // Just re-run the local fetch
    setIsRefreshing(false);
    toast({
      title: "Product data refreshed",
      description: "Product information reloaded from the database.",
    });
  };

  // Show loading state
  if (loading && !product) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[300px]" />
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[100px]" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !product) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Product</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no product found
  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The product you're looking for doesn't exist or couldn't be loaded.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/products')}>View All Products</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
          <div className="flex items-center space-x-2"> 
            <Button 
              size="sm" 
              variant="outline"
              disabled={isRefreshing || isSyncingSingle}
              onClick={refreshFromDb}
              className=""
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh from DB
            </Button>
            
            {product.shopify_variant_id && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleSingleSync} 
                disabled={isSyncingSingle || isRefreshing}
                aria-label="Sync from Shopify"
              >
                {isSyncingSingle ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 
                ) : (
                    <CloudCog className="mr-2 h-4 w-4" />
                )}
                Sync from Shopify
              </Button>
            )}
            
            {product.shopify_product_id && (
              <Button 
                size="sm" 
                className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
                onClick={() => window.open(`https://admin.shopify.com/products/${product.shopify_product_id}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Edit in Shopify
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-6">{product.name}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" /> Product Image
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="max-h-[300px] object-contain rounded-md" 
                />
              ) : (
                <div className="h-[300px] w-full flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Middle column - Core product info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="mr-2 h-5 w-5" /> Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={product.sku || 'N/A'} readOnly />
                </div>
                <div>
                  <Label htmlFor="shopifyId">Shopify ID</Label>
                  <Input id="shopifyId" value={product.shopify_product_id || 'N/A'} readOnly />
                </div>
                <div>
                  <Label htmlFor="ean">EAN</Label>
                  <Input id="ean" value={product.ean || 'N/A'} readOnly />
                </div>
                <div>
                  <Label htmlFor="commodityCode">Commodity Code</Label>
                  <Input id="commodityCode" value={product.commodity_code || 'N/A'} readOnly />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={product.category || 'N/A'} readOnly />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input id="supplier" value={product.supplier || 'N/A'} readOnly />
                </div>
                <div className="col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxable">Taxable</Label>
                    <Switch id="taxable" checked={product.taxable} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right column - Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" /> Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <div className="flex">
                    <Input 
                      id="costPrice" 
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value))}
                      className="rounded-r-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button 
                      onClick={handleCostPriceUpdate} 
                      disabled={isSavingCost || costPrice === product.cost_price}
                      className="rounded-l-none"
                    >
                      {isSavingCost ? 'Saving...' : 'Update'}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Current cost price: £{formatPrice(product.cost_price || 0)}</p>
                </div>
                <div>
                  <Label htmlFor="tradePrice">Trade Price</Label>
                  <Input 
                    id="tradePrice" 
                    value={product.trade_price ? `£${formatPrice(product.trade_price)}` : 'N/A'} 
                    readOnly 
                  />
                </div>
                <div>
                  <Label htmlFor="listPrice">List Price</Label>
                  <Input 
                    id="listPrice" 
                    value={product.list_price ? `£${formatPrice(product.list_price)}` : 'N/A'} 
                    readOnly 
                  />
                </div>
                <div>
                  <Label htmlFor="shopifyPrice">Shopify Price</Label>
                  <div className="flex">
                    <Input 
                      id="shopifyPrice" 
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      className="rounded-r-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button 
                      onClick={handlePriceUpdate} 
                      disabled={isSaving || price === product.price}
                      className="rounded-l-none"
                    >
                      {isSaving ? 'Saving...' : 'Update'}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">Trade Price Discounts</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Badge variant="outline" className="w-full justify-center">
                      10% Off
                    </Badge>
                    <p className="text-center mt-1 font-medium">
                      {product.trade_price_discount?.ten ? 
                        `£${formatPrice(product.trade_price_discount.ten)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="w-full justify-center">
                      20% Off
                    </Badge>
                    <p className="text-center mt-1 font-medium">
                      {product.trade_price_discount?.twenty ? 
                        `£${formatPrice(product.trade_price_discount.twenty)}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Badge variant="outline" className="w-full justify-center">
                      30% Off
                    </Badge>
                    <p className="text-center mt-1 font-medium">
                      {product.trade_price_discount?.thirty ? 
                        `£${formatPrice(product.trade_price_discount.thirty)}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PackageCheck className="mr-2 h-5 w-5" /> Physical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weight" className="mb-2 block">Weight</Label>
                <div className="flex items-center">
                  <Scale className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {product.weight ? `${product.weight} ${product.weight_unit || 'kg'}` : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Dimensions</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Length</p>
                    <p>{product.dimensions?.length ? `${product.dimensions.length} cm` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Width</p>
                    <p>{product.dimensions?.width ? `${product.dimensions.width} cm` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p>{product.dimensions?.height ? `${product.dimensions.height} cm` : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" /> Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label>Stock Level</Label>
                <Badge variant={product.inventory_quantity > 0 ? "default" : "destructive"}>
                  {product.inventory_quantity > 0 ? (
                    <span className="flex items-center">
                      <CheckCircle className="mr-1 h-3 w-3" /> In Stock: {product.inventory_quantity}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {product.inventory_quantity} units
                    </span>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              {product.description ? (
                <div 
                  key={`description-${product.id}-${Date.now()}`} 
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              ) : (
                <p className="text-muted-foreground">No description available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 