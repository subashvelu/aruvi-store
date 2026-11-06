import ProductDetailClient from '../../../components/product/ProductDetailClient';

export async function generateStaticParams() {
  return [
    { productId: '1' },
    { productId: '2' },
    { productId: '3' },
    { productId: '4' }
  ];
}

export default async function ProductDetailPage({ params }) {
  const { productId } = await params;
  return <ProductDetailClient productId={productId || '1'} />;
}
