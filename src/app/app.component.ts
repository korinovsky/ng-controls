import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Format} from './models/format.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    controls = [
        new FormControl('фыв'),
        new FormControl('803'),
        new FormControl('7'),
        new FormControl('12.12.2010'),
        new FormControl(),
        new FormControl(),
    ];
    formats: Format[] = [
        Format.Name,
        Format.Mobile,
        Format.Phone,
        Format.Date,
        Format.Patronymic,
    ];
    changed: number[] = [];

    constructor() {
        this.controls.forEach((control, index) => {
            this.changed[index] = 0;
            control.valueChanges.subscribe(() => this.changed[index]++);
        });
    }

    setText() {
        this.controls[0].setValue('ERTавп');
        this.controls[1].setValue('9870123456');
        this.controls[2].setValue('8670123456');
        this.controls[3].setValue('01.01.2000');
        this.controls[4].setValue('ОТЧ');
        this.controls[5].setValue('asd');
    }

    validate() {
        this.controls.forEach(control => control.markAsTouched());
    }
}
