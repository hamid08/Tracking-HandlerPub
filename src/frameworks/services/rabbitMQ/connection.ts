import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import config from "../../../config/config";
import rabbitService from "../../../application/services/rabbitService";
import moment from 'moment';

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected: boolean = false;
  private reconnectInterval: number = 5000;

  async connect(): Promise<void> {
    if (this.connected && this.channel) return;
    else this.connected = true;

    while (true) {
      try {
        this.reconnectInterval = 5000;

        console.log(`⌛️ Connecting to Rabbit-MQ Server`);
        this.connection = await client.connect(config.rabbit.uri);

        console.log(`✅ Rabbit MQ Connection is ready`);
        this.channel = await this.connection.createChannel();

        console.log(`✅ Created RabbitMQ Channel successfully`);
        await this.startListeningToNewMessages();

        this.connection.on('connect', () => {
          console.log(`✅ Rabbit MQ Connection is ready`);
        });

        this.connection.on('disconnect', () => {
          console.error(`Not connected to MQ Server, retrying in ${this.reconnectInterval}ms`);
          setTimeout(this.connect.bind(this), this.reconnectInterval);
        });

        this.connection.on('error', (err: any) => {
          console.error(`Rabbit MQ Connection error: ${err}`);
        });

        this.connection.on('close', () => {
          console.error(`Rabbit MQ Connection closed`);
        });

        this.channel.on('close', () => {
          console.error(`Rabbit MQ Channel closed`);
          // Handle channel closure here
          // You can reconnect or perform other recovery actions
          this.connect();
        });


        this.channel.on('error', (err: any) => {
          console.error(`Rabbit MQ Channel error: ${err}`);
        });

        break;

      } catch (error) {
        console.error(`Failed to connect to Rabbit MQ: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, this.reconnectInterval));
      }
    }
  }

  async startListeningToNewMessages(): Promise<void> {
    try {
      await this.channel.assertQueue(config.rabbit.trackingRelayQueue, {
        durable: true,
        arguments: {
          'x-queue-type': 'quorum'
        }
      });

      this.channel.consume(
        config.rabbit.trackingRelayQueue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }

          try {
            const parsedMessage = JSON.parse(msg?.content?.toString());
            const success: any = await rabbitService().saveTrackingData(parsedMessage);

            if (success) {
              this.channel.ack(msg);
            } else {
              console.error(`Failed to save tracking data for message: ${msg.content.toString()}`);
              this.channel.nack(msg, false, true);
            }
          } catch (error) {
            console.error(`Error while processing message: ${error}`);
            this.channel.nack(msg, false, true);
          }
        },
        {
          noAck: false,
        }
      );
    } catch (error) {
      console.error(`Failed to start listening to new messages: ${error}`);
    }
  }

  async sendToQueue(queue: string, message: any): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      await this.channel.assertQueue(queue, {
        durable: true,
        arguments: {
          'x-queue-type': 'quorum'
        }
      });

      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      const dateFormat = moment().format('YYYY-MM-DD HH:mm:ss');
      console.log(`[x] Publish To %s ${queue} ${dateFormat}`);
    } catch (error) {
      console.error(`Failed to send message to queue: ${error}`);
      throw error;
    }
  }

}

const mqConnection = new RabbitMQConnection();

export default mqConnection;