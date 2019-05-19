import {NgModule} from '@angular/core';
import {ControlDirective} from './control.directive';
import {FormatDirective} from './format.directive';

@NgModule({
    declarations: [
        ControlDirective,
        FormatDirective
    ],
    exports: [
        ControlDirective,
        FormatDirective
    ]
})
export class ControlModule {
}
