import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { EuclidesEditorSchema } from "./schema/euclides-schema";
import { EditorStateService } from "../core/services/editor-state.service";
import { buildPlugins } from "./plugins/euclides-plugins";
import { ImageNodeView } from "./nodeviews/image/image.nodeview";
import { DOMSerializer, Node } from "prosemirror-model";
import { EditorContent } from "../core/interfaces/EditorContent.interface";

export class EditorEngine {

    /* Esta funcion crea y devuelve el editor listo para usarse
         * El estado contiene:
         * - El documento actual
         * - La posición del cursor
         * - La selección
         * - El historial (undo/redo)
         * - La información interna necesaria para que ProseMirror funcione

    */
    static create(element: HTMLElement, stateService: EditorStateService): EditorView {

        const state = EditorState.create({
            /*El Schema establece las reglas del documento*/
            schema: EuclidesEditorSchema,

            /* 
             *Los plugins extienden el comportamiento del editor:
             * - Atajos de teclado
             * - Historial
             * - Lógica personalizada
             * - Sincronización con el EditorStateService (Angular)
            */
            plugins: buildPlugins(stateService)

        })
        return new EditorView(element, {
            state,
            nodeViews: {
                image: (node, view, getPos) => new ImageNodeView(node, view, getPos)

            },
            attributes: { class: 'euclides-editor' }
        })
    }

    /**
     * Obtiene el documento completo del editor en formato JSON de ProseMirror.
     *
     * Este JSON representa la estructura semántica completa del contenido:
     * - nodos
     * - atributos
     * - jerarquía del documento
     *
     *  Uso recomendado:
     * - Guardar contenido en base de datos
     * - Versionado de documentos
     * - Restaurar el editor posteriormente
     *
     * Este formato depende del Schema del editor.
     *
     * @param view EditorView activo
     * @returns JSON serializable del documento
     *
     * @example
     * const json = EditorEngine.getDocumentJSON(view);
     * saveToDatabase(json);
     */
    static getDocumentJSON(view: EditorView) {
        return view.state.doc.toJSON();
    }

    /**
     * Recorre TODO el documento y devuelve todos los nodos existentes
     * junto con su posición dentro del documento.
     *
     * Internamente usa `doc.descendants()` de ProseMirror.
     *
     * ✅ Uso recomendado:
     * - Análisis del documento
     * - Plugins personalizados
     * - Indexación
     * - Debugging
     * - Buscar nodos específicos
     *
     * ⚠️ Puede ser costoso en documentos muy grandes.
     *
     * @param view EditorView activo
     * @returns Lista de nodos con su posición
     *
     * @example
     * const nodes = EditorEngine.getAllNodes(view);
     *
     * nodes.forEach(n => {
     *   console.log(n.node.type.name, n.pos);
     * });
     */
    static getAllNodes(view: EditorView) {
        const nodes: { node: Node; pos: number }[] = [];

        view.state.doc.descendants((node, pos) => {
            nodes.push({ node, pos });
        });

        return nodes;
    }


    /**
  * Obtiene el contenido del editor en múltiples formatos listos
  * para persistencia, análisis o publicación.
  *
  * Este método actúa como la API principal de lectura del editor.
  *
  * Devuelve:
  * - JSON estructural (guardar en DB)
  * - HTML renderizable (frontend)
  * - Texto plano (SEO / búsquedas)
  * - Conteo de palabras
  * - Tiempo estimado de lectura
  * - Lista de imágenes utilizadas
  *
  * ✅ Uso recomendado:
  * - Botón "Publicar"
  * - Autosave
  * - Previsualización
  * - Indexación SEO
  *
  * @param view EditorView activo
  * @returns EditorContent objeto preparado para consumo externo
  *
  * @example
  * const content = EditorEngine.getContent(view);
  *
  * api.publish({
  *   title: "Mi artículo",
  *   content: content.json,
  *   html: content.html,
  *   readingTime: content.readingTime
  * });
  */
    static getContent(view: EditorView): EditorContent {

        const doc = view.state.doc;

        // JSON estructural
        const json = doc.toJSON();

        // Texto plano del documento
        const text = doc.textContent;

        // Extraer imágenes del documento
        const images: string[] = [];
        doc.descendants(node => {
            if (node.type.name === 'image') {
                images.push(node.attrs["src"]);
            }
        });

        // Conteo de palabras
        const wordCount =
            text.trim().length === 0
                ? 0
                : text.trim().split(/\s+/).length;

        // Tiempo estimado de lectura (200 palabras/min)
        const readingTime = Math.ceil(wordCount / 200);

        return {
            json,
            html: this.toHTML(doc),
            text,
            wordCount,
            images,
            readingTime
        };
    }
    
    static exportForStorage(view: EditorView) {
        const content = this.getContent(view);

        return {
            content_json: content.json,
            content_html: content.html,
            content_text: content.text,
            metadata: {
                wordCount: content.wordCount,
                readingTime: content.readingTime,
                images: content.images
            }
        };
    }

    /**
     * Convierte un documento ProseMirror a HTML.
     *
     * Usa el DOMSerializer basado en el Schema del editor,
     * garantizando que el HTML generado respete las reglas
     * estructurales definidas.
     *
     * ⚠️ Método interno.
     * No debería ser usado directamente por consumidores
     * de la librería.
     *
     * @param doc Nodo raíz del documento
     * @returns HTML serializado
     */
    private static toHTML(doc: Node): string {

        const serializer =
            DOMSerializer.fromSchema(EuclidesEditorSchema);

        const fragment = serializer.serializeFragment(
            doc.content
        );

        const div = document.createElement("div");
        div.appendChild(fragment);

        return div.innerHTML;
    }

    
}