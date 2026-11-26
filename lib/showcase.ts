import { templateKeys, templateRegistry, type TemplateKey } from './templates';
const details: Record<TemplateKey, { tagline: string; description: string; interaction: string }> = {
  'secret-letter': { tagline: 'Unseal the love.', description: 'Kertas bertekstur, segel lilin, dan nuansa surat cinta yang abadi.', interaction: 'Buka segel dan surat' },
  'cinematic-romance': { tagline: 'A film of us.', description: 'Fotografi dramatis dan kisah cinta dalam rangkaian adegan sinematik.', interaction: 'Putar cerita dan scroll' },
  'wedding-editorial': { tagline: 'Every page, a memory.', description: 'Tipografi editorial dan komposisi seperti majalah pernikahan.', interaction: 'Buka sampul majalah' },
  'enchanted-garden': { tagline: 'Where love blooms.', description: 'Ilustrasi botani dan suasana taman rahasia yang romantis.', interaction: 'Masuki gerbang taman' },
  'our-story': { tagline: 'Collect our memories.', description: 'Polaroid, catatan cinta, dan album kenangan yang bisa dieksplorasi.', interaction: 'Susun kartu kenangan' },
};
export const showcase = templateKeys.map((key, index) => ({ key, number: String(index + 1).padStart(2, '0'), title: templateRegistry[key].label, ...details[key] }));
