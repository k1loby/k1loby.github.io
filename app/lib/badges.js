const manifest = [];
export const badges = manifest.map((item) => ({
  name: item.name,
  url: item.url,
  image: "/badges/" + encodeURIComponent(item.file),
}));
