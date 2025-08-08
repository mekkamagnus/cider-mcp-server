// Bencode encoder/decoder for nREPL protocol
import { encodeBase64, decodeBase64 } from "@std/encoding";

export class Bencode {
  static encode(data: unknown): Uint8Array {
    return new TextEncoder().encode(this.encodeValue(data));
  }

  static decode(buffer: Uint8Array): unknown {
    const text = new TextDecoder().decode(buffer);
    const result = this.decodeValue(text, 0);
    return result.value;
  }

  private static encodeValue(value: unknown): string {
    if (typeof value === "string") {
      const bytes = new TextEncoder().encode(value);
      return `${bytes.length}:${value}`;
    }
    
    if (typeof value === "number" && Number.isInteger(value)) {
      return `i${value}e`;
    }
    
    if (Array.isArray(value)) {
      const items = value.map(item => this.encodeValue(item)).join("");
      return `l${items}e`;
    }
    
    if (value && typeof value === "object") {
      const dict = value as Record<string, unknown>;
      let result = "d";
      
      // Sort keys for consistent encoding
      const sortedKeys = Object.keys(dict).sort();
      
      for (const key of sortedKeys) {
        const val = dict[key];
        if (val !== undefined) {  // Skip undefined values
          result += this.encodeValue(key);
          result += this.encodeValue(val);
        }
      }
      
      return result + "e";
    }
    
    throw new Error(`Cannot encode value of type ${typeof value}: ${value}`);
  }

  private static decodeValue(data: string, index: number): { value: unknown; newIndex: number } {
    if (index >= data.length) {
      throw new Error("Unexpected end of data");
    }

    const char = data[index];

    // Integer: i<number>e
    if (char === "i") {
      const endIndex = data.indexOf("e", index);
      if (endIndex === -1) {
        throw new Error("Invalid integer format");
      }
      const numStr = data.substring(index + 1, endIndex);
      return { value: parseInt(numStr, 10), newIndex: endIndex + 1 };
    }

    // List: l<items>e
    if (char === "l") {
      const items: unknown[] = [];
      let currentIndex = index + 1;
      
      while (currentIndex < data.length && data[currentIndex] !== "e") {
        const result = this.decodeValue(data, currentIndex);
        items.push(result.value);
        currentIndex = result.newIndex;
      }
      
      if (currentIndex >= data.length) {
        throw new Error("Unterminated list");
      }
      
      return { value: items, newIndex: currentIndex + 1 };
    }

    // Dictionary: d<key-value pairs>e
    if (char === "d") {
      const dict: Record<string, unknown> = {};
      let currentIndex = index + 1;
      
      while (currentIndex < data.length && data[currentIndex] !== "e") {
        const keyResult = this.decodeValue(data, currentIndex);
        const valueResult = this.decodeValue(data, keyResult.newIndex);
        
        if (typeof keyResult.value !== "string") {
          throw new Error("Dictionary key must be a string");
        }
        
        dict[keyResult.value] = valueResult.value;
        currentIndex = valueResult.newIndex;
      }
      
      if (currentIndex >= data.length) {
        throw new Error("Unterminated dictionary");
      }
      
      return { value: dict, newIndex: currentIndex + 1 };
    }

    // String: <length>:<string>
    if (char >= "0" && char <= "9") {
      const colonIndex = data.indexOf(":", index);
      if (colonIndex === -1) {
        throw new Error("Invalid string format");
      }
      
      const lengthStr = data.substring(index, colonIndex);
      const length = parseInt(lengthStr, 10);
      const stringStart = colonIndex + 1;
      const stringEnd = stringStart + length;
      
      if (stringEnd > data.length) {
        throw new Error("String length exceeds available data");
      }
      
      const value = data.substring(stringStart, stringEnd);
      return { value, newIndex: stringEnd };
    }

    throw new Error(`Invalid bencode data at index ${index}: ${char}`);
  }
}