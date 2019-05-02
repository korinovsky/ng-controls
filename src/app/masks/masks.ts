export const rsMaskRegExp: RegExp = /[А-ЯЁа-яё\d.,\/\-()№ ]/;
export const rcMaskRegExp: RegExp = /[А-ЯЁа-яё\d().,!«»№;%:?*/\\|\-+" ]/;
export const rlMaskRegExp: RegExp = /[АаВвЕеКкМмНнОоРрСсТтУуХхAaBbEeKkMmHhOoPpCcTtYyXx\d]/;
export const rmMaskRegExp: RegExp = /[А-ЯЁа-яё\d().,№:\/\-_ ]/;
export const MMaskRegExp: RegExp = /[А-ЯЁа-яёA-Za-z\d(){}.,'!«»+\-№;%:?*/|\\@#$&^" <>]/;
export const MTAMaskRegExp: RegExp = /[А-ЯЁа-яёA-Za-z\d(){}.,'!«»+\-№;%:?*/|\\@#$&^" <>\r\n]/;

export function rsMask() {
    return createTextMask(rsMaskRegExp);
}

export function rcMask() {
    return createTextMask(rcMaskRegExp);
}

export function rMask() {
    return createTextMask(/[А-ЯЁа-яё\- ]/);
}

export function rlMask() {
    return createTextMask(rlMaskRegExp);
}

export function mMask() {
    return createTextMask(/[А-ЯЁа-яёA-Za-z\d]/);
}

export function MMask() {
    return createTextMask(MMaskRegExp);
}

export function rmMask() {
    return createTextMask(rmMaskRegExp);
}

export function createTextMask(regExp: RegExp) {
    return raw => new Array(raw.length).fill(regExp);
}

export const mobilePhoneMask = ['+', '7', ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];

export const homePhoneMask = ['+', '7', ...new Array(10).fill(/\d/)];
