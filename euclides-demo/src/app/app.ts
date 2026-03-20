import { EuclidesEditorComponent } from 'euclides-editor';
import { Component, signal, ViewChild } from '@angular/core';


@Component({
  selector: 'app-root',
  imports: [EuclidesEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  editor = ViewChild(EuclidesEditorComponent)
  
  save(){
    const content = this.editor.getDoc();
  }
}
