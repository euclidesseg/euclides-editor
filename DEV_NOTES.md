# 🧠 Arquitectura del Editor con ProseMirror

## 🔹 Componentes principales

- **EditorState** → Guarda TODO el estado del editor (documento, selección, plugins).
- **EditorView** → Es el editor visual que se renderiza en el DOM.
- **Schema** → Define qué tipos de nodos y marcas existen (párrafo, heading, bold, etc.).
- **DOMParser** → Convierte HTML → documento interno de ProseMirror.
- **prosemirror-schema-basic** → Esquema base (párrafos, headings, bold, italic…).
- **addListNodes** → Agrega listas (`ul`, `ol`, `li`) al schema.
- **exampleSetup** → Instala plugins de demo (menú, teclas, history, atajos, etc.).

---

# 📚 El Schema es el "Diccionario" del Editor

Aquí se define el lenguaje que el editor entiende.

Dentro del schema existen dos cosas principales:

1. **NODES (nodos)** → Son los BLOQUES o estructuras del documento.
2. **MARKS (marcas)** → Son formatos que se aplican al TEXTO dentro de un bloque.

---

## 🧱 NODES = Modifican bloques completos

Un nodo es como una "caja" que contiene texto u otros nodos.

### 📌 Ejemplos de bloques

| HTML | Tipo |
|------|------|
| `<p>` | párrafo |
| `<h1>` | título |
| `<ul>` | lista |
| `<li>` | elemento de lista |
| `<blockquote>` | cita |
| `<pre>` | code block |

Si quieres modificar TODO el bloque, se hace como atributo del nodo.

Ejemplo:

```html
<p style="text-align:center">Hola mundo</p>
```

Eso vive en:

`nodes → paragraph.attrs`

---

## ✏️ MARKS = Modifican texto dentro del bloque

Las marks NO cambian la estructura.  
Solo envuelven partes del texto.

Ejemplo:

```html
<p>Hola <s>mundo</s></p>
```

Aquí el bloque es el párrafo,  
pero `"mundo"` tiene una MARK.

### 📌 Ejemplos de marks

| HTML | Tipo |
|------|------|
| `<strong>` | bold |
| `<em>` | italic |
| `<a>` | link |
| `<code>` | inline code |
| `<s>` | strike (NO viene por defecto) |

Eso vive en:

`marks → schema.spec.marks`

---

# 📦 Lo que trae prosemirror-schema-basic

## 🧱 NODES incluidos

- ✅ `doc`
- ✅ `paragraph`
- ✅ `heading` (h1–h6)
- ✅ `blockquote`
- ✅ `horizontal_rule`
- ✅ `code_block`
- ✅ `image`
- ✅ `hard_break`
- ✅ `text`

## ✏️ MARKS incluidos

- ✅ `strong` (bold)
- ✅ `em` (italic)
- ✅ `link`
- ✅ `code` (inline code)

---

# 🚫 Cosas que NO vienen y debes agregar tú

## 🎨 MARKS (modifican TEXTO dentro de un bloque)

- ❌ strike / tachado → `<s>texto</s>`
- ❌ underline / subrayado → `<u>texto</u>`
- ❌ color de texto → letras rojas, azules, etc.
- ❌ background / highlight → fondo de palabras
- ❌ fontSize → tamaño de letra
- ❌ fontFamily → tipo de fuente

---

## 🧱 NODES (modifican BLOQUES o crean estructura)

- ❌ textAlign → alineación del párrafo (izq, centro, der)
- ❌ tablas → `table`, `row`, `cell`, `header`
- ❌ video embed → `<iframe>`, `<video>`
- ❌ menciones (@usuario) → nodo inline especial
- ❌ custom blocks → warning, info, success, quote box
- ❌ cards / embeds → previews tipo Notion
- ❌ columnas / layouts
- ❌ checklist

---

## 🧠 Regla de oro

> Si modifica letras → **MARK**  
> Si modifica estructura → **NODE**

---

# 🧠 Cómo agregar cosas nuevas al editor

El schema es el "diccionario" del editor.  
Dentro de él definimos:

- `nodes` → estructuras y bloques
- `marks` → estilos que afectan texto dentro de un bloque

---

## 🎨 Agregar un MARK

Los MARKS modifican palabras o partes del texto.

Ejemplos: bold, italic, strike, color, background, underline

### 1️⃣ Definir el mark

```ts
const strike = {
  parseDOM: [
    { tag: "s" },
    { tag: "del" },
    { style: "text-decoration=line-through" }
  ],
  toDOM() { return ["s", 0]; }
};
```

### 2️⃣ Agregarlo al schema

```ts
marks: schema.spec.marks.addToEnd("strike", strike)
```

### 3️⃣ Usarlo

```ts
toggleMark(mySchema.marks.strike)(view.state, view.dispatch);
```

---

## 🧱 Agregar un NODE

Los NODES crean bloques completos o nuevas estructuras.

Ejemplos: párrafos, headings, tablas, videos, bloques info, menciones

### 1️⃣ Definir el node

```ts
const warningBlock = {
  group: "block",
  content: "inline*",
  parseDOM: [{ tag: "div.warning" }],
  toDOM() { return ["div", { class: "warning" }, 0]; }
};
```

### 2️⃣ Agregarlo

```ts
let nodes = schema.spec.nodes.addToEnd("warning_block", warningBlock);
```

### 3️⃣ Crear el schema

```ts
new Schema({ nodes, marks })
```

### 4️⃣ Usarlo

```ts
setBlockType(mySchema.nodes.warning_block)(view.state, view.dispatch);
```
---

# 🚧 Roadmap Técnico del Editor

## 🔹 Mejoras de Arquitectura

- Separar **toolbar (nav)** y **editor core** en componentes independientes.
- Desacoplar la lógica de visualización del estado del editor hacia un módulo o servicio dedicado.
- Profundizar la abstracción interna de ProseMirror dentro del `EditorEngine`.
- Separar completamente la lógica de presentación de datos en un módulo o servicio independiente.

### Objetivo

Mantener una separación clara entre:

---

## 🔹 Extensiones futuras de ProseMirror

### ✅ Input Rules

Agregar soporte para `InputRules` como plugin oficial del editor.

Ejemplos planeados:

- `# + espacio` → Heading
- `> + espacio` → Blockquote
- `- + espacio` → Lista
- ``` + espacio → Code Block

Las reglas deberán integrarse dentro del sistema central de plugins.

---

### ✅ Blockquote avanzado

Crear un nodo personalizado de cita con atributos extendidos.

Ejemplo conceptual:
