import test from "node:test";
import assert from "node:assert/strict";
import { readStoredValue, writeStoredValue, persistDemoOrder } from "../src/storage.mjs";

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


test("silent storage discard is reported without overwriting existing cart", () => {
  const prior = '[{"id":1,"quantity":2}]';
  const store = {
    getItem() { return prior; },
    setItem() { /* Some browser storage adapters drop writes without throwing. */ },
  };
  assert.equal(writeStoredValue("b20shop.cart", [{id:1,quantity:3}], store),false);
  assert.equal(store.getItem("b20shop.cart"), prior);
});

test("unserializable writes report persistence failure without touching storage", () => {
  const store = storage({"b20shop.account": '{"username":"demo"}'});
  assert.equal(writeStoredValue("b20shop.account", undefined, store), false);
  const circular = {}; circular.self = circular;
  assert.equal(writeStoredValue("b20shop.account", circular, store), false);
  assert.equal(store.read("b20shop.account"), '{"username":"demo"}');
  assert.equal(store.writes, 0);
});

import { keepModalFocus } from "../src/modalKeyboard.mjs";

function modalFixture(count = 2) {
  const focusables = Array.from({length: count}, (_, i) => ({
    id: i,
    focused: false,
    focus() { this.focused = true; },
    getClientRects() { return [1]; },
    getAttribute() { return null; },
  }));
  const panel = {
    focused: false,
    querySelectorAll() { return focusables; },
    contains(node) { return focusables.includes(node); },
    focus() { this.focused = true; },
  };
  const event = (shiftKey = false) => ({
    key: "Tab", shiftKey, prevented: false, preventDefault() { this.prevented = true; }
  });
  return {panel, focusables, event};
}

test("forward Tab wraps last dialog control to first", () => {
  const {panel, focusables, event} = modalFixture();
  const e = event();
  assert.equal(keepModalFocus(e, panel, focusables[1]), true);
  assert.equal(e.prevented, true);
  assert.equal(focusables[0].focused, true);
});

test("reverse Shift+Tab wraps first dialog control to last", () => {
  const {panel, focusables, event} = modalFixture();
  const e = event(true);
  assert.equal(keepModalFocus(e, panel, focusables[0]), true);
  assert.equal(e.prevented, true);
  assert.equal(focusables[1].focused, true);
});

test("Tab re-enters the dialog from an outside element", () => {
  const {panel, focusables, event} = modalFixture();
  const e = event();
  assert.equal(keepModalFocus(e, panel, {outside: true}), true);
  assert.equal(focusables[0].focused, true);
});

test("Tab within the dialog preserves native keyboard order", () => {
  const {panel, focusables, event} = modalFixture(3);
  const e = event();
  assert.equal(keepModalFocus(e, panel, focusables[1]), false);
  assert.equal(e.prevented, false);
});

test("dialog with no visible controls keeps focus on its panel", () => {
  const {panel, event} = modalFixture(0);
  const e = event();
  assert.equal(keepModalFocus(e, panel, null), true);
  assert.equal(e.prevented, true);
  assert.equal(panel.focused, true);
});


test("saving a demo order persists both the new and older orders before cart clearing", () => {
  const previous = {id: "B20-old", items: []};
  const next = {id: "B20-new", items: [{id: 7, quantity: 1}]};
  const store = storage({"b20shop.orders": JSON.stringify([previous]), "b20shop.cart": '[{"id":7,"quantity":1}]'});
  assert.deepEqual(persistDemoOrder([previous], next, store), [next, previous]);
  assert.deepEqual(JSON.parse(store.read("b20shop.orders")), [next, previous]);
  assert.equal(store.read("b20shop.cart"), '[{"id":7,"quantity":1}]');
});

test("failed demo order persistence preserves the old orders and cart", () => {
  const oldOrders = '[{"id":"B20-old","items":[]}]';
  const oldCart = '[{"id":7,"quantity":1}]';
  const store = storage({"b20shop.orders": oldOrders, "b20shop.cart": oldCart});
  store.setItem = () => { throw Error("QuotaExceededError"); };
  assert.equal(persistDemoOrder([{id:"B20-old",items:[]}], {id:"B20-new",items:[]}, store), null);
  assert.equal(store.read("b20shop.orders"), oldOrders);
  assert.equal(store.read("b20shop.cart"), oldCart);
});

test("invalid demo order state is rejected without touching saved records", () => {
  const store = storage({"b20shop.orders": '[{"id":"B20-old"}]'});
  assert.equal(persistDemoOrder(null, {id:"B20-new"}, store), null);
  assert.equal(persistDemoOrder([], {id:42}, store), null);
  assert.equal(store.writes, 0);
  assert.equal(store.read("b20shop.orders"), '[{"id":"B20-old"}]');
});


test("checkout rejects a stale order snapshot without erasing a newer saved order", () => {
  const original = {id:"B20-old", items:[]};
  const newer = {id:"B20-other-tab", items:[]};
  const stored = JSON.stringify([newer, original]);
  const store = storage({"b20shop.orders":stored});
  assert.equal(persistDemoOrder([original], {id:"B20-new",items:[]}, store), null);
  assert.equal(store.read("b20shop.orders"), stored);
  assert.equal(store.writes, 0);
});

test("checkout preserves malformed order history rather than replacing it", () => {
  const store = storage({"b20shop.orders":"{broken"});
  assert.equal(persistDemoOrder([], {id:"B20-new",items:[]}, store), null);
  assert.equal(store.read("b20shop.orders"), "{broken");
  assert.equal(store.writes, 0);
});
