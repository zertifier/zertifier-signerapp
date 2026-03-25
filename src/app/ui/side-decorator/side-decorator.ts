import {Component, input} from '@angular/core';

@Component({
  selector: 'app-side-decorator',
  imports: [],
  templateUrl: './side-decorator.html',
  styleUrl: './side-decorator.css',
})
export class SideDecorator {
  leftDecor = input("leftDecor");
  rightDecor = input("rightDecor");
}
