import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {TextMaskModule} from 'angular2-text-mask';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ControlModule} from 'projects/control/src/lib/control.module';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        TextMaskModule,
        FormsModule,
        ReactiveFormsModule,
        ControlModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
