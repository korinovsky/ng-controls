import {Component} from '@angular/core';
import {FormArray, FormControl} from '@angular/forms';
import {MaskType} from './directives/masked.directive';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    title = 'control';
    controls = new FormArray([
        new FormControl('фыв'),
        new FormControl('903'),
        new FormControl(),
        new FormControl(),
    ]);
    mask: MaskType[] = [
        MaskType.Name,
        MaskType.Mobile,
        MaskType.Phone,
    ];
    changed: number[] = [];

    constructor() {
        this.controls.controls.forEach((control, index) => {
            this.changed[index] = 0;
            control.valueChanges.subscribe(() => this.changed[index]++);
        });
    }

    setText() {
        this.controls.at(0).setValue('ERTавп');
        this.controls.at(1).setValue('9870123456');
    }
}
