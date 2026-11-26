import registry from '../reference/v16/reference/v14/registry.json';

// Read the original registry rather than maintain a duplicate template list.
export type TemplateKey = keyof typeof registry;
export const templateRegistry = registry;
export const templateKeys = Object.keys(registry) as TemplateKey[];
export function isTemplateKey(value: string): value is TemplateKey {
  return Object.prototype.hasOwnProperty.call(registry, value);
}
