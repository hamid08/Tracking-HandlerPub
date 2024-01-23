import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import config from "../../../config/config";

import rabbitService from "../../../application/services/rabbitService";

class RabbitMQConnection {
  connection!: Connection;
  channel!: Channel;
  private connected!: Boolean;
  private reconnectInterval!: number;

  async connect() {
    if (this.connected && this.channel) return;
    else this.connected = true;

    while (true) {
      try {
        this.reconnectInterval = 5000;

        console.log(`⌛️ Connecting to Rabbit-MQ Server`);
        this.connection = await client.connect(config.rabbit.uri);

        console.log(`✅ Rabbit MQ Connection is ready`);
        this.channel = await this.connection.createChannel();

        console.log(`🛸 Created RabbitMQ Channel successfully`);
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


        break;

      } catch (error) {
        console.error(`Failed to connect to Rabbit MQ: ${error}`);
        await new Promise((resolve) => setTimeout(resolve, this.reconnectInterval));
      }
    }
  }

  async startListeningToNewMessages() {
    await this.channel.assertQueue(config.rabbit.trackingRelayQueue, {
      durable: true,
      arguments: {
        'x-queue-type': 'quorum'
      }
    });

    this.channel.consume(
      config.rabbit.trackingRelayQueue,
      async (msg) => {
        {
          if (!msg) {
            return console.error(`Invalid incoming message`);
          }

          await handleIncomingTrackingData(msg);

          this.channel.ack(msg);
        }
      },
      {
        noAck: false,
      }
    );
  }

  async sendToQueue(queue: string, message: any) {
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
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

const handleIncomingTrackingData = async (msg: ConsumeMessage) => {
  try {
    const parsedMessage = JSON.parse(msg?.content?.toString());

    await rabbitService().saveTrackingData(parsedMessage);

  } catch (error) {
    console.error(`Error While Parsing the message`);
  }
};

const mqConnection = new RabbitMQConnection();

export default mqConnection;

