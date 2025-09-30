export function dateFormatter(date: string): string {
  const dateSplit = date.split('-');
  return `${dateSplit[2]}/${dateSplit[1]}/${dateSplit[0]}`;
}
