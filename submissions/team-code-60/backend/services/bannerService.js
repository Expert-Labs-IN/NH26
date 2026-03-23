export const generateBannerUrls = async (productData) => {
  const name = productData.name || 'Product';
  const desc = (productData.description || '').slice(0, 80);
  const color = productData.color || '';
  const price = productData.price || '';

  const bannerStyles = [
    {
      label: 'Modern Ad Banner',
      theme: 'modern',
      gradient: ['#4F46E5', '#7C3AED', '#EC4899'],
      tagline: 'Discover the Difference',
    },
    {
      label: 'Social Media Ad',
      theme: 'social',
      gradient: ['#F59E0B', '#EF4444', '#EC4899'],
      tagline: 'Trending Now',
    },
    {
      label: 'Premium Showcase',
      theme: 'premium',
      gradient: ['#1a1a2e', '#16213e', '#0f3460'],
      tagline: 'Exclusive Collection',
    },
  ];

  return bannerStyles.map((style) => ({
    label: style.label,
    theme: style.theme,
    gradient: style.gradient,
    tagline: style.tagline,
    productName: name,
    productDesc: desc,
    price: price || null,
    type: 'canvas',
  }));
};
