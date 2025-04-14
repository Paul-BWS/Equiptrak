const axios = require('axios');

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
async function updateShopifyVariantCost(variantId, costPrice) {
  console.log(`[SHOPIFY_COST_UPDATE] Attempting to update cost for Variant ID: ${variantId} to ${costPrice}`);
  if (!variantId) {
    console.error('[SHOPIFY_COST_UPDATE] Error: Variant ID is required to update cost.');
    throw new Error('Variant ID is required to update cost per item.');
  }

  try {
    // 1. Get the variant data to find its inventory_item_id
    console.log(`[SHOPIFY_COST_UPDATE] Fetching variant data for Variant ID: ${variantId}`);
    const variantResponse = await shopifyApi.get(`/variants/${variantId}.json`);
    const inventoryItemId = variantResponse.data.variant?.inventory_item_id;
    console.log(`[SHOPIFY_COST_UPDATE] Found Inventory Item ID: ${inventoryItemId}`);

    if (!inventoryItemId) {
      console.error(`[SHOPIFY_COST_UPDATE] Error: Could not find inventory_item_id for Variant ID: ${variantId}`);
      throw new Error(`Could not find inventory item ID for variant ${variantId}`);
    }

    // 2. Update the cost on the inventory item
    console.log(`[SHOPIFY_COST_UPDATE] Updating cost for Inventory Item ID: ${inventoryItemId}`);
    const inventoryUpdateResponse = await shopifyApi.put(`/inventory_items/${inventoryItemId}.json`, {
      inventory_item: {
        id: inventoryItemId,
        cost: costPrice.toString() // Update the 'cost' field
      }
    });
    console.log('[SHOPIFY_COST_UPDATE] Inventory item cost update successful.');
    return inventoryUpdateResponse.data.inventory_item;

  } catch (error) {
    console.error(`[SHOPIFY_COST_UPDATE] Error updating Shopify variant cost for Variant ID ${variantId}:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error; // Re-throw the error to be caught by the calling route
  }
}

module.exports = {
  fetchShopifyProducts,
  updateShopifyProductPrice,
  updateShopifyVariantCost
}; 