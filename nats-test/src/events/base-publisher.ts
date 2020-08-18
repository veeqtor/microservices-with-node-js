import { Stan } from "node-nats-streaming";
import { Subjects } from "./subjects";

interface IEvent {
  subject: Subjects;
  data: any;
}

abstract class Publisher<T extends IEvent> {
  abstract subject: T["subject"];

  constructor(private client: Stan) {}

  publishEvent(data: T["data"]): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err, guid) => {
        if (err) {
          return reject(err);
        } else {
          console.log(`Event Published guid: ${guid}`);
          resolve(`Event Published guid: ${guid}`);
        }
      });
    });
  }
}

export default Publisher;
