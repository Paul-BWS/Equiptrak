const axios = require('axios');

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API_VERSION = '2024-01'; // Use a recent, stable API version

// --- GraphQL Endpoint Setup ---
const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

const shopifyGraphQlApi = axios.create({
  baseURL: SHOPIFY_GRAPHQL_URL,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
});

// --- REST API Setup (for functions that still use it) ---
const SHOPIFY_REST_URL = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}`;
const shopifyRestApi = axios.create({
  baseURL: SHOPIFY_REST_URL,
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  }
});


// --- NEW GraphQL Function to Fetch Products with Cost --- 
async function fetchShopifyProductsWithCost(limit = 15) { // Fetch only 15 products at a time to avoid throttling
  console.log(`[SHOPIFY_FETCH_GRAPHQL] Starting fetch for products with cost (limit: ${limit})`);
  let allProducts = [];
  let hasNextPage = true;
  let cursor = null;

  const query = `
    query getProducts($limit: Int!, $cursor: String) {
      products(first: $limit, after: $cursor) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            legacyResourceId
            title
            handle
            descriptionHtml
            onlineStoreUrl
            featuredImage {
              url
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  legacyResourceId
                  title
                  sku
                  price
                  compareAtPrice
                  taxable
                  inventoryQuantity
                  weight
                  weightUnit
                  inventoryItem {
                    id
                    legacyResourceId
                    inventoryLevels(first: 1) {
                      edges {
                        node {
                          # --- MODIFIED FOR DEBUGGING ---
                          # cost # <<< Temporarily commented out
                          location {
                            id
                            name 
                          }
                          # --- END MODIFIED PART ---
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    while (hasNextPage) {
      console.log(`[SHOPIFY_FETCH_GRAPHQL] Fetching page with cursor: ${cursor}`);
      const response = await shopifyGraphQlApi.post('', {
        query,
        variables: { limit, cursor },
      });

      if (response.data.errors) {
        console.error('[SHOPIFY_FETCH_GRAPHQL] GraphQL Errors:', JSON.stringify(response.data.errors, null, 2));
        throw new Error('Error fetching products from Shopify GraphQL API');
      }

      const productsData = response.data.data.products;
      const edges = productsData.edges || [];
      console.log(`[SHOPIFY_FETCH_GRAPHQL] Fetched ${edges.length} products on this page.`);
      
      // Process and add products from this page
      edges.forEach(edge => {
        allProducts.push(edge.node);
      });

      hasNextPage = productsData.pageInfo.hasNextPage;
      if (hasNextPage && edges.length > 0) {
        cursor = edges[edges.length - 1].cursor;
        console.log(`[SHOPIFY_FETCH_GRAPHQL] Next page cursor: ${cursor}`);
         // --- ADD DELAY --- 
        console.log('[SHOPIFY_FETCH_GRAPHQL] Pausing for 500ms before next page...');
        await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
      } else {
          cursor = null; // Reset cursor if no more pages or empty page
      }
       // Optional: Add a small delay to avoid hitting rate limits aggressively
      // await new Promise(resolve => setTimeout(resolve, 200)); // REMOVED - Replaced with delay above
    }

    console.log(`[SHOPIFY_FETCH_GRAPHQL] Finished fetching. Total products: ${allProducts.length}`);
    return allProducts; // Returns the raw node data from GraphQL

  } catch (error) {
    console.error('[SHOPIFY_FETCH_GRAPHQL] Error fetching products:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

// --- NEW Function to Fetch Single Variant Details (REST) ---
async function fetchSingleShopifyVariantDetails(shopifyVariantId) {
  console.log(`[SHOPIFY_FETCH_SINGLE] Fetching details for Variant ID: ${shopifyVariantId}`);
  if (!shopifyVariantId) {
    throw new Error('Shopify Variant ID is required.');
  }

  try {
    // 1. Fetch Variant Data (includes price, product_id, inventory_item_id)
    console.log(`[SHOPIFY_FETCH_SINGLE] Getting variant data...`);
    const variantResponse = await shopifyRestApi.get(`/variants/${shopifyVariantId}.json`);
    const variantData = variantResponse.data.variant;
    if (!variantData) throw new Error(`Variant ${shopifyVariantId} not found.`);
    console.log(`[SHOPIFY_FETCH_SINGLE] Variant data received.`);

    const shopifyProductId = variantData.product_id;
    const inventoryItemId = variantData.inventory_item_id;

    // 2. Fetch Product Data (includes title, handle, description, image)
    console.log(`[SHOPIFY_FETCH_SINGLE] Getting product data for Product ID: ${shopifyProductId}...`);
    const productResponse = await shopifyRestApi.get(`/products/${shopifyProductId}.json`);
    const productData = productResponse.data.product;
    if (!productData) throw new Error(`Product ${shopifyProductId} not found.`);
    console.log(`[SHOPIFY_FETCH_SINGLE] Product data received.`);

    // 3. Fetch Inventory Item Data (includes cost)
    let costPrice = null;
    if (inventoryItemId) {
      console.log(`[SHOPIFY_FETCH_SINGLE] Getting inventory item data for Item ID: ${inventoryItemId}...`);
      const inventoryResponse = await shopifyRestApi.get(`/inventory_items/${inventoryItemId}.json`);
      costPrice = inventoryResponse.data.inventory_item?.cost; // Cost is directly on the inventory item
      console.log(`[SHOPIFY_FETCH_SINGLE] Inventory data received. Cost: ${costPrice}`);
    } else {
      console.warn(`[SHOPIFY_FETCH_SINGLE] No inventory_item_id found for variant ${shopifyVariantId}. Cannot fetch cost.`);
    }

    // 4. Combine into a usable object
    const combinedDetails = {
      shopifyProductId: shopifyProductId.toString(), // Ensure string
      shopifyVariantId: shopifyVariantId.toString(), // Ensure string
      name: variantData.title || productData.title,
      handle: productData.handle,
      description: productData.body_html,
      price: variantData.price,
      compareAtPrice: variantData.compare_at_price,
      sku: variantData.sku,
      taxable: variantData.taxable,
      inventoryQuantity: variantData.inventory_quantity,
      imageUrl: productData.image?.src || variantData.image?.src,
      costPrice: costPrice, // The fetched cost
      weight: variantData.weight,
      weightUnit: variantData.weight_unit,
      // Add any other fields you need to sync
    };
    console.log(`[SHOPIFY_FETCH_SINGLE] Combined details generated.`);
    return combinedDetails;

  } catch (error) {
    console.error(`[SHOPIFY_FETCH_SINGLE] Error fetching details for Variant ${shopifyVariantId}:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    throw error;
  }
}

// --- Existing REST API Functions (Modified to use shopifyRestApi) ---

// Update a product's price in Shopify
async function updateShopifyProductPrice(productId, price, variantId = null) {
  console.log(`[SHOPIFY_PRICE_UPDATE] REST request for Product: ${productId}, Variant: ${variantId}, Price: ${price}`);
  try {
    if (variantId) {
      const response = await shopifyRestApi.put(`/variants/${variantId}.json`, { variant: { id: variantId, price: price.toString() } });
      return response.data.variant;
    }
    const productResponse = await shopifyRestApi.get(`/products/${productId}.json`);
    const firstVariant = productResponse.data.product.variants[0];
    const response = await shopifyRestApi.put(`/variants/${firstVariant.id}.json`, { variant: { id: firstVariant.id, price: price.toString() } });
    return response.data.variant;
  } catch (error) {
      console.error(`[SHOPIFY_PRICE_UPDATE] Error:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      throw error;
  }
}

// Update standard cost per item
async function updateShopifyVariantCost(variantId, costPrice) {
  console.log(`[SHOPIFY_COST_UPDATE] REST request for Variant: ${variantId}, Cost: ${costPrice}`);
   if (!variantId) {
      console.error('[SHOPIFY_COST_UPDATE] Error: Variant ID is required to update cost.');
      throw new Error('Variant ID is required to update cost per item.');
   }
   try {
       const variantResponse = await shopifyRestApi.get(`/variants/${variantId}.json`);
       const inventoryItemId = variantResponse.data.variant?.inventory_item_id;
       if (!inventoryItemId) {
           console.error(`[SHOPIFY_COST_UPDATE] Error: Could not find inventory_item_id for Variant ID: ${variantId}`);
           throw new Error(`Could not find inventory item ID for variant ${variantId}`);
       }
       const inventoryUpdateResponse = await shopifyRestApi.put(`/inventory_items/${inventoryItemId}.json`, { inventory_item: { id: inventoryItemId, cost: costPrice.toString() } });
       return inventoryUpdateResponse.data.inventory_item;
   } catch (error) {
       console.error(`[SHOPIFY_COST_UPDATE] Error:`, error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
       throw error;
   }
}

// --- Deprecated/Removed --- 
/*
// Fetch all products from Shopify (Old REST Version)
async function fetchShopifyProducts() { ... }
*/

module.exports = {
  // fetchShopifyProducts, // Maybe remove old one later
  fetchShopifyProductsWithCost, // Export the new GraphQL fetcher
  updateShopifyProductPrice,
  updateShopifyVariantCost,
  fetchSingleShopifyVariantDetails // Export the new function
}; 