export const TEMPLATE_NAMES = Object.freeze({
  'secret-letter': 'The Secret Letter',
  'cinematic-romance': 'Cinematic Romance',
  'wedding-editorial': 'The Wedding Editorial',
  'enchanted-garden': 'The Enchanted Garden',
  'our-story': 'Our Story',
});
export const TEMPLATE_IDS = Object.freeze(Object.keys(TEMPLATE_NAMES));
export const BACKUP_FORMAT = 'amplop-project-backup-v1';
const slots = ['portrait', 'walk', 'window'];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const fail = message => { throw new Error(message); };

export function validateProjectDraft(input, Engine, Typography) {
  if (!Engine || !Typography) fail('V14 validation engine unavailable.');
  if (!object(input) || new TextEncoder().encode(JSON.stringify(input)).length > 4_100_000) fail('Invalid project data or size limit exceeded.');
  const d = JSON.parse(JSON.stringify(input));
  const keys = (value, allowed) => { if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))) fail('Unsupported project data.'); };
  keys(d, ['data', 'slug', 'settings', 'uploads', 'mode', 'experience']);
  if (!TEMPLATE_IDS.includes(d.slug)) fail('Unsupported template.');
  keys(d.data, ['schemaVersion', 'id', 'couple', 'guest', 'city', 'country', 'timezone', 'events', 'story', 'photos']);
  keys(d.data.couple, ['first', 'second']); keys(d.data.guest, ['id', 'name']); keys(d.data.events, ['ceremony', 'reception']);
  Object.values(d.data.events).forEach(event => keys(event, ['title', 'start', 'end', 'venue', 'location']));
  if (!Array.isArray(d.data.story)) fail('Invalid story.'); d.data.story.forEach(row => keys(row, ['year', 'text', 'note'])); keys(d.data.photos, slots);
  Engine.validate(d.data);
  d.settings ??= {}; d.uploads ??= {}; d.mode ??= 'mobile'; d.experience ??= { fonts: {}, music: { track: 'none', volume: .35, onOpen: false, upload: '', filename: '' } };
  keys(d.settings, TEMPLATE_IDS); keys(d.uploads, slots);
  for (const [slug, color] of Object.entries(d.settings)) if (!Engine.variants[slug].includes(color)) fail('Unsupported color.');
  for (const media of Object.values(d.uploads)) if (typeof media !== 'string' || !/^data:image\/webp;base64,[A-Za-z0-9+/]+={0,2}$/.test(media) || media.length > 400_000) fail('Invalid photo data.');
  if (!['mobile', 'desktop'].includes(d.mode)) fail('Invalid preview mode.');
  keys(d.experience, ['fonts', 'music']); keys(d.experience.fonts, TEMPLATE_IDS);
  for (const [slug, font] of Object.entries(d.experience.fonts)) if (!Typography.options[slug].includes(font)) fail('Unsupported typography.');
  const music = d.experience.music; keys(music, ['track', 'volume', 'onOpen', 'upload', 'filename']);
  if (!['none', 'golden-hour', 'garden-waltz', 'ivory-nocturne', 'custom'].includes(music.track) || !Number.isFinite(music.volume) || music.volume < 0 || music.volume > 1 || typeof music.onOpen !== 'boolean' || typeof music.filename !== 'string' || music.filename.length > 255 || typeof music.upload !== 'string') fail('Invalid music settings.');
  if (music.upload && (!/^data:audio\/(?:mpeg|wav|ogg|mp4);base64,[A-Za-z0-9+/]+={0,2}$/.test(music.upload) || music.upload.length > 2_800_000)) fail('Invalid audio data.');
  if (music.track === 'custom' && !music.upload) fail('Custom music file is missing.');
  return d;
}

export function validateBackup(value, Engine, Typography) {
  if (!object(value) || value.format !== BACKUP_FORMAT || !Array.isArray(value.projects) || value.projects.length !== 1) fail('Expected one AMPLOP project backup.');
  const project = value.projects[0];
  if (!object(project) || typeof project.title !== 'string' || !project.title.trim() || project.title.length > 120 || !['Draft', 'In Progress', 'Ready to Publish'].includes(project.status)) fail('Invalid backup project metadata.');
  return { ...project, draft: validateProjectDraft(project.draft, Engine, Typography) };
}

export function stripDemoRsvp(html) {
  return html.replace(/<section\b[^>]*\bid="rsvp"[^>]*>[\s\S]*?<\/section>/gi, '')
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<a\b[^>]*href="#rsvp"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<button\b[^>]*data-event="rsvp"[^>]*>[\s\S]*?<\/button>/gi, '');
}

export function createMemoryStore() {
  const rows = new Map();
  return {
    async list() { return [...rows.values()].map(value => structuredClone(value)); },
    async get(id) { return structuredClone(rows.get(id)); },
    async put(value) { rows.set(value.id, structuredClone(value)); },
    async delete(id) { rows.delete(id); },
  };
}