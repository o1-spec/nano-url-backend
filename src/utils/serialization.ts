export function serializeBigInt(data: any): any {
  if (data === null || data === undefined) return data;

  if (typeof data === 'bigint') {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      serialized[key] = serializeBigInt(data[key]);
    }
    return serialized;
  }

  return data;
}
