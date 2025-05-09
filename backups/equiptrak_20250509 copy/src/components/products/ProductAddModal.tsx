import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface ProductAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ProductAddModal({ open, onOpenChange, onSuccess }: ProductAddModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    description: '',
    inventory_quantity: '0',
    category: '',
    supplier: '',
    cost_price: '',
    trade_price: '',
    shopify_product_id: `manual-${Date.now()}`
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert numeric fields to numbers
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        inventory_quantity: parseInt(formData.inventory_quantity) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        trade_price: parseFloat(formData.trade_price) || 0
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error(`Error adding product: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Product added successfully",
        description: `${formData.name} has been added to your products.`
      });
      
      // Reset form and close modal
      setFormData({
        name: '',
        sku: '',
        price: '',
        description: '',
        inventory_quantity: '0',
        category: '',
        supplier: '',
        cost_price: '',
        trade_price: '',
        shopify_product_id: `manual-${Date.now()}`
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to add product",
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Product SKU"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (£) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Product category"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="Supplier name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inventory_quantity">Stock</Label>
              <Input
                id="inventory_quantity"
                name="inventory_quantity"
                type="number"
                min="0"
                value={formData.inventory_quantity}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost (£)</Label>
              <Input
                id="cost_price"
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trade_price">Trade (£)</Label>
              <Input
                id="trade_price"
                name="trade_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.trade_price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#21c15b] hover:bg-[#21c15b]/90 text-white border border-[#21c15b]"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 