export const blogPosts = [
  {
    "slug": "markdown-stress-test",
    "title": "markdown stress test",
    "date": "2026-09-20",
    "description": "testing all the current markdown sizes and components",
    "tags": [
      "markdown",
      "test",
      "ipsum"
    ],
    "body": "# Heading 1\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Integer feugiat, justo at blandit placerat, mauris arcu consequat neque, vel feugiat sapien ipsum id lorem.\n\n## Heading 2\n\nSed posuere consectetur est at lobortis. Donec ullamcorper nulla non metus auctor fringilla. Curabitur blandit tempus porttitor.\n\n### Heading 3\n\nMaecenas faucibus mollis interdum. Vestibulum id ligula porta felis euismod semper.\n\n#### Heading 4\n\nAenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.\n\n##### Heading 5\n\nNullam quis risus eget urna mollis ornare vel eu leo.\n\n###### Heading 6\n\nCras mattis consectetur purus sit amet fermentum.\n\n---\n\n## Text styles\n\nNormal text.\n\n**Bold text**\n\n*Italic text*\n\n***Bold and italic text***\n\n~~Strikethrough text~~\n\n`inline code`\n\n[GitHub](https://github.com/Bongoer)\n\nA longer paragraph for line-height and wrapping:\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Etiam porta sem malesuada magna mollis euismod. Nullam id dolor id nibh ultricies vehicula ut id elit. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.\n\n---\n\n## Blockquote\n\n> Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n>\n> This is a second paragraph inside the quote.\n>\n> **Bold inside a quote** and `inline code`.\n\n---\n\n## Unordered list\n\n- Alpha\n- Beta\n- Gamma\n  - Nested item\n  - Another nested item\n    - Third level\n- Delta\n\n## Ordered list\n\n1. First item\n2. Second item\n3. Third item\n   1. Nested first\n   2. Nested second\n4. Fourth item\n\n---\n\n## Checklist\n\n- [x] finished item\n- [~] midway item\n- [ ] unfinished item\n- [x] another finished item\n- [ ] another unfinished item\n\n---\n\n## Progress\n\n[[progress:0]]\n\n[[progress:25]]\n\n[[progress:50]]\n\n[[progress:75]]\n\n[[progress:100]]\n\n---\n\n## Table\n\n| Component | Status | Notes |\n| --- | --- | --- |\n| Headings | Working | H1 through H6 |\n| Lists | Working | Nested too |\n| Checklist | Testing | checked / midway / empty |\n| Progress | Testing | custom syntax |\n| Tables | Working | GFM table |\n\n---\n\n## Code block\n\n```js\nfunction hello(name) {\n  return `hello ${name}`;\n}\n\nconsole.log(hello(\"world\"));\n```\n\n```css\n.example {\n  display: grid;\n  gap: 1rem;\n  border-radius: 24px;\n}\n```\n\n---\n\n## Mixed content\n\n### Small section with everything\n\nLorem ipsum dolor sit amet, **bold consectetur**, *italic adipiscing*, and `inlineCode()`.\n\n> A short quote below a heading.\n\n- [x] typography\n- [~] spacing\n- [ ] final polish\n\n[[progress:67]]\n\n1. one\n2. two\n3. three\n\n---\n\n## Very long line wrapping\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\n## End",
    "thumbnail": "blog/markdown-stress-test.svg"
  },
  {
    "slug": "hello",
    "title": "hello markdown",
    "date": "2026-09-19",
    "description": "i forgot to add the stuff sorry",
    "tags": [
      "site",
      "notes"
    ],
    "body": "# hello\n\ni forgot to add the stuff sorry\n\n- [x] website\n- [~] blog\n- [ ] projects\n\n[[progress:50]]",
    "thumbnail": "blog/hello.svg"
  }
];

export function getPost(slug) {
  return blogPosts.find((post) => post.slug === slug);
}

export function resolvePublicAsset(path) {
  if (!path) return undefined;
  return "/" + path.replace(/^\/+/, "");
}
