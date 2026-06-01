import { method, providers } from './_shared.js';

export default async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;

  const [awsR, azureR, gcsR] = await Promise.allSettled([
    providers.aws.health(),
    providers.azure.health(),
    providers.gcs.health(),
  ]);

  res.status(200).json({
    aws: awsR.status === 'fulfilled' ? awsR.value : { status: 'error', message: awsR.reason?.message },
    azure: azureR.status === 'fulfilled' ? azureR.value : { status: 'error', message: azureR.reason?.message },
    gcs: gcsR.status === 'fulfilled' ? gcsR.value : { status: 'error', message: gcsR.reason?.message },
  });
}
