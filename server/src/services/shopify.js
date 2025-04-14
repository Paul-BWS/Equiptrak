const axios = require('axios');
require('dotenv').config({ path: '../../.env' });

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01'; // Using latest stable version

const shopifyApi = axios.create({
  baseURL: `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}`,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});

// Fetch all products from Shopify
async function fetchShopifyProducts() {
  try {
    const response = await shopifyApi.get('/products.json');
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products from Shopify:', error);
    throw error;
  }
}

// Update a product's price in Shopify
async function updateShopifyProductPrice(productId, price, variantId = null) {
  try {
    // If we have a specific variant ID, update that variant
    if (variantId) {
      const response = await shopifyApi.put(`/variants/${variantId}.json`, {
        variant: {
          id: variantId,
          price: price.toString()
        }
      });
      return response.data.variant;
    }
    
    // Otherwise, get the product's first variant and update its price
    const productResponse = await shopifyApi.get(`/products/${productId}.json`);
    const firstVariant = productResponse.data.product.variants[0];
    
    const response = await shopifyApi.put(`/variants/${firstVariant.id}.json`, {
      variant: {
        id: firstVariant.id,
        price: price.toString()
      }
    });
    return response.data.variant;
  } catch (error) {
    console.error('Error updating product price in Shopify:', error);
    throw error;
  }
}

// Update cost price as a metafield
async function updateShopifyProductCostPrice(productId, costPrice) {
  try {
    const response = await shopifyApi.post(`/products/${productId}/metafields.json`, {
      metafield: {
        namespace: 'equiptrak',
        key: 'cost_price',
        value: costPrice.toString(),
        type: 'number_decimal'
      }
    });
    return response.data.metafield;
  } catch (error) {
    console.error('Error updating product cost price in Shopify:', error);
    throw error;
  }
}

module.exports = {
  fetchShopifyProducts,
  updateShopifyProductPrice,
  updateShopifyProductCostPrice
}; 