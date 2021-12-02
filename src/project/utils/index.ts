export function uniqueName(names: { [key: string]: any }, prefix: string) {
  let name = prefix;
  let i = 2;
  while (name in names) {
    name = `${prefix} ${i}`;
  }

  return name;
}
