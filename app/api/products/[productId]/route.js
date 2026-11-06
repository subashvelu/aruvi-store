export async function generateStaticParams() {
  return [
    { productId: '1' },
    { productId: '2' },
    { productId: '3' },
    { productId: '4' }
  ];
}

export async function GET(request, { params }) {
  return Response.json({
    productId: params?.productId || '1',
    status: 'success'
  });
}
