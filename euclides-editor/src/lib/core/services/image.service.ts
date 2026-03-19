import { Injectable } from "@angular/core";

/**
 * Servicio encargado de abrir el selector nativo de imágenes del sistema.
 *
 * Responsabilidad:
 * ----------------
 * Proveer una forma desacoplada de solicitar archivos de imagen
 * desde el navegador sin que los componentes o comandos del editor
 * tengan que manipular directamente el DOM.
 *
 * Este servicio actúa como una capa de infraestructura entre:
 *
 * UI / Commands del editor
 *            ↓
 *   ImageSelectorService
 *            ↓
 *      Browser File API
 *
 * Motivación:
 * -----------
 * En arquitecturas limpias, el editor (engine/core) no debería
 * depender directamente de APIs del navegador como:
 *
 *   document.createElement('input')
 *
 * Centralizar esta lógica permite:
 *
 * ✅ Reutilización
 * ✅ Testeo más sencillo
 * ✅ Sustitución futura (drag & drop, cámara, cloud picker, etc.)
 * ✅ Mantener separación entre lógica del editor y DOM nativo
 *
 * Uso típico:
 *
 * ```ts
 * imageSelector.openImageSelector((file) => {
 *   insertImageCommand(file);
 * });
 * ```
 *
 * Flujo:
 * ------
 * 1. Se crea dinámicamente un `<input type="file">`.
 * 2. Se limita la selección a imágenes.
 * 3. Se abre el selector del sistema operativo.
 * 4. Cuando el usuario selecciona un archivo,
 *    se ejecuta el callback con el archivo elegido.
 */
@Injectable({
    providedIn: 'root'
})
export class ImageSelectorService {

    /**
     * Abre el selector de archivos del navegador
     * filtrado únicamente para imágenes.
     *
     * @param callback Función ejecutada cuando el usuario
     * selecciona una imagen válida.
     *
     * El callback recibe:
     * - `File`: archivo seleccionado por el usuario.
     *
     * Nota:
     * -----
     * Este método no almacena ni procesa la imagen.
     * Solo entrega el archivo seleccionado al consumidor.
     */
    openImageSelector(callback: (file: File) => void) {

        // Crear input dinámicamente para evitar
        // depender de elementos en el template.
        const input = document.createElement('input');
        input.type = 'file';

        // Limita archivos seleccionables a imágenes
        input.accept = 'image/*';

        /**
         * Evento disparado cuando el usuario selecciona un archivo.
         */
        input.onchange = () => {
            const file = input.files?.[0];

            // Ejecuta callback solo si existe archivo válido
            if (file) {
                callback(file);
            }
        };

        // Abre el selector nativo del sistema
        input.click();
    }
}