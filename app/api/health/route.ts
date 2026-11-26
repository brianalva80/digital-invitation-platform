export function GET() {
  // Liveness only; do not imply database/payment readiness.
  return Response.json({ status: 'ok', service: 'amplop', stage: 'V25', scope: 'liveness' }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
