import test from "node:test";
import assert from "node:assert/strict";
import { readStoredValue, writeStoredValue } from "../src/storage.mjs";

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  let writes = 0;
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { writes++; values.set(key, value); },
    get writes() { return writes; },
    read(key) { return values.get(key); },
  };
}

test("new storage key gets expected demo initial state", () => {
  const store = storage();
  assert.deepEqual(readStoredValue("b20shop.cart", [{id:7,quantity:1}], store), {value:[{id:7,quantity:1}],blocked:false});
  assert.equal(store.writes, 0);
});
test("valid previous cart and saved items survive unchanged", () => {
  const cart = '[{"id":1,"quantity":2}]';
  const saved = '[1,4]';
  const store = storage({"b20shop.cart":cart,"b20shop.saved":saved});
  assert.deepEqual(readStoredValue("b20shop.cart", [], store), {value:[{id:1,quantity:2}],blocked:false});
  assert.deepEqual(readStoredValue("b20shop.saved", [], store), {value:[1,4],blocked:false});
  assert.equal(store.read("b20shop.cart"),cart);
  assert.equal(store.writes,0);
});
test("malformed JSON blocks fallback from replacing existing cart", () => {
  const store = storage({"b20shop.cart": "{broken"});
  assert.deepEqual(readStoredValue("b20shop.cart", [{id:7,quantity:1}], store), {value:[{id:7,quantity:1}],blocked:true});
  assert.equal(store.read("b20shop.cart"),"{broken");
  assert.equal(store.writes,0);
});
test("wrong-type and malformed records are blocked, not interpreted as empty", () => {
  for (const [key, data, fallback] of [
    ["b20shop.cart", "{}", []],
    ["b20shop.cart", '[{"id":7,"quantity":-2}]', []],
    ["b20shop.saved", '["x"]', []],
    ["b20shop.orders", '[null]', []],
    ["b20shop.account", '[]', null],
  ]) {
    const store = storage({[key]: data});
    assert.equal(readStoredValue(key, fallback, store).blocked,true, key);
    assert.equal(store.read(key), data);
    assert.equal(store.writes,0);
  }
});
test("valid historic orders and demo account are retained", () => {
  const store = storage({"b20shop.orders": '[{"id":"B20-1","items":[]}]', "b20shop.account":'{"username":"demo"}'});
  assert.equal(readStoredValue("b20shop.orders", [], store).value[0].id,"B20-1");
  assert.equal(readStoredValue("b20shop.account", null, store).value.username,"demo");
});
test("blocked storage API is recognized rather than silently discarded", () => {
  const inaccessible = { getItem() { throw Error("disabled"); }, setItem() {throw Error("disabled");} };
  assert.equal(readStoredValue("b20shop.orders", [], inaccessible).blocked,true);
  assert.equal(writeStoredValue("b20shop.orders", [], inaccessible),false);
});
test("quota failure reports persistence error and does not erase old record", () => {
  const store = storage({"b20shop.orders":"[]"});
  store.setItem = () => {throw Error("QuotaExceededError")};
  assert.equal(writeStoredValue("b20shop.orders",[{id:"B20-2"}],store),false);
  assert.equal(store.read("b20shop.orders"),"[]");
});
test("valid explicit writes retain original key contract", () => {
  const store=storage();
  assert.equal(writeStoredValue("b20shop.saved",[7],store),true);
  assert.equal(store.read("b20shop.saved"),"[7]");
  assert.equal(store.writes,1);
});
