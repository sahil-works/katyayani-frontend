export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return Response.json({
    status: "ok",
    service: "katyayani-storefront",
    timestamp: new Date().toISOString(),
  });
}
