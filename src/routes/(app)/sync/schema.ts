import { z } from 'zod';
const schema = z.object({
	id: z.number().int().min(1),
	images: z
		.instanceof(File, { message: 'Please upload a file.' })
		.refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
		.array()
});

export default schema;
