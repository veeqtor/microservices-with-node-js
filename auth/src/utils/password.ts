import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scrpytAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scrpytAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedpassword, salt] = storedPassword.split(".");
    const buf = (await scrpytAsync(suppliedPassword, salt, 64)) as Buffer;
    return buf.toString("hex") === hashedpassword;
  }
}
