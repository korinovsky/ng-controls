import {Directive, ElementRef, forwardRef, HostListener, Inject, Input, OnChanges, Optional, Renderer2} from '@angular/core';
import {AbstractControl, COMPOSITION_BUFFER_MODE, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';
import {createTextMaskInputElement} from 'text-mask-core/dist/textMaskCore';
import {ControlDirective} from './control.directive';
import {Format, FormatConfig} from './format.model';
import {formatConfig} from './format.config';

@Directive({
    selector: '[libFormat]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FormatDirective),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => FormatDirective),
            multi: true
        },
    ]
})
export class FormatDirective extends ControlDirective implements OnChanges, Validator {
    @Input('libFormat') type: Format;
    private placeholder;
    private maskedInputElement: any;
    private config: FormatConfig;
    private onValidatorChange: () => void;

    constructor(
        protected renderer: Renderer2,
        protected elementRef: ElementRef,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) protected compositionMode: boolean
    ) {
        super(renderer, elementRef, compositionMode);
    }

    ngOnChanges() {
        this.initMask();
        this.initPlaceholder();
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    validate(control: AbstractControl): ValidationErrors | null {
        return this.config && this.config.validate ? this.config.validate(control.value) : null;
    }

    valueChanged(value) {
        if (this.config) {
            this.applyMask(value);
        } else {
            super.valueChanged(this.clearValue(value));
        }
    }

    controlTouched() {
        if (this.config) {
            this.removeTrailingSpaces();
        }
        this.clearPlaceHolder();
        super.controlTouched();
    }

    @HostListener('keydown', ['$event']) ignoreLeadingSpaces(e: KeyboardEvent) {
        return e.key !== ' ' || this.elementRef.nativeElement.selectionStart > 0;
    }

    @HostListener('focus') showPlaceholder() {
        if (this.placeholder) {
            this.elementRef.nativeElement.placeholder = this.placeholder;
        }
    }

    private initMask() {
        this.config = formatConfig[this.type];
        if (this.config) {
            this.maskedInputElement = createTextMaskInputElement(
                Object.assign({inputElement: this.elementRef.nativeElement}, this.config.maskConfig));
        }
        if (this.onValidatorChange) {
            this.onValidatorChange();
        }
    }

    private applyMask(value) {
        this.maskedInputElement.update(this.transformValue(value));
        super.valueChanged(this.clearValue(this.elementRef.nativeElement.value));
    }

    private transformValue(value) {
        return value && this.config.transform ? this.config.transform(value) : value;
    }

    private clearValue(value) {
        if (value) {
            if (this.config && this.config.clearRegexp) {
                value = value.replace(this.config.clearRegexp, '');
            }
            value = removeTrailingSpaces(value);
        }
        return value;
    }

    private removeTrailingSpaces() {
        const value = this.elementRef.nativeElement.value;
        const transformed = removeTrailingSpaces(value);
        if (value !== transformed) {
            this.setInputValue(transformed);
            this.valueChanged(transformed);
        }
    }

    private initPlaceholder() {
        this.placeholder = (() => {
            const mask = this.config && this.config.maskConfig.mask;
            if (!mask || typeof mask !== 'object' || mask.indexOf('_') >= 0) {
                return;
            }
            return mask.map((char) => (char instanceof RegExp) ? '_' : char).join('');
        })();
    }

    private clearPlaceHolder() {
        if (this.placeholder) {
            this.elementRef.nativeElement.placeholder = '';
            if (this.elementRef.nativeElement.value === this.placeholder) {
                this.maskedInputElement.update('');
            }
        }
    }
}

const removeTrailingSpaces = value => value.replace(/\s+$/, '');
