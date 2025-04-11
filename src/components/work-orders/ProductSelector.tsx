import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ShoppingCart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

interface ProductSelectorProps {
  onSelectProducts: (products: Product[]) => void;
  onCancel: () => void;
}

export default function ProductSelector({ onSelectProducts, onCancel }: ProductSelectorProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch from our real API
        const response = await fetch('/api/products/selector', {
          headers: {
            'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching products: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the received data
        const productsWithTrade = data.products.map((product: any) => ({
          ...product,
          // If trade_price isn't available, calculate it as 80% of the price
          trade_price: product.trade_price || (product.price * 0.8)
        }));
        
        setProducts(productsWithTrade);
        setFilteredProducts(productsWithTrade);
        
        // Extract unique categories and suppliers for filtering
        const uniqueCategories = Array.from(
          new Set(productsWithTrade.map((p: Product) => p.category).filter(Boolean))
        );
        const uniqueSuppliers = Array.from(
          new Set(productsWithTrade.map((p: Product) => p.supplier).filter(Boolean))
        );
        
        setCategories(uniqueCategories as string[]);
        setSuppliers(uniqueSuppliers as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [user]);
  
  // Handle search and category filtering
  useEffect(() => {
    let filtered = products;
    
    // Apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Apply search term filter
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.sku?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.description?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);
  
  const handleProductSelect = (product: Product) => {
    if (selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the useEffect above
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleAddSelected = () => {
    onSelectProducts(selectedProducts);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  if (loading) {
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
  
  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-2">Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="p-4">
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
            <SelectItem value="">All Categories</SelectItem>
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
          <p>No products found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={`grid grid-cols-5 items-center p-4 border-b hover:bg-gray-50 cursor-pointer ${
                selectedProducts.some(p => p.id === product.id) ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleProductSelect(product)}
            >
              <div className="flex items-center">
                <Checkbox 
                  checked={selectedProducts.some(p => p.id === product.id)}
                  onCheckedChange={() => handleProductSelect(product)}
                  className="mr-2"
                />
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="h-16 w-16 object-contain"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-gray-400" />
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
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <div>
          {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddSelected}
            disabled={selectedProducts.length === 0}
          >
            Add Selected Products
          </Button>
        </div>
      </div>
    </div>
  );
} 