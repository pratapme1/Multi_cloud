import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BlobSASPermissions,
  SASProtocol,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from '@azure/storage-blob';
import { method, requireAdmin, requireAuth } from '../_shared.js';

const parseAzureConnectionString = connectionString => {
  const parts = Object.fromEntries(
    connectionString.split(';').map(part => {
      const index = part.indexOf('=');
      return index > -1 ? [part.slice(0, index), part.slice(index + 1)] : [part, ''];
    })
  );
  return {
    accountName: parts.AccountName,
    accountKey: parts.AccountKey,
    endpointSuffix: parts.EndpointSuffix ?? 'core.windows.net',
  };
};

const awsUploadUrl = async ({ name, contentType }) => {
  const client = new S3Client({
    region: process.env.AWS_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    followRegionRedirects: true,
  });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: name,
    ContentType: contentType ?? 'application/octet-stream',
  });

  return {
    provider: 'aws',
    method: 'PUT',
    url: await getSignedUrl(client, command, { expiresIn: 60 * 10 }),
    headers: { 'Content-Type': contentType ?? 'application/octet-stream' },
  };
};

const azureUploadUrl = ({ name, contentType }) => {
  const { accountName, accountKey, endpointSuffix } = parseAzureConnectionString(process.env.AZURE_CONNECTION_STRING ?? '');
  const containerName = process.env.AZURE_CONTAINER_NAME;
  if (!accountName || !accountKey || !containerName) throw new Error('Azure not configured');

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  const startsOn = new Date(Date.now() - 60 * 1000);
  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);
  const sas = generateBlobSASQueryParameters({
    containerName,
    blobName: name,
    permissions: BlobSASPermissions.parse('cw'),
    startsOn,
    expiresOn,
    protocol: SASProtocol.Https,
    contentType: contentType ?? 'application/octet-stream',
  }, credential).toString();

  return {
    provider: 'azure',
    method: 'PUT',
    url: `https://${accountName}.blob.${endpointSuffix}/${encodeURIComponent(containerName)}/${encodeURIComponent(name)}?${sas}`,
    headers: {
      'Content-Type': contentType ?? 'application/octet-stream',
      'x-ms-blob-type': 'BlockBlob',
    },
  };
};

export default async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  if (!requireAuth(req, res)) return;
  if (!requireAdmin(req, res)) return;

  const { name, contentType, providers = ['aws'] } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'File name is required' });

  const urls = {};
  const errors = {};
  await Promise.allSettled(providers.filter(provider => provider !== 'gcs').map(async provider => {
    try {
      if (provider === 'aws') urls.aws = await awsUploadUrl({ name, contentType });
      else if (provider === 'azure') urls.azure = azureUploadUrl({ name, contentType });
      else errors[provider] = 'Unknown provider';
    } catch (err) {
      errors[provider] = err.message;
    }
  }));

  res.status(Object.keys(errors).length ? 207 : 200).json({ urls, errors });
}
