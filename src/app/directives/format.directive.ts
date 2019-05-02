import {Directive, ElementRef, forwardRef, HostListener, Inject, Input, OnChanges, Optional, Renderer2} from '@angular/core';
import {AbstractControl, COMPOSITION_BUFFER_MODE, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';
import {createTextMaskInputElement} from 'text-mask-core/dist/textMaskCore';
import {ControlDirective} from './control.directive';
import {TextMaskConfig} from 'angular2-text-mask';
import * as moment from 'moment';

@Directive({
    selector: '[appFormat]',
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
    @Input('appFormat') type: Format;
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
        this.config = formatConfigs[this.type];
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

export enum Format {
    Name = 'name',
    Mobile = 'mobile',
    Phone = 'phone',
    Date = 'date',
}

interface FormatConfig {
    maskConfig: TextMaskConfig;
    transform?: (value: string) => string;
    clearRegexp?: RegExp;
    validate?: (value: string) => ValidationErrors | null;
}

const toUpperCase = value => value.toUpperCase();

const validateValue = (value: string, length: number, isValid?: () => boolean) => {
    if (value) {
        if (value.length < length) {
            return {incomplete: true};
        }
        if (isValid && !isValid()) {
            return {incorrect: true};
        }
    }
    return null;
};

const createMaskConfig = (regExp: RegExp, pipeFn?: (value: string, config: TextMaskConfig) => false | string | object) => {
    return {
        mask: raw => new Array(raw.length).fill(regExp),
        pipe: pipeFn,
        guide: false,
    };
};

const formatConfigs: { [key: string]: FormatConfig } = {
    [Format.Name]: {
        maskConfig: createMaskConfig(/[А-ЯЁа-яё\- ]/, toUpperCase),
        transform: value => value.replace(/[ёЁ]/g, 'Е'),
    },
    [Format.Mobile]: {
        maskConfig: {
            mask: ['+', '7', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
        },
        clearRegexp: /^\+7|[ _-]/g,
        validate: value => validateValue(value, 10, () => /^9/.test(value)),
    },
    [Format.Phone]: {
        maskConfig: {
            mask: ['+', '7', ...new Array(10).fill(/\d/)],
        },
        clearRegexp: /^\+7|_/g,
        validate: value => validateValue(value, 10, () => /^[^9]/.test(value)),
    },
    [Format.Date]: {
        maskConfig: {
            mask: [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/],
        },
        clearRegexp: /_|[._]+$/g,
        validate: value => validateValue(value, 10, () => moment(value, 'DD.MM.YYYY', true).isValid()),
    },
};
