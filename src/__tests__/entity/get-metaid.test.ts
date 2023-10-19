import { errors } from "@/data/errors.js";
import { connect } from "@/factories/connect.js";
import { LocalWallet } from "@/wallets/local.js";

describe("entity.getMetaidInfo", () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC;
    console.log("mnemonic", mnemonic);
    const wallet = LocalWallet.create(mnemonic);
    console.log("wallet", wallet);
    //metaID-Root
    ctx.Metaid = await (await connect(wallet)).use("create-metaid-root");
  });

  test("can get metaid of the entity", async ({ Metaid }) => {
    //Metaid
    //await Metaid.disconnect();
    const root = await Metaid.getMetaidBaseRoot({
      name: "Test_name_hello", //the name is use register metaid account nickname
    });
    console.log("root", root);
    expect(root).toBeTypeOf("object");
  });

  // test("can not get entity root if it is not logined", ({ Buzz }) => {
  //   Buzz.disconnect();
  //   expect(() => Buzz.getRoot()).toThrow(errors.NOT_CONNECTED);
  // });
});
