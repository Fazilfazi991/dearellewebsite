// Launch adapter: demo products must never emit purchasable Product/Offer data.
export type VerifiedProduct = {
  demo: false;
  name: string;
  description: string;
  image: string;
  sku: string;
  price: number;
  inStock: boolean;
  url: string;
};
export function productStructuredData(product: VerifiedProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}`,
      url: product.url,
    },
  };
}
