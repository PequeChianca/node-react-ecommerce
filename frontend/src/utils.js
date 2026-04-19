/**
 * Normalizes a product image value to a browser-accessible URL.
 * Handles both legacy string images and the new { url } object shape.
 * Rewrites the internal Docker hostname to the nginx /storage/ proxy path.
 */
export const getImageUrl = (image) => {
  const url = image && image.url ? image.url : (image || '');
  const apiGatewayUrl =  process.env.API_GATEWAY_URL || 'http://127.0.0.1:5000';
  return url.replace('http://azurite-storage-emulator:10000', `${apiGatewayUrl}/storage`);
};
