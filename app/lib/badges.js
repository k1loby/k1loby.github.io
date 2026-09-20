const repo = "k1loby/k1loby.github.io";

let manifest = [];

try {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/badges?ref=main`,
    { cache: "no-store" }
  );

  if (response.ok) {
    const files = await response.json();

    manifest = files
      .filter((item) =>
        item.type === "file" &&
        /\.(png|jpe?g|gif|webp|svg)$/i.test(item.name)
      )
      .map((item) => {
        const name = item.name.replace(/\.[^.]+$/, "");

        return {
          name,
          url: `https://${name}`,
          file: item.name,
        };
      });
  }
} catch {}

export const badges = manifest.map((item) => ({
  name: item.name,
  url: item.url,
  image: "/badges/" + encodeURIComponent(item.file),
}));
