import {Directive, ElementRef, forwardRef, HostListener, Inject, Input, OnChanges, Optional, Renderer2} from '@angular/core';
import {AbstractControl, COMPOSITION_BUFFER_MODE, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';
import {createTextMaskInputElement} from 'text-mask-core/dist/textMaskCore';
import {ControlDirective} from './control.directive';
import {TextMaskConfig} from 'angular2-text-mask';
import {homePhoneMask, mobilePhoneMask, rMask} from '../masks/masks';

@Directive({
    selector: '[appMasked]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MaskedDirective),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MaskedDirective),
            multi: true
        },
    ]
})
export class MaskedDirective extends ControlDirective implements OnChanges, Validator {
    @Input('appMasked') type: MaskType;
    private placeholder;
    private maskedInputElement: any;
    private config: Config;
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
        this.config = maskConfigs[this.type];
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
        return this.config.transform ? this.config.transform(value) : value;
    }

    private clearValue(value) {
        return value && this.config && this.config.clearRegexp ? value.replace(this.config.clearRegexp, '') : value;
    }

    private removeTrailingSpaces() {
        const value = this.elementRef.nativeElement.value;
        const transformed = value.replace(/\s+$/, '');
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
        }
    }
}

export enum MaskType {
    Name = 'name',
    Mobile = 'mobile',
    Phone = 'phone',
}

export interface Config {
    maskConfig: TextMaskConfig;
    transform?: (value: string) => string;
    clearRegexp?: RegExp;
    validate?: (value: string) => ValidationErrors | null;
}

const toUpperCase = value => value.toUpperCase();

const validatePhone = (value: string, regexp: RegExp) => {
    if (value) {
        if (!regexp.test(value)) {
            return {incorrect: true};
        }
        if (!/^\d{10}$/.test(value)) {
            return {incomplete: true};
        }
    }
    return null;
};

export const maskConfigs: { [key: string]: Config } = {
    [MaskType.Name]: {
        maskConfig: {
            mask: rMask(),
            pipe: toUpperCase,
            guide: false,
        },
        transform: value => value.replace(/[ёЁ]/g, 'Е'),
    },
    [MaskType.Mobile]: {
        maskConfig: {
            mask: mobilePhoneMask,
        },
        clearRegexp: /^\+7|[ _-]/g,
        validate: value => validatePhone(value, /^9/),
    },
    [MaskType.Phone]: {
        maskConfig: {
            mask: homePhoneMask,
        },
        clearRegexp: /^\+7|_/g,
        validate: value => validatePhone(value, /^[^9]/),
    },
};
