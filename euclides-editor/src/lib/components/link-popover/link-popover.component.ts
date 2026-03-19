import { Component, input, output, signal, effect, ElementRef, HostListener, inject } from '@angular/core';

@Component({
  selector: 'app-link-popover',
  templateUrl: './link-popover.component.html',
})
export class LinkPopoverComponent {

  openLink() {
    window.open(this.url(), '_blank');

  }
  private el = inject(ElementRef);

  // inputs
  visible = input<boolean>(false);
  initialUrl = input<string>('');

  // Outputs
  confirm = output<string>();
  cancel = output<void>();
  remove = output<void>();

  url = signal<string>('google');

  private syncUrlEffect = effect(() => {
    this.url.set(this.initialUrl()); // se ejecutará este efecto solo cuando la señal leida initialUrl() cambia su valor
  })


  /**
  * Escucha los clicks realizados en cualquier parte del documento
  * para detectar si el usuario hizo click fuera del popover.
  * 
  * @HostListener('document:click', ['$event']) hace que este metodo se ejecute
  * internamente angular hace algo como:
  * document.addEventListener('click', (event) => {
  *  component.onDocumentClick(event);
  * });
  * 
  * Este comportamiento permite cerrar automáticamente la ventana
  * flotante cuando se interactúa con otro elemento del editor
  * o de la interfaz.
  *
  * Equivale conceptualmente a:
  * document.addEventListener('click', ...)
  * pero usando el sistema de eventos gestionado por Angular.
  *
  * Flujo:
  * 1. Angular escucha todos los clicks del documento.
  * 2. Se verifica si el popover está visible.
  * 3. Se comprueba si el click ocurrió dentro del componente.
  * 4. Si el click fue externo → se emite el evento `cancel`.
  */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {

    // Si el popover no está visible, no hacemos nada.
    // Evita ejecuciones innecesarias en cada click global.
    if (!this.visible()) return;

    /**
     * Verifica si el elemento clickeado pertenece al DOM
     * interno del componente.
     *
     * nativeElement → elemento raíz del componente
     * contains(...) → true si el click ocurrió dentro.
     */
    const clickedInside = this.el.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.cancel.emit();
    }
  }
  onConfirm() {
    if (!this.url()) return;
    this.confirm.emit(this.url());
    this.url.set('')
  }
}