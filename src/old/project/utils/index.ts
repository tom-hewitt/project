export function uniqueName(names: { [key: string]: {} }, prefix: string) {
  let name = prefix;
  let i = 2;
  while (names.hasOwnProperty(name)) {
    name = `${prefix} ${i}`;
  }

  return name;
}
