// Studio photography: [file, width, height]. Category comes from the file prefix.
const raw = [
  ['bedroom-005',1600,900],['bedroom-012',1600,900],['bedroom-030',1600,1191],['bedroom-033',1600,900],['bedroom-044',1600,900],['bedroom-045',1600,900],['bedroom-046',1600,1055],['bedroom-047',1600,900],['bedroom-051',1600,1103],['bedroom-061',1600,1134],['bedroom-066',1600,1174],['bedroom-072',1440,1440],['bedroom-073',1600,900],['bedroom-076',1600,900],['bedroom-082',1600,1054],['bedroom-087',1600,1004],
  ['dining-023',1600,940],['dining-024',1600,900],['dining-025',1600,900],['dining-028',1600,933],['dining-034',1280,1600],['dining-036',1600,900],['dining-040',1600,1296],['dining-042',1600,900],['dining-048',1600,1497],['dining-054',1600,953],['dining-056',1600,900],['dining-067',1600,1022],['dining-074',1600,919],['dining-083',1600,912],['dining-084',1600,953],['dining-086',1600,954],
  ['exterior-021',1600,1600],['exterior-041',1600,1483],['exterior-064',1600,1600],['exterior-075',1600,1600],['exterior-078',1600,1388],['exterior-081',1600,1600],
  ['living-006',1600,900],['living-009',1600,900],['living-011',1600,900],['living-013',1600,900],['living-014',1600,969],['living-015',1600,943],['living-017',1600,900],['living-018',1600,900],['living-026',1600,900],['living-027',1600,956],['living-029',1600,900],['living-031',1600,900],['living-038',1600,999],['living-039',1600,900],['living-043',1600,1104],['living-052',1600,900],['living-053',1600,900],['living-058',1600,900],['living-063',1600,900],['living-068',1600,900],['living-071',1600,900],['living-079',1600,900],['living-080',1600,949],
  ['spaces-007',1600,1571],['spaces-010',1600,1571],['spaces-020',1600,900],['spaces-022',1600,900],['spaces-032',1600,1149],['spaces-035',1600,900],['spaces-049',1600,907],['spaces-055',1600,900],['spaces-057',1600,1571],['spaces-059',1600,885],['spaces-060',1163,1600],['spaces-062',1600,999],['spaces-065',1121,1600],['spaces-077',1600,981],['spaces-088',1600,1297],
];

export const categories = {
  living: 'Living rooms',
  bedroom: 'Bedrooms',
  dining: 'Kitchen & dining',
  exterior: 'Exteriors',
  spaces: 'Mandirs, foyers & baths',
};

// interleave categories so the "All" view feels curated, not grouped
const byCat = {};
raw.forEach(([file, w, h]) => {
  const cat = file.split('-')[0];
  (byCat[cat] ||= []).push({ file, w, h, cat, label: categories[cat] });
});
const order = ['living', 'bedroom', 'dining', 'spaces', 'living', 'exterior', 'bedroom', 'dining', 'spaces'];
export const gallery = [];
const idx = Object.fromEntries(Object.keys(byCat).map((k) => [k, 0]));
while (gallery.length < raw.length) {
  for (const c of order) {
    if (idx[c] < byCat[c].length) gallery.push(byCat[c][idx[c]++]);
  }
}
