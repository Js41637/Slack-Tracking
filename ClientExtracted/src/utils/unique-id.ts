let currentId = 1;
const pid = process.pid;

export function uniqueId(): Number {
  return pid << 32 | (++currentId);
}
