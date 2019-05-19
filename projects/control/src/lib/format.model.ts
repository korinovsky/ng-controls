import {TextMaskConfig} from 'angular2-text-mask';
import {ValidationErrors} from '@angular/forms';

export enum Format {
    Name = 'name',
    Patronymic = 'patronymic',
    Mobile = 'mobile',
    Phone = 'phone',
    Date = 'date',
}

export interface FormatConfig {
    maskConfig: TextMaskConfig;
    transform?: (value: string) => string;
    clearRegexp?: RegExp;
    validate?: (value: string) => ValidationErrors | null;
}
