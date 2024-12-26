import { S3, type PutObjectCommandInput } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

const s3Client = new S3({
	forcePathStyle: false,
	endpoint: 'https://fra1.digitaloceanspaces.com',
	region: 'us-east-1',
	credentials: {
		accessKeyId: env.SPACES_KEY,
		secretAccessKey: env.SPACES_SECRET
	}
});

export async function uploadFile(file: File, fileName: string) {
	const params: PutObjectCommandInput = {
		Bucket: env.SPACES_BUCKET,
		Key: fileName,
		Body: file,
		ContentType: file.type
	};

	await s3Client.putObject(params);
}
