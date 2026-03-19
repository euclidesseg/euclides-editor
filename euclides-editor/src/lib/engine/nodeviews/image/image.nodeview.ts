import { Node } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { NodeSelection } from "prosemirror-state";

/**
 * NodeView personalizado para el nodo `image`.
 *
 * Esta clase controla completamente la representación DOM y el
 * comportamiento interactivo de las imágenes dentro del editor
 * basado en ProseMirror.
 *
 * Responsabilidades principales:
 *
 * 1. Renderizar la imagen dentro de un contenedor (`wrapper`).
 * 2. Permitir seleccionar la imagen como un nodo completo.
 * 3. Mostrar un controlador visual (resize handle) cuando la imagen
 *    está seleccionada.
 * 4. Permitir redimensionar la imagen mediante interacción del usuario.
 * 5. Sincronizar los cambios del estado del documento → DOM.
 *
 * Arquitectura:
 *
 * ProseMirror separa:
 * - Estado del documento (modelo)
 * - Representación visual (DOM)
 *
 * `ImageNodeView` actúa como puente entre ambos mundos.
 *

 * IMPORTANTE:
 * Esta clase NO modifica directamente el documento.
 * Siempre usa `Transaction` para mantener consistencia
 * con el modelo inmutable de ProseMirror.
 */
export class ImageNodeView implements NodeView {

    /** Elemento raíz del NodeView (obligatorio en NodeView) */
    dom: HTMLElement;

    /** Elemento <img> real mostrado en el editor */
    img: HTMLImageElement;

    /** Controlador visual usado para redimensionar la imagen */
    handle: HTMLElement;

    /** Referencia al EditorView para despachar transacciones */
    private view: EditorView;

    /**
     * Función proporcionada por ProseMirror que devuelve
     * la posición actual del nodo dentro del documento.
     */
    private getPos: () => number | undefined;

    /**
     * Constructor del NodeView.
     *
     * ProseMirror lo ejecuta automáticamente cuando un nodo
     * `image` aparece en el documento.
     *
     * @param node Nodo del documento que representa la imagen.
     * @param view Instancia activa del EditorView.
     * @param getPos Función para obtener la posición del nodo.
     */
    constructor(node: Node, view: EditorView, getPos: () => number | undefined) {

        this.view = view;
        this.getPos = getPos;

        // =========================
        // Wrapper (contenedor raíz)
        // =========================
        // Contiene la imagen y el handle de resize.
        this.dom = document.createElement("div");
        this.dom.className = "pm-image-wrapper";

        // =========================
        // Imagen
        // =========================
        this.img = document.createElement("img");
        this.img.src = node.attrs["src"];
        this.img.style.width = node.attrs["width"] || "auto";

        // =========================
        // Resize handle
        // =========================
        // Elemento visual que permite cambiar el tamaño
        // arrastrando desde la esquina.
        this.handle = document.createElement("div");
        this.handle.className = "resize-handle";
        this.handle.style.display = "none"; // oculto hasta selección

        this.dom.appendChild(this.img);
        this.dom.appendChild(this.handle);

        // =========================
        // CLICK → seleccionar imagen
        // =========================
        /**
         * Evita que ProseMirror coloque el cursor dentro
         * del texto y en su lugar selecciona el nodo completo.
         */
        this.dom.addEventListener("mousedown", (e) => {

            // Evita selección de texto nativa
            e.preventDefault();

            const pos = this.getPos();
            if (pos == null) return;

            const tr = this.view.state.tr.setSelection(
                NodeSelection.create(this.view.state.doc, pos)
            );

            this.view.dispatch(tr);
        });

        // =========================
        // Lógica de redimensionamiento
        // =========================
        let startX = 0;
        let startWidth = 0;

        /**
         * Inicia el proceso de resize al presionar el handle.
         */
        this.handle.addEventListener("mousedown", (e) => {

            e.preventDefault();
            e.stopPropagation(); // evita cambiar selección

            startX = e.clientX;
            startWidth = this.img.offsetWidth;

            /**
             * Mientras el mouse se mueve:
             * solo actualizamos el DOM (preview visual).
             */
            const onMove = (e: MouseEvent) => {
                const diff = e.clientX - startX;
                const newWidth = Math.max(50, startWidth + diff);

                this.img.style.width = `${newWidth}px`;
            };

            /**
             * Cuando el usuario suelta el mouse:
             * persistimos el nuevo tamaño en el documento.
             */
            const onUp = (e: MouseEvent) => {

                const diff = e.clientX - startX;
                const newWidth = Math.max(50, startWidth + diff);

                const pos = this.getPos();
                if (pos === undefined) return;

                const tr = this.view.state.tr.setNodeMarkup(
                    pos,
                    undefined,
                    {
                        ...node.attrs,
                        width: `${newWidth}px`
                    }
                );

                this.view.dispatch(tr);

                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };

            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        });
    }

    // =========================
    // Sincronización estado → DOM
    // =========================
    /**
     * Se ejecuta cuando el nodo cambia en el documento.
     *
     * Permite actualizar el DOM sin recrear el NodeView.
     *
     * @param node Nueva versión del nodo.
     * @returns
     * - true → reutilizar NodeView actual.
     * - false → destruir y recrear NodeView.
     */
    update(node: Node) {
        if (node.type.name !== "image") return false;

        this.img.src = node.attrs["src"];
        this.img.style.width = node.attrs["width"] || "auto";

        return true;
    }

    // =========================
    // Selección del nodo
    // =========================
    /**
     * Llamado por ProseMirror cuando el nodo es seleccionado.
     * Muestra estilos visuales y el handle de resize.
     */
    selectNode() {
        this.dom.classList.add("ProseMirror-selectednode");
        this.handle.style.display = "block";
    }

    /**
     * Llamado cuando el nodo pierde la selección.
     */
    deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode");
        this.handle.style.display = "none";
    }

    /**
     * Indica a ProseMirror que este NodeView manejará
     * sus propios eventos DOM.
     *
     * Evita que el editor procese eventos internos
     * como clicks o drag del resize.
     */
    stopEvent() {
        return true;
    }
}