import {TextMaskConfig} from 'angular2-text-mask';
import {Format, FormatConfig} from '../models/format.model';
import * as moment from 'moment';

const toUpperCase = value => value.toUpperCase();

const validate = (value: string, length: number | { max?: number, min?: number }, isValid?: () => boolean) => {
    if (value) {
        if (typeof length === 'number' && value.length !== length) {
            return {incomplete: true};
        }
        if (typeof length === 'object') {
            if (length.max && value.length > length.max) {
                return {maxLength: true};
            }
            if (length.min && value.length < length.min) {
                return {minLength: true};
            }
        }
        if (isValid && !isValid()) {
            return {incorrect: true};
        }
    }
    return null;
};

const regExpArray = (regExp: RegExp, length: number) => new Array(length).fill(regExp);

const createMaskConfig = (regExp: RegExp, pipeFn?: (value: string, config: TextMaskConfig) => false | string | object): TextMaskConfig => {
    return {
        mask: raw => regExpArray(regExp, raw.length),
        pipe: pipeFn,
        guide: false,
    };
};

export const formatConfig: { [key: string]: FormatConfig } = {
    [Format.Name]: {
        maskConfig: createMaskConfig(/[А-ЯЁа-яё -]/, toUpperCase),
        transform: value => value.replace(/[ёЁ]/g, 'Е'),
        validate: value => validate(value, {max: 50}, () => /^[А-Я]+([\s-][А-Я]+){0,2}$/.test(value)),
    },
    [Format.Mobile]: {
        maskConfig: {
            mask: ['+', '7', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/],
        },
        clearRegexp: /^\+7|[ _-]/g,
        validate: value => validate(value, 10, () => /^[^78]/.test(value)),
    },
    [Format.Phone]: {
        maskConfig: {
            mask: ['+', '7', ...regExpArray(/\d/, 10)],
        },
        clearRegexp: /^\+7|_/g,
        validate: value => validate(value, 10, () => /^[^79]/.test(value)),
    },
    [Format.Date]: {
        maskConfig: {
            mask: [/\d/, /\d/, '.', /\d/, /\d/, '.', /\d/, /\d/, /\d/, /\d/],
        },
        clearRegexp: /_|[._]+$/g,
        validate: value => validate(value, 10, () => moment(value, 'DD.MM.YYYY', true).isValid()),
    },
};

formatConfig[Format.Patronymic] = Object.assign({}, formatConfig[Format.Name], {
    validate: value => validate(value, {max: 35}, () => /^((?!НЕТ$)[А-Я]+([\s-][А-Я]+){0,2}|-)$/.test(value)),
});
