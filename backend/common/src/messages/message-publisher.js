import amqp from 'amqplib';
import config from '../config.js';
import endpoints from './endpoints.js';

function validateMessage(message) {
    if (!message || typeof message !== 'object') {
        throw new Error('Message must be a non-null object');
    }

    if (!message.type || typeof message.type !== 'string') {
        throw new Error('Message must have a type property of type string');
    }

    if (!message.payload || typeof message.payload !== 'object') {
        throw new Error('Message must have a payload property of type object');
    }
}

export async function publishMessage(queue, message) {
    try {

        if (!endpoints.includes(queue)) {
            throw new Error(`Invalid queue name: ${queue}`);
        }
        
        validateMessage(message);

        const connection = await amqp.connect(config.RABBIT_MQ).then((conn) => {
            return conn.createChannel().then((ch) => {

                const ok = ch.assertQueue(queue, { durable: true });

                return ok.then(() => {
                    ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
                    console.log(`Message sent to queue ${queue}:`, message);
                });
            });
        }).catch((err) => {
            console.error('Error connecting to RabbitMQ:', err);
        });

        setTimeout(() => {
            connection.close();
        }, 500);
    }
    catch (error) {
        console.error('Error publishing message:', error);
    }
}   
