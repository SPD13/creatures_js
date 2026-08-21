# Documentation Articles

This folder contains the markdown articles displayed in the wiki documentation system.

## Adding New Documentation

### Step 1: Create the Markdown File

1. Choose the appropriate category folder (or create a new one):
   - `getting-started/` - Introduction and setup guides
   - `game-systems/` - Game mechanics documentation
   - `technical/` - File formats and implementation details

2. Create your markdown file with a descriptive name:
   ```
   articles/game-systems/my-new-feature.md
   ```

3. Write your content using standard Markdown syntax

### Step 2: Update the Index

Edit `index.json` to add your article:

1. Find the appropriate category in the `categories` array
2. Add an article entry:

```json
{
  "type": "article",
  "id": "my-new-feature",
  "title": "My New Feature",
  "file": "game-systems/my-new-feature.md",
  "description": "Brief description for search results",
  "tags": ["keyword1", "keyword2"]
}
```

3. Add search keywords to the `searchIndex` array:

```json
{
  "id": "my-new-feature",
  "keywords": ["relevant", "search", "terms"]
}
```

### Step 3: Verify

1. Open the wiki in your browser
2. Your article should appear in the navigation
3. Verify search finds your article

## Markdown Guidelines

### Supported Features

- **Headings** (H1-H6)
- **Bold**, *italic*, ~~strikethrough~~
- `Inline code` and code blocks with syntax highlighting
- Tables
- Bulleted and numbered lists
- Blockquotes
- Links (internal and external)
- Images

### Code Blocks

Use fenced code blocks with language hints:

````markdown
```javascript
function example() {
    return 'Hello, World!';
}
```
````

Supported languages: `javascript`, `text`, `json`, `bash`, and more.

### Internal Links

Link to other wiki articles using hash URLs:

```markdown
See the [Biochemistry System](#/article/biochemistry-system) for details.
```

### Images

Place images in the `images/` folder and reference them:

```markdown
![Diagram](images/my-diagram.png)
```

## Index Schema

### Article Entry

```json
{
  "type": "article",
  "id": "unique-id",
  "title": "Display Title",
  "file": "category/filename.md",
  "description": "Optional description for search",
  "tags": ["optional", "tags"],
  "lastModified": "2026-01-06T00:00:00Z"
}
```

### Category Entry

```json
{
  "id": "category-id",
  "name": "Category Name",
  "expanded": false,
  "children": [
    // Articles or nested categories
  ]
}
```

### Search Index Entry

```json
{
  "id": "article-id",
  "keywords": ["additional", "search", "terms"]
}
```

## Folder Structure

```
articles/
├── index.json              # Article index
├── README.md               # This file
├── getting-started/        # Introduction articles
│   └── introduction.md
├── game-systems/           # Game mechanics articles
│   ├── biochemistry-system.md
│   ├── brain-system.md
│   └── ...
├── technical/              # Technical reference articles
│   ├── binary-world-format.md
│   └── ...
└── images/                 # Shared images
    └── diagrams/
```

## Tips

1. **Use descriptive IDs** - The ID is used in URLs, so keep them readable
2. **Add meaningful tags** - Tags improve search accuracy
3. **Include a description** - Shown in search results
4. **Use relative links** - Link to other articles with `#/article/id`
5. **Test your markdown** - Verify rendering in the wiki before committing
