import {Directive, ElementRef, forwardRef, HostListener, Inject, Optional, Renderer2} from '@angular/core';
import {COMPOSITION_BUFFER_MODE, ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ɵgetDOM as getDOM} from '@angular/platform-browser';

@Directive({
    selector: '[appControl]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => ControlDirective),
        multi: true
    }]
})
export class ControlDirective implements ControlValueAccessor {

    private composing = false;
    private value: string;
    private onChange: (_: any) => void;
    private onTouched: () => void;

    constructor(
        protected renderer: Renderer2,
        protected elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) protected compositionMode: boolean
    ) {
        if (this.compositionMode == null) {
            this.compositionMode = !_isAndroid();
        }
    }

    writeValue(value) {
        this.setInputValue(value);
        this.value = value || null;
        if (this.onChange) {
            this.valueChanged(this.value);
        }
    }

    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
        this.valueChanged(this.value);
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled) {
        this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
    }

    @HostListener('blur') onBlur() {
        this.controlTouched();
    }

    @HostListener('input', ['$event.target.value']) onInput(value) {
        if (!this.compositionMode || (this.compositionMode && !this.composing)) {
            this.valueChanged(value);
        }
    }

    @HostListener('compositionstart') onCompositionStart() {
        this.composing = true;
    }

    @HostListener('compositionend', ['$event.target.value']) onCompositionEnd(value) {
        this.composing = false;
        if (this.compositionMode) {
            this.valueChanged(value);
        }
    }

    valueChanged(value: any) {
        if (!this.onChange) {
            return;
        }
        value = value || null;
        if (this.value !== value) {
            this.value = value;
            this.onChange(this.value);
        }
    }

    controlTouched() {
        this.onTouched();
    }

    setInputValue(value) {
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', value || '');
    }
}

function _isAndroid() {
    const userAgent = getDOM() ? getDOM().getUserAgent() : '';
    return /android (\d+)/.test(userAgent.toLowerCase());
}
