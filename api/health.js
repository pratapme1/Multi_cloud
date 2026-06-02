import { method, providers, requireAuth } from './_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  if (!(await requireAuth(req, res))) return;

  const results = await Promise.allSettled([
    providers.aws.health(),
    providers.azure.health(),
    providers.gcs.health(),
  ]);
  const providerStatus = results.map(result =>
    result.status === 'fulfilled'
      ? result.value
      : { status: 'error', message: result.reason?.message }
  );

  const degraded = providerStatus.some(provider => provider.status === 'error');
  res.status(degraded ? 207 : 200).json({
    status: degraded ? 'degraded' : 'ok',
    providers: providerStatus,
  });
}
