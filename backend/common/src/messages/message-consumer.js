import amqp from 'amqplib';
import config from '../config.js';
import endpoints from './endpoints.js';

export class MessageConsumer {
    handlers = [];

    constructor(queue) {
        if (!endpoints.includes(queue)) {
            throw new Error(`Invalid queue name: ${queue}`);
        }

        this.queue = queue;
    }

    registerHandler(messageType, handler) {
        
        this.handlers.push({
            messageType, handler: async (payload) => {
                await handler(payload);
            }
        });

        return this;
    }

    async start() {
        try {
            const connection = await amqp.connect(config.RABBIT_MQ);
            const channel = await connection.createChannel();

            await channel.assertQueue(this.queue, { durable: true });

            console.log(`Waiting for messages in queue: ${this.queue}`);

            channel.consume(this.queue, async (msg) => {
                if (msg !== null) {
                    try {
                        const messageContent = msg.content.toString();
                        const message = JSON.parse(messageContent);

                        console.log(`Received message from queue ${this.queue}:`, message);
                        const handlerEntry = this.handlers.find(h => h.messageType === message.type);

                        if (handlerEntry) {
                            await handlerEntry.handler(message.payload);
                        }
                        else {
                            console.warn(`No handler registered for message type: ${message.type}`);
                        }

                    } catch (error) {

                        console.error('Error processing message:', error);
                        channel.nack(msg, false, false); // Reject the message without requeueing
                    } finally {
                        channel.ack(msg);
                    }
                }
            });
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }
}