export function applyMutuallyExclusiveOption(
  currentSelection: string[],
  value: string,
  exclusiveValue: string = 'ninguna',
): string[] {
  const newSelection = [...currentSelection];
  const index = newSelection.indexOf(value);

  if (index > -1) {
    newSelection.splice(index, 1);
  } else {
    if (value === exclusiveValue) {
      return [exclusiveValue];
    }
    const exclusiveIndex = newSelection.indexOf(exclusiveValue);
    if (exclusiveIndex > -1) {
      newSelection.splice(exclusiveIndex, 1);
    }
    newSelection.push(value);
  }

  return newSelection;
}
