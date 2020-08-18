import { Message, Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface IEvent {
  subject: Subjects;
  data: any;
}

abstract class Listener<T extends IEvent> {
  abstract subject: T["subject"];
  abstract queueGroupName: string;
  abstract onMessage(data: T["data"], msg: Message): void;
  protected ackWait = 5 * 1000;

  constructor(private client: Stan) {}

  subscriptiionOptions() {
    const options = this.client.subscriptionOptions();
    options.setManualAckMode(true);
    options.setDeliverAllAvailable();
    options.setAckWait(this.ackWait);
    options.setDurableName(this.queueGroupName);
    return options;
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptiionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message Recieved: ${this.subject}/${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}

export default Listener;
