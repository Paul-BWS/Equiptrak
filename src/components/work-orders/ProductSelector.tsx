import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingCart, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

interface Product {
  id: string;
  shopify_product_id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  trade_price: number | null;
  image_url: string;
  category: string;
  supplier: string;
  inventory_quantity: number;
  adjustedPrice?: number;
}

interface ProductSelectorProps {
  onSelectProducts: (products: Product[]) => void;
  onCancel: () => void;
}

export default function ProductSelector({ onSelectProducts, onCancel }: ProductSelectorProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false
  });
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Use a more robust function to fetch products with pagination
  const fetchProducts = useCallback(async (offset = 0, category = '', search = '') => {
    try {
      setLoadingMore(offset > 0);
      if (offset === 0) setLoading(true);
      
      console.log(`Fetching products: offset=${offset}, category=${category}, search=${search}`);
      
      // Get auth token from user context or localStorage
      const token = user?.token || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token is missing');
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('offset', offset.toString());
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      // Use axios instead of fetch for better error handling
      const response = await axios.get(`/api/products/selector?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.data || !Array.isArray(response.data.products)) {
        throw new Error('Invalid data format received from server');
      }
      
      // Process the received data
      const productsWithTrade = response.data.products.map((product: any) => ({
        ...product,
        // If trade_price isn't available, calculate it as 80% of the price
        trade_price: product.trade_price || (product.price * 0.8)
      }));
      
      // Update state based on whether we're loading more (append) or initial load (replace)
      if (offset > 0) {
        setProducts(prev => [...prev, ...productsWithTrade]);
        setFilteredProducts(prev => [...prev, ...productsWithTrade]);
      } else {
        setProducts(productsWithTrade);
        setFilteredProducts(productsWithTrade);
      }
      
      // Update pagination info
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      
      // Extract unique categories and suppliers for filtering (only on initial load)
      if (offset === 0) {
        // Get all unique categories from products
        const allProducts = offset > 0 ? [...products, ...productsWithTrade] : productsWithTrade;
        const uniqueCategories = Array.from(
          new Set(allProducts.map((p: Product) => p.category).filter(Boolean))
        );
        const uniqueSuppliers = Array.from(
          new Set(allProducts.map((p: Product) => p.supplier).filter(Boolean))
        );
        
        setCategories(uniqueCategories as string[]);
        setSuppliers(uniqueSuppliers as string[]);
      }
      
      // Reset error state if successful
      setError(null);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      
      // Provide detailed error message
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(errorMessage);
      
      // Log additional info for debugging
      if (err.response) {
        console.error('Server response:', err.response.data);
        console.error('Status:', err.response.status);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user, products]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts(0, selectedCategory, searchTerm);
  }, []);
  
  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    // If "all" is selected, set empty string for API call
    const categoryValue = value === 'all' ? '' : value;
    setSelectedCategory(value);
    // Reset and fetch with new category
    setProducts([]);
    setFilteredProducts([]);
    fetchProducts(0, categoryValue, searchTerm);
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset and fetch with search term
    setProducts([]);
    setFilteredProducts([]);
    fetchProducts(0, selectedCategory, searchTerm);
  };
  
  // Load more products when scrolling to bottom
  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchProducts(pagination.offset + pagination.limit, selectedCategory, searchTerm);
    }
  };
  
  const handleProductSelect = (product: Product) => {
    // Use the adjusted price if it exists, otherwise use the original price
    const finalProduct = {
      ...product,
      price: product.adjustedPrice || product.price
    };
    onSelectProducts([finalProduct]);
  };
  
  const handlePriceAdjustment = (product: Product, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    
    setFilteredProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        return {
          ...p,
          adjustedPrice: newPrice
        };
      }
      return p;
    }));
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Render loading state
  if (loading && !loadingMore) {
    return (
      <div className="p-4">
        <div className="flex mb-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full ml-4" />
        </div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center p-4 border-b">
            <Skeleton className="h-16 w-16 rounded" />
            <div className="ml-4 flex-grow">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 ml-4" />
            <Skeleton className="h-6 w-20 ml-4" />
          </div>
        ))}
      </div>
    );
  }
  
  // Render error state with more details
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold">Error loading products</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => window.location.reload()} variant="outline">Reload Page</Button>
          <Button onClick={() => fetchProducts(0, selectedCategory, searchTerm)}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, SKU, or description..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="bg-black text-white py-2 px-4 grid grid-cols-5 font-semibold">
        <div>PHOTO</div>
        <div>SKU</div>
        <div>DESCRIPTION</div>
        <div className="text-right">TRADE PRICE</div>
        <div className="text-right">PRICE</div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No products found matching your criteria</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto" onScroll={(e) => {
          const element = e.currentTarget;
          if (element.scrollHeight - element.scrollTop <= element.clientHeight + 200) {
            handleLoadMore();
          }
        }}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="grid grid-cols-5 items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleProductSelect(product)}
            >
              <div className="flex items-center">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-24 w-24 object-contain"
                  />
                ) : (
                  <div className="h-24 w-24 bg-gray-200 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>{product.sku || 'N/A'}</div>
              <div className="font-medium">
                <div>{product.name}</div>
                {product.supplier && (
                  <div className="text-xs text-gray-500">{product.supplier}</div>
                )}
              </div>
              <div className="text-right">{formatCurrency(product.trade_price || 0)}</div>
              <div className="text-right font-bold">{formatCurrency(product.price || 0)}</div>
            </div>
          ))}
          
          {loadingMore && (
            <div className="p-4 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-500">Loading more products...</p>
            </div>
          )}
          
          {pagination.hasMore && !loadingMore && (
            <div className="p-4 text-center">
              <Button variant="outline" onClick={handleLoadMore}>
                Load More ({pagination.total - (pagination.offset + filteredProducts.length)} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
} 