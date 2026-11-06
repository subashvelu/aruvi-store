export async function generateStaticParams() {
  return [
    { productId: '1' },
    { productId: '2' },
    { productId: '3' },
    { productId: '4' }
  ];
}

export async function GET(request, { params }) {
  const { productId } = await params;
  return Response.json({
    productId: productId || '1',
    status: 'success'
  });
}
