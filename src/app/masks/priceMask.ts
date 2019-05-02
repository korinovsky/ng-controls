const dollarSign = '$';
const emptyString = '';
const comma = ',';
const period = /[.]/;
const minus = '-';
const minusRegExp = /-/;
const nonDigitsRegExp = /\D+/g;
const numberType = 'number';
const digitRegExp = /\d/;
const caretTrap = '[]';

export default function createPriceMask({
                                            prefix = dollarSign,
                                            suffix = emptyString,
                                            includeThousandsSeparator = true,
                                            thousandsSeparatorSymbol = comma,
                                            allowDecimal = false,
                                            decimalSymbol = period,
                                            decimalLimit = 2,
                                            requireDecimal = false,
                                            allowNegative = false,
                                            allowLeadingZeroes = false,
                                            integerLimit = null
                                        } = {}) {
    const prefixLength = prefix && prefix.length || 0;
    const suffixLength = suffix && suffix.length || 0;
    const thousandsSeparatorSymbolLength = thousandsSeparatorSymbol && thousandsSeparatorSymbol.length || 0;

    function numberMask(rawValue = emptyString) {
        const rawValueLength = rawValue.length;

        if (
            rawValue === emptyString ||
            (rawValue[0] === prefix[0] && rawValueLength === 1)
        ) {
            let result: any[] = prefix.split(emptyString);
            result = result.concat([digitRegExp]).concat(suffix.split(emptyString));
            return result;
        }

        const match = rawValue.match(decimalSymbol);
        const hasDecimal = Boolean(match);
        const indexOfLastDecimal = hasDecimal ? rawValue.lastIndexOf(match[match.length - 1]) : -1;
        const isNegative = (rawValue[0] === minus) && allowNegative;

        let integer;
        let fraction;
        let mask;

        // remove the suffix
        if (rawValue.slice(suffixLength * -1) === suffix) {
            rawValue = rawValue.slice(0, suffixLength * -1);
        }

        if (hasDecimal && (allowDecimal || requireDecimal)) {
            integer = rawValue.slice(rawValue.slice(0, prefixLength) === prefix ? prefixLength : 0, indexOfLastDecimal);

            fraction = rawValue.slice(indexOfLastDecimal + 1, rawValueLength);
            fraction = convertToMask(fraction.replace(nonDigitsRegExp, emptyString));
        } else {
            if (rawValue.slice(0, prefixLength) === prefix) {
                integer = rawValue.slice(prefixLength);
            } else {
                integer = rawValue;
            }
        }

        if (integerLimit && typeof integerLimit === numberType) {
            const thousandsSeparatorRegex = thousandsSeparatorSymbol === '.' ? '[.]' : `${thousandsSeparatorSymbol}`;
            const numberOfThousandSeparators = (integer.match(new RegExp(thousandsSeparatorRegex, 'g')) || []).length;

            integer = integer.slice(0, integerLimit + (numberOfThousandSeparators * thousandsSeparatorSymbolLength));
        }

        integer = integer.replace(nonDigitsRegExp, emptyString);

        if (!allowLeadingZeroes) {
            integer = String(Number(integer));
        }

        integer = (includeThousandsSeparator) ? addThousandsSeparator(integer, thousandsSeparatorSymbol) : integer;

        mask = convertToMask(integer);

        if ((hasDecimal && allowDecimal) || requireDecimal === true) {
            if (!decimalSymbol.test(rawValue[indexOfLastDecimal - 1])) {
                mask.push(caretTrap);
            }
            mask.push(comma, caretTrap);

            if (fraction) {
                if (typeof decimalLimit === numberType) {
                    fraction = fraction.slice(0, decimalLimit);
                }

                mask = mask.concat(fraction);
            }

            if (requireDecimal === true && decimalSymbol.test(rawValue[indexOfLastDecimal - 1])) {
                mask.push(digitRegExp);
            }
        }

        if (prefixLength > 0) {
            mask = prefix.split(emptyString).concat(mask);
        }

        if (isNegative) {
            // If user is entering a negative numberType, add a mask placeholder spot to attract the caret to it.
            if (mask.length === prefixLength) {
                mask.push(digitRegExp);
            }

            mask = [minusRegExp].concat(mask);
        }

        if (suffix.length > 0) {
            mask = mask.concat(suffix.split(emptyString));
        }
        return mask;
    }

    return numberMask;
}

function convertToMask(strNumber) {
    return strNumber
        .split(emptyString)
        .map((char) => digitRegExp.test(char) ? digitRegExp : char);
}

// http://stackoverflow.com/a/10899795/604296
function addThousandsSeparator(n, thousandsSeparatorSymbol) {
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparatorSymbol);
}
