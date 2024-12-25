import pino from 'pino';

const transport = pino.transport({
	targets: [
		{
			target: 'pino/file',
			options: { destination: './logs/app.log', mkdir: true }
		},
		{
			target: 'pino-pretty',
			options: { colorize: true }
		}
	]
});

const logger = pino(transport);

export default logger;
