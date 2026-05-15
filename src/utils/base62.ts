
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(ALPHABET.length); // 62n

export function encodeBase62(id: bigint): string {
  if (id <= 0n) throw new Error('ID must be a positive integer');

  let result = '';
  let num = id;

  while (num > 0n) {
    result = ALPHABET[Number(num % BASE)] + result;
    num = num / BASE;
  }

  return result;
}

export function decodeBase62(code: string): bigint {
  let result = 0n;

  for (const char of code) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base62 character: ${char}`);
    result = result * BASE + BigInt(index);
  }

  return result;
}
