import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output } from '@angular/core';

@Component({
  selector: 'heading-selector',
  templateUrl: './heading-selector.component.html',
})
export class HeadingSelectorComponent {
    private el = inject(ElementRef)
    public visible = input<boolean>(false);

    headingSelected = output<number>();
    close = output<void>();

    @HostListener('document:click', ['$event'])
    onDocumentClick(event:MouseEvent){
      if(!this.visible())return

      const clickedInside = this.el.nativeElement.contains(event.target);
      if(!clickedInside){
       this.close.emit();
      }
    }

    onHead(level:number):void{
      this.headingSelected.emit(level);
    }
}
