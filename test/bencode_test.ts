import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { Bencode } from "../src/bencode.ts";

Deno.test("Bencode - encode string", () => {
  const result = Bencode.encode("hello");
  const expected = new TextEncoder().encode("5:hello");
  assertEquals(result, expected);
});

Deno.test("Bencode - encode integer", () => {
  const result = Bencode.encode(42);
  const expected = new TextEncoder().encode("i42e");
  assertEquals(result, expected);
});

Deno.test("Bencode - encode negative integer", () => {
  const result = Bencode.encode(-42);
  const expected = new TextEncoder().encode("i-42e");
  assertEquals(result, expected);
});

Deno.test("Bencode - encode list", () => {
  const result = Bencode.encode(["hello", 42]);
  const expected = new TextEncoder().encode("l5:helloi42ee");
  assertEquals(result, expected);
});

Deno.test("Bencode - encode dictionary", () => {
  const result = Bencode.encode({ "op": "eval", "code": "(+ 1 2)" });
  // Dictionary keys are sorted, so "code" comes before "op"
  const expected = new TextEncoder().encode("d4:code7:(+ 1 2)2:op4:evale");
  assertEquals(result, expected);
});

Deno.test("Bencode - decode string", () => {
  const input = new TextEncoder().encode("5:hello");
  const result = Bencode.decode(input);
  assertEquals(result, "hello");
});

Deno.test("Bencode - decode integer", () => {
  const input = new TextEncoder().encode("i42e");
  const result = Bencode.decode(input);
  assertEquals(result, 42);
});

Deno.test("Bencode - decode negative integer", () => {
  const input = new TextEncoder().encode("i-42e");
  const result = Bencode.decode(input);
  assertEquals(result, -42);
});

Deno.test("Bencode - decode list", () => {
  const input = new TextEncoder().encode("l5:helloi42ee");
  const result = Bencode.decode(input);
  assertEquals(result, ["hello", 42]);
});

Deno.test("Bencode - decode dictionary", () => {
  const input = new TextEncoder().encode("d4:code7:(+ 1 2)2:op4:evale");
  const result = Bencode.decode(input);
  assertEquals(result, { "code": "(+ 1 2)", "op": "eval" });
});

Deno.test("Bencode - encode/decode nREPL message", () => {
  const message = {
    "op": "eval",
    "code": "(+ 1 2 3)",
    "id": "test-123",
    "session": "session-456"
  };
  
  const encoded = Bencode.encode(message);
  const decoded = Bencode.decode(encoded);
  
  assertEquals(decoded, message);
});

Deno.test("Bencode - decode empty string throws error", () => {
  const input = new TextEncoder().encode("");
  assertThrows(() => Bencode.decode(input));
});

Deno.test("Bencode - decode invalid format throws error", () => {
  const input = new TextEncoder().encode("invalid");
  assertThrows(() => Bencode.decode(input));
});