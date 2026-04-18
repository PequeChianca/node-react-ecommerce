import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';

// Multer memory storage
export const upload = multer({ storage: multer.memoryStorage() });

// Azure Blob Storage configuration
const AZURE_BLOB_CONNECTION_STRING = process.env.AZURE_BLOB_CONNECTION_STRING || 'UseDevelopmentStorage=true';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_BLOB_CONNECTION_STRING);

export async function uploadBufferToAzure(containerName, buffer, originalName, mimetype) {
	const containerClient = blobServiceClient.getContainerClient(containerName);
	// Ensure the container exists
	await containerClient.createIfNotExists({ access: 'container' });
	const blobName = `${Date.now()}-${originalName}`;
	const blockBlobClient = containerClient.getBlockBlobClient(blobName);
	await blockBlobClient.uploadData(buffer, {
		blobHTTPHeaders: { blobContentType: mimetype },
	});
	return blockBlobClient.url;
}
