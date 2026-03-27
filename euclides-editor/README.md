# Euclides Editor

Rich text editor for Angular built on top of ProseMirror.

Euclides Editor provides a simple and extensible editing experience designed for modern Angular applications.
It focuses on clean integration, flexibility, and serving as a foundation for building custom editors.

> ⚠️ **Early development** — This project is currently in version `0.x.x`.
> APIs and features may change between releases.

---

## ✨ Features

* Rich text editing experience
* Angular standalone component
* Powered by ProseMirror
* Lightweight architecture
* Designed for extensibility
* Suitable for blogs, CMS, and custom editors

---

## 📦 Installation

Install the package using npm:

```bash
npm install euclides-editor
```

---

## 🚀 Quick Start

Import the editor component into your Angular application.

### Component

```ts
import { Component, ViewChild } from '@angular/core';
import { EuclidesEditorComponent } from 'euclides-editor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EuclidesEditorComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {

  
  editor = ViewChild(EuclidesEditorComponent);

  save() {
    const content = this.editor.getDoc();
    console.log(content);
  }
}
```

---

### Template

```html
<euclides-editor></euclides-editor>
```
### Stylses

```json
  "styles": [
    "node_modules/euclides-editor/src/lib/styles/euclides-editor.css"
  ]
```

---

## 📄 Getting Editor Content

Retrieve the current document content:

```ts
const content = this.editor.getDoc();
```

---

## 🛠 Development Status

Euclides Editor is under active development.

Planned improvements include:

* Toolbar active state synchronization
* Command architecture improvements
* Plugin system
* Markdown editor support
* Performance optimizations

---

## 🎯 Project Goals

The goal of Euclides Editor is to provide:

* A flexible Angular-first editor
* A clean separation between editor engine and UI
* A foundation for building multiple editor types

---

## 🤝 Contributing

Contributions, suggestions, and feedback are welcome.

---

## 📜 License

UNLICENSED — All rights reserved.

---

## 👤 Author

**Euclides Pérez**
https://github.com/euclidesseg
