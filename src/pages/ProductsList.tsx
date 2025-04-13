import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  ShoppingCart, 
  Tag, 
  ArrowRight,
  PlusSquare,
  RefreshCw,
  CheckCircle,
  XCircle,
  Cloud,
  Download
} from 'lucide-react';
import { ProductAddModal } from '@/components/products/ProductAddModal';

interface Product {
  id: string;
  shopify_product_id: string;
  name: string;
  handle: string;
  description: string;
  price: number;
  sku: string;
  inventory_quantity: number;
  image_url: string;
  taxable: boolean;
  category: string;
  supplier: string;
  updated_at: string;
  last_synced_at: string;
}

export default function ProductsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingCostPrices, setSyncingCostPrices] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchProducts();
  }, [user, pagination.offset, pagination.limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=${pagination.limit}&offset=${pagination.offset}&search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.status}`);
      }

      const result = await response.json();
      setProducts(result.data || []);
      setPagination(result.pagination || {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setRefreshing(true);
      // Reset pagination when refreshing
      const newPagination = { ...pagination, offset: 0 };
      setPagination(newPagination);
      
      // Fetch with the updated pagination
      const response = await fetch(`/api/products?limit=${newPagination.limit}&offset=${newPagination.offset}&search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error refreshing products: ${response.status}`);
      }

      const result = await response.json();
      setProducts(result.data || []);
      setPagination(result.pagination || {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      });
      
      toast({
        title: "Products refreshed",
        description: "Product list has been updated from the database.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Refresh failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const syncWithShopify = async () => {
    try {
      setSyncing(true);
      
      // First sync products from Shopify to our database (including cost prices)
      const syncResponse = await fetch('/api/products/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!syncResponse.ok) {
        throw new Error(`Error syncing with Shopify: ${syncResponse.status}`);
      }

      const syncResult = await syncResponse.json();
      
      // Then also sync cost prices from our database back to Shopify
      const costPriceResponse = await fetch('/api/products/sync-cost-prices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!costPriceResponse.ok) {
        console.warn('Cost price sync had some issues, but product sync was successful');
      } else {
        const costPriceResult = await costPriceResponse.json();
        console.log('Cost price sync result:', costPriceResult);
      }
      
      toast({
        title: "Shopify sync completed",
        description: `${syncResult.message} Cost prices have also been synced.`,
      });
      
      // Refresh the product list after sync
      refreshProducts();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Shopify sync failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit
      });
    }
  };

  const handlePreviousPage = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit)
      });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Products</h1>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => fetchProducts()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Products</h1>
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={refreshProducts}
              disabled={refreshing}
              className="mr-2 hidden sm:flex"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="outline"
              onClick={syncWithShopify}
              disabled={syncing}
              className="mr-2 hidden sm:flex"
            >
              <Cloud className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync with Shopify'}
            </Button>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-white sm:bg-[#21c15b] hover:bg-gray-100 sm:hover:bg-[#21c15b]/90 text-[#21c15b] sm:text-white border border-[#21c15b]"
            >
              <PlusSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Product</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU, category or supplier..."
              className="pl-10 pr-20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1 h-8"
            >
              Search
            </Button>
          </div>
        </form>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Tag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-center text-muted-foreground mb-4">
                {searchTerm ? 
                  `No products match your search for "${searchTerm}"` : 
                  "You don't have any products yet."}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  fetchProducts();
                }}>
                  Clear Search
                </Button>
              )}
              {!searchTerm && (
                <Button 
                  onClick={syncWithShopify} 
                  disabled={syncing}
                  className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Sync Products from Shopify
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="w-full cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="w-full sm:w-[150px] h-[150px] overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {product.inventory_quantity > 0 && (
                          <Badge variant="default">
                            <span className="flex items-center text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" /> In Stock
                            </span>
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <div>SKU: {product.sku || 'N/A'}</div>
                        <div className="font-medium">
                          £{typeof product.price === 'number' 
                            ? product.price.toFixed(2) 
                            : parseFloat(product.price || 0).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          {product.category || product.supplier ? (
                            <span>
                              {product.category && <span className="mr-2">{product.category}</span>}
                              {product.supplier && <span>{product.supplier}</span>}
                            </span>
                          ) : (
                            <span>No category or supplier</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {(pagination.total > pagination.limit) && (
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {pagination.offset + 1}-{Math.min(pagination.offset + products.length, pagination.total)} of {pagination.total} products
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={pagination.offset === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!pagination.hasMore}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Product Modal */}
      <ProductAddModal 
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={refreshProducts}
      />
    </div>
  );
} 