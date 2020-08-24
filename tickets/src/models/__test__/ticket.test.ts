import { Ticket } from "../ticket";

it("Implement optimist concurrency control", async (done) => {
  const ticket = Ticket.build({
    title: "Ticket",
    price: 5,
    userId: "123",
  });

  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();
  try {
    await secondInstance!.save();
  } catch (error) {
    return done();
  }

  throw new Error("Should not throw this error");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "Ticket",
    price: 5,
    userId: "123",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
