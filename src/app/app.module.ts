import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {TextMaskModule} from 'angular2-text-mask';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ControlDirective} from './directives/control.directive';
import {FormatDirective} from './directives/format.directive';

@NgModule({
    declarations: [
        AppComponent,
        ControlDirective,
        FormatDirective,
    ],
    imports: [
        BrowserModule,
        TextMaskModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
