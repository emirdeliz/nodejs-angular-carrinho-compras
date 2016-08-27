/**
 * angular-input-masks
 * Personalized input masks for AngularJS
 * @version v1.4.2
 * @link http://github.com/assisrafael/angular-input-masks
 * @license MIT
 */
(function (angular) {

var StringMask = (function() {
	var tokens = {
		'0': {pattern: /\d/, _default: '0'},
		'9': {pattern: /\d/, optional: true},
		'#': {pattern: /\d/, optional: true, recursive: true},
		'S': {pattern: /[a-zA-Z]/},
		'$': {escape: true} 
	};
	var isEscaped = function(pattern, pos) {
		var count = 0;
		var i = pos - 1;
		var token = {escape: true};
		while (i >= 0 && token && token.escape) {
			token = tokens[pattern.charAt(i)];
			count += token && token.escape ? 1 : 0;
			i--;
		}
		return count > 0 && count%2 === 1;	
	};
	var calcOptionalNumbersToUse = function(pattern, value) {
		var numbersInP = pattern.replace(/[^0]/g,'').length;
		var numbersInV = value.replace(/[^\d]/g,'').length;
		return numbersInV - numbersInP;
	};
	var concatChar = function(text, character, options) {
		if (options.reverse) return character + text;
		return text + character;
	};
	var hasMoreTokens = function(pattern, pos, inc) {
		var pc = pattern.charAt(pos);
		var token = tokens[pc];
		if (pc === '') return false;
		return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
	};
	var insertChar = function(text, char, position) {
		var t = text.split('');
		t.splice(position >= 0 ? position: 0, 0, char);
		return t.join('');
	};
	var StringMask = function(pattern, opt) {
		this.options = opt || {};
		this.options = {
			reverse: this.options.reverse || false,
			usedefaults: this.options.usedefaults || this.options.reverse
		};
		this.pattern = pattern;

		StringMask.prototype.process = function proccess(value) {
			if (!value) return '';
			value = value + '';
			var pattern2 = this.pattern;
			var valid = true;
			var formatted = '';
			var valuePos = this.options.reverse ? value.length - 1 : 0;
			var optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
			var escapeNext = false;
			var recursive = [];
			var inRecursiveMode = false;

			var steps = {
				start: this.options.reverse ? pattern2.length - 1 : 0,
				end: this.options.reverse ? -1 : pattern2.length,
				inc: this.options.reverse ? -1 : 1
			};

			var continueCondition = function(options) {
				if (!inRecursiveMode && hasMoreTokens(pattern2, i, steps.inc)) {
					return true;
				} else if (!inRecursiveMode) {
					inRecursiveMode = recursive.length > 0;
				}

				if (inRecursiveMode) {
					var pc = recursive.shift();
					recursive.push(pc);
					if (options.reverse && valuePos >= 0) {
						i++;
						pattern2 = insertChar(pattern2, pc, i);
						return true;
					} else if (!options.reverse && valuePos < value.length) {
						pattern2 = insertChar(pattern2, pc, i);
						return true;
					}
				}
				return i < pattern2.length && i >= 0;
			};

			for (var i = steps.start; continueCondition(this.options); i = i + steps.inc) {
				var pc = pattern2.charAt(i);
				var vc = value.charAt(valuePos);
				var token = tokens[pc];
				if (!inRecursiveMode || vc) {
					if (this.options.reverse && isEscaped(pattern2, i)) {
						formatted = concatChar(formatted, pc, this.options);
						i = i + steps.inc;
						continue;
					} else if (!this.options.reverse && escapeNext) {
						formatted = concatChar(formatted, pc, this.options);
						escapeNext = false;
						continue;
					} else if (!this.options.reverse && token && token.escape) {
						escapeNext = true;
						continue;
					}
				}

				if (!inRecursiveMode && token && token.recursive) {
					recursive.push(pc);
				} else if (inRecursiveMode && !vc) {
					if (!token || !token.recursive) formatted = concatChar(formatted, pc, this.options);
					continue;
				} else if (recursive.length > 0 && token && !token.recursive) {
					// Recursive tokens most be the last tokens of the pattern
					valid = false;
					continue;
				} else if (!inRecursiveMode && recursive.length > 0 && !vc) {
					continue;
				}

				if (!token) {
					formatted = concatChar(formatted, pc, this.options);
					if (!inRecursiveMode && recursive.length) {
						recursive.push(pc);
					}
				} else if (token.optional) {
					if (token.pattern.test(vc) && optionalNumbersToUse) {
						formatted = concatChar(formatted, vc, this.options);
						valuePos = valuePos + steps.inc;
						optionalNumbersToUse--;
					} else if (recursive.length > 0 && vc) {
						valid = false;
						break;
					}
				} else if (token.pattern.test(vc)) {
					formatted = concatChar(formatted, vc, this.options);
					valuePos = valuePos + steps.inc;
				} else if (!vc && token._default && this.options.usedefaults) {
					formatted = concatChar(formatted, token._default, this.options);
				} else {
					valid = false;
					break;
				}
			}

			return {result: formatted, valid: valid};
		};

		StringMask.prototype.apply = function(value) {
			return this.process(value).result;
		};

		StringMask.prototype.validate = function(value) {
			return this.process(value).valid;
		};
	};

	StringMask.process = function(value, pattern, options) {
		return new StringMask(pattern, options).process(value);
	};

	StringMask.apply = function(value, pattern, options) {
		return new StringMask(pattern, options).apply(value);
	};

	StringMask.validate = function(value, pattern, options) {
		return new StringMask(pattern, options).validate(value);
	};

	return StringMask;
}());

/** Used to determine if values are of the language type Object */
var objectTypes = {
	'boolean': false,
	'function': true,
	'object': true,
	'number': false,
	'string': false,
	'undefined': false
};

if (objectTypes[typeof module]) {
	module.exports = StringMask;	
}

'use strict';

angular.module('ui.utils.masks.us', [
	'ui.utils.masks.helpers',
	'ui.utils.masks.us.phone'
]);

'use strict';

angular.module('ui.utils.masks.us.phone', [])
.directive('uiUsPhoneNumber', [function() {
	var phoneMaskUS = new StringMask('(000) 000-0000'),
		phoneMaskINTL = new StringMask('+00-00-000-000000');

	function removeNonDigits(value) {
		return value.replace(/[^0-9]/g, '');
	}

	function applyPhoneMask (value) {
		var formatedValue;

		if(value.length < 11){
			formatedValue = phoneMaskUS.apply(value) || '';
		}else{
			formatedValue = phoneMaskINTL.apply(value);
		}

		return formatedValue.trim().replace(/[^0-9]$/, '');
	}

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			function formatter(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				return applyPhoneMask(removeNonDigits(value));
			}

			function parser(value) {
				if (ctrl.$isEmpty(value)) {
					return value;
				}

				var formatedValue = applyPhoneMask(removeNonDigits(value));
				var actualValue = removeNonDigits(formatedValue);

				if (ctrl.$viewValue !== formatedValue) {
					ctrl.$setViewValue(formatedValue);
					ctrl.$render();
				}

				return actualValue;
			}

			function validator(value) {
				var valid = ctrl.$isEmpty(value) || (value.length > 9);
				ctrl.$setValidity('usPhoneNumber', valid);
				return value;
			}

			ctrl.$formatters.push(formatter);
			ctrl.$formatters.push(validator);
			ctrl.$parsers.push(parser);
			ctrl.$parsers.push(validator);
		}
	};
}]);

'use strict';

angular.module('ui.utils.masks.global', [
	'ui.utils.masks.helpers',
	'ui.utils.masks.global.date',
	'ui.utils.masks.global.money',
	'ui.utils.masks.global.number',
	'ui.utils.masks.global.percentage',
	'ui.utils.masks.global.scientific-notation',
	'ui.utils.masks.global.time'
]);

'use strict';

/*global moment*/
var globalMomentJS;
if (typeof moment !== 'undefined') {
	globalMomentJS = moment;
}

var dependencies = [];

try {
	//Check if angular-momentjs is available
	angular.module('angular-momentjs');
	dependencies.push('angular-momentjs');
} catch (e) {}

angular.module('ui.utils.masks.global.date', dependencies)
.directive('uiDateMask', ['$locale', '$log', '$injector', function($locale, $log, $injector) {
	var moment;

	if (typeof globalMomentJS === 'undefined') {
		if ($injector.has('MomentJS')) {
			moment = $injector.get('MomentJS');
		} else {
			throw new Error('Moment.js not found. Check if it is available.');
		}
	} else {
		moment = globalMomentJS;
	}

	var dateFormatMapByLocalle = {
		'pt-br': 'DD/MM/YYYY',
	};

	var dateFormat = dateFormatMapByLocalle[$locale.id] || 'YYYY-MM-DD';

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			var dateMask = new StringMask(dateFormat.replace(/[YMD]/g,'0'));

			function applyMask (value) {
				var cleanValue = value.replace(/[^0-9]/g, '');
				var formatedValue = dateMask.process(cleanValue).result || '';

				return formatedValue.trim().replace(/[^0-9]$/, '');
			}

			function formatter (value) {
				$log.debug('[uiDateMask] Formatter called: ', value);
				if(ctrl.$isEmpty(value)) {
					return value;
				}

				var formatedValue = applyMask(moment(value).format(dateFormat));
				validator(formatedValue);
				return formatedValue;
			}

			function parser(value) {
				$log.debug('[uiDateMask] Parser called: ', value);
				if(ctrl.$isEmpty(value)) {
					validator(value);
					return value;
				}

				var formatedValue = applyMask(value);
				$log.debug('[uiDateMask] Formated value: ', formatedValue);

				if (ctrl.$viewValue !== formatedValue) {
					ctrl.$setViewValue(formatedValue);
					ctrl.$render();
				}
				validator(formatedValue);

				var modelValue = moment(formatedValue, dateFormat);
				return modelValue.toDate();
			}

			function validator(value) {
				$log.debug('[uiDateMask] Validator called: ', value);

				var isValid = moment(value, dateFormat).isValid() &&
					value.length === dateFormat.length;
				ctrl.$setValidity('date', ctrl.$isEmpty(value) || isValid);
			}

			ctrl.$formatters.push(formatter);
			ctrl.$parsers.push(parser);
		}
	};
}]);

'use strict';

angular.module('ui.utils.masks.global.money', [
	'ui.utils.masks.helpers'
])
.directive('uiMoneyMask',
	['$locale', '$parse', 'PreFormatters', 'NumberValidators',
	function ($locale, $parse, PreFormatters, NumberValidators) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attrs, ctrl) {
				var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
					thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP,
					currencySym = $locale.NUMBER_FORMATS.CURRENCY_SYM,
					decimals = $parse(attrs.uiMoneyMask)(scope);

				if (angular.isDefined(attrs.uiHideGroupSep)){
					thousandsDelimiter = '';
				}

				if(isNaN(decimals)) {
					decimals = 2;
				}

				var decimalsPattern = decimals > 0 ? decimalDelimiter + new Array(decimals + 1).join('0') : '';
				var maskPattern = currencySym+' #'+thousandsDelimiter+'##0'+decimalsPattern;
				var moneyMask = new StringMask(maskPattern, {reverse: true});

				function formatter(value) {
					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var valueToFormat = PreFormatters.prepareNumberToFormatter(value, decimals);
					return moneyMask.apply(valueToFormat);
				}

				function parser(value) {
					if (ctrl.$isEmpty(value)) {
						return value;
					}

					var actualNumber = value.replace(/[^\d]+/g,'');
					actualNumber = actualNumber.replace(/^[0]+([1-9])/,'$1');
					var formatedValue = moneyMask.apply(actualNumber);

					if (value !== formatedValue) {
						ctrl.$setViewValue(formatedValue);
						ctrl.$render();
					}

					return formatedValue ? parseInt(formatedValue.replace(/[^\d]+/g,''))/Math.pow(10,decimals) : null;
				}

				ctrl.$formatters.push(formatter);
				ctrl.$parsers.push(parser);

				if (attrs.uiMoneyMask) {
					scope.$watch(attrs.uiMoneyMask, function(decimals) {
						if(isNaN(decimals)) {
							decimals = 2;
						}
						decimalsPattern = decimals > 0 ? decimalDelimiter + new Array(decimals + 1).join('0') : '';
						maskPattern = currencySym+' #'+thousandsDelimiter+'##0'+decimalsPattern;
						moneyMask = new StringMask(maskPattern, {reverse: true});

						parser(ctrl.$viewValue);
					});
				}

				if(attrs.min){
					ctrl.$parsers.push(function(value) {
						var min = $parse(attrs.min)(scope);
						return NumberValidators.minNumber(ctrl, value, min);
					});

					scope.$watch(attrs.min, function(value) {
						NumberValidators.minNumber(ctrl, ctrl.$modelValue, value);
					});
				}

				if(attrs.max) {
					ctrl.$parsers.push(function(value) {
						var max = $parse(attrs.max)(scope);
						return NumberValidators.maxNumber(ctrl, value, max);
					});

					scope.$watch(attrs.max, function(value) {
						NumberValidators.maxNumber(ctrl, ctrl.$modelValue, value);
					});
				}
			}
		};
	}
]);

'use strict';

angular.module('ui.utils.masks.global.number', [
	'ui.utils.masks.helpers'
])
.directive('uiNumberMask',
	['$locale', '$parse', 'PreFormatters', 'NumberMasks', 'NumberValidators',
	function ($locale, $parse, PreFormatters, NumberMasks, NumberValidators) {
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attrs, ctrl) {
				var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
					thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP,
					decimals = $parse(attrs.uiNumberMask)(scope);

				if (angular.isDefined(attrs.uiHideGroupSep)){
					thousandsDelimiter = '';
				}

				if(isNaN(decimals)) {
					decimals = 2;
				}

				var viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter),
					modelMask = NumberMasks.modelMask(decimals);

				function parser(value) {
					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var valueToFormat = PreFormatters.clearDelimitersAndLeadingZeros(value) || '0';
					var formatedValue = viewMask.apply(valueToFormat);
					var actualNumber = parseFloat(modelMask.apply(valueToFormat));

					if(angular.isDefined(attrs.uiNegativeNumber)){
						var isNegative = (value[0] === '-'),
							needsToInvertSign = (value.slice(-1) === '-');

						//only apply the minus sign if it is negative or(exclusive)
						//needs to be negative and the number is different from zero
						if(needsToInvertSign ^ isNegative && !!actualNumber) {
							actualNumber *= -1;
							formatedValue = '-' + formatedValue;
						}
					}

					if (ctrl.$viewValue !== formatedValue) {
						ctrl.$setViewValue(formatedValue);
						ctrl.$render();
					}

					return actualNumber;
				}

				function formatter(value) {
					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var prefix = '';
					if(angular.isDefined(attrs.uiNegativeNumber) && value < 0){
						prefix = '-';
					}

					var valueToFormat = PreFormatters.prepareNumberToFormatter(value, decimals);
					return prefix + viewMask.apply(valueToFormat);
				}

				ctrl.$formatters.push(formatter);
				ctrl.$parsers.push(parser);

				if (attrs.uiNumberMask) {
					scope.$watch(attrs.uiNumberMask, function(decimals) {
						if(isNaN(decimals)) {
							decimals = 2;
						}
						viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter);
						modelMask = NumberMasks.modelMask(decimals);

						parser(ctrl.$viewValue);
					});
				}

				if(attrs.min){
					ctrl.$parsers.push(function(value) {
						var min = $parse(attrs.min)(scope);
						return NumberValidators.minNumber(ctrl, value, min);
					});

					scope.$watch(attrs.min, function(value) {
						NumberValidators.minNumber(ctrl, ctrl.$modelValue, value);
					});
				}

				if(attrs.max) {
					ctrl.$parsers.push(function(value) {
						var max = $parse(attrs.max)(scope);
						return NumberValidators.maxNumber(ctrl, value, max);
					});

					scope.$watch(attrs.max, function(value) {
						NumberValidators.maxNumber(ctrl, ctrl.$modelValue, value);
					});
				}
			}
		};
	}
]);

'use strict';

angular.module('ui.utils.masks.global.percentage', [
	'ui.utils.masks.helpers'
])
.directive('uiPercentageMask',
	['$locale', '$parse', 'PreFormatters', 'NumberMasks', 'NumberValidators',
	function ($locale, $parse, PreFormatters, NumberMasks, NumberValidators) {
		function preparePercentageToFormatter (value, decimals) {
			return PreFormatters.clearDelimitersAndLeadingZeros((parseFloat(value)*100).toFixed(decimals));
		}

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function (scope, element, attrs, ctrl) {
				var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
					thousandsDelimiter = $locale.NUMBER_FORMATS.GROUP_SEP,
					decimals = parseInt(attrs.uiPercentageMask);

				if (angular.isDefined(attrs.uiHideGroupSep)){
					thousandsDelimiter = '';
				}

				if(isNaN(decimals)) {
					decimals = 2;
				}

				var numberDecimals = decimals + 2;
				var viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter),
					modelMask = NumberMasks.modelMask(numberDecimals);

				function formatter(value) {
					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var valueToFormat = preparePercentageToFormatter(value, decimals);
					return viewMask.apply(valueToFormat) + ' %';
				}

				function parse(value) {
					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var valueToFormat = PreFormatters.clearDelimitersAndLeadingZeros(value) || '0';
					if(value.length > 1 && value.indexOf('%') === -1) {
						valueToFormat = valueToFormat.slice(0,valueToFormat.length-1);
					}
					var formatedValue = viewMask.apply(valueToFormat) + ' %';
					var actualNumber = parseFloat(modelMask.apply(valueToFormat));

					if (ctrl.$viewValue !== formatedValue) {
						ctrl.$setViewValue(formatedValue);
						ctrl.$render();
					}

					return actualNumber;
				}

				ctrl.$formatters.push(formatter);
				ctrl.$parsers.push(parse);

				if (attrs.uiPercentageMask) {
					scope.$watch(attrs.uiPercentageMask, function(decimals) {
						if(isNaN(decimals)) {
							decimals = 2;
						}
						numberDecimals = decimals + 2;
						viewMask = NumberMasks.viewMask(decimals, decimalDelimiter, thousandsDelimiter);
						modelMask = NumberMasks.modelMask(numberDecimals);

						parse(ctrl.$viewValue);
					});
				}

				if(attrs.min){
					ctrl.$parsers.push(function(value) {
						var min = $parse(attrs.min)(scope);
						return NumberValidators.minNumber(ctrl, value, min);
					});

					scope.$watch('min', function(value) {
						NumberValidators.minNumber(ctrl, ctrl.$modelValue, value);
					});
				}

				if(attrs.max) {
					ctrl.$parsers.push(function(value) {
						var max = $parse(attrs.max)(scope);
						return NumberValidators.maxNumber(ctrl, value, max);
					});

					scope.$watch('max', function(value) {
						NumberValidators.maxNumber(ctrl, ctrl.$modelValue, value);
					});
				}
			}
		};
	}
]);

'use strict';

angular.module('ui.utils.masks.global.scientific-notation', [])
.directive('uiScientificNotationMask', ['$locale', '$parse', '$log',
	function($locale, $parse, $log) {
		var decimalDelimiter = $locale.NUMBER_FORMATS.DECIMAL_SEP,
			defaultPrecision = 2;

		function significandMaskBuilder (decimals) {
			var mask = '0';

			if(decimals > 0) {
				mask += decimalDelimiter;
				for (var i = 0; i < decimals; i++) {
					mask += '0';
				}
			}

			return new StringMask(mask, {
				reverse: true
			});
		}

		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, ctrl) {
				var decimals = $parse(attrs.uiScientificNotationMask)(scope);

				if(isNaN(decimals)) {
					decimals = defaultPrecision;
				}

				var significandMask = significandMaskBuilder(decimals);

				function splitNumber (value) {
					var stringValue = value.toString(),
						splittedNumber = stringValue.match(/(-?[0-9]*)[\.]?([0-9]*)?[Ee]?([\+-]?[0-9]*)?/);

					return {
						integerPartOfSignificand: splittedNumber[1],
						decimalPartOfSignificand: splittedNumber[2],
						exponent: splittedNumber[3] | 0
					};
				}

				function formatter (value) {
					$log.debug('[uiScientificNotationMask] Formatter called: ', value);

					if (ctrl.$isEmpty(value)) {
						return value;
					}

					if (typeof value === 'string') {
						value = value.replace(decimalDelimiter, '.');
					} else if (typeof value === 'number') {
						value = value.toExponential(decimals);
					}

					var formattedValue, exponent;
					var splittedNumber = splitNumber(value);

					var integerPartOfSignificand = splittedNumber.integerPartOfSignificand || 0;
					var numberToFormat = integerPartOfSignificand.toString();
					if (angular.isDefined(splittedNumber.decimalPartOfSignificand)) {
						numberToFormat += splittedNumber.decimalPartOfSignificand;
					}

					var needsNormalization =
						(integerPartOfSignificand >= 1 || integerPartOfSignificand <= -1) &&
						(
							(angular.isDefined(splittedNumber.decimalPartOfSignificand) &&
							splittedNumber.decimalPartOfSignificand.length > decimals) ||
							(decimals === 0 && numberToFormat.length >= 2)
						);

					if (needsNormalization) {
						exponent = numberToFormat.slice(decimals + 1, numberToFormat.length);
						numberToFormat = numberToFormat.slice(0, decimals + 1);
					}

					formattedValue = significandMask.apply(numberToFormat);

					if (splittedNumber.exponent !== 0) {
						exponent = splittedNumber.exponent;
					}

					if (angular.isDefined(exponent)) {
						formattedValue += 'e' + exponent;
					}

					return formattedValue;
				}

				function parser (value) {
					$log.debug('[uiScientificNotationMask] Parser called: ', value);

					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var viewValue = formatter(value),
						modelValue = parseFloat(viewValue.replace(decimalDelimiter, '.'));

					if (ctrl.$viewValue !== viewValue) {
						ctrl.$setViewValue(viewValue);
						ctrl.$render();
					}

					return modelValue;
				}

				function validator (value) {
					$log.debug('[uiScientificNotationMask] Validator called: ', value);

					if(ctrl.$isEmpty(value)) {
						return value;
					}

					var isMaxValid = value < Number.MAX_VALUE;
					ctrl.$setValidity('max', isMaxValid);
					return value;
				}

				ctrl.$formatters.push(formatter);
				ctrl.$formatters.push(validator);
				ctrl.$parsers.push(parser);
				ctrl.$parsers.push(validator);
			}
		};
	}
]);

'use strict';

angular.module('ui.utils.masks.global.time', [])
.directive('uiTimeMask', ['$log', function($log) {
	if(typeof StringMask === 'undefined') {
		throw new Error('StringMask not found. Check if it is available.');
	}

	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			var unformattedValueLength = 6,
				formattedValueLength = 8,
				timeFormat = '00:00:00';

			if (angular.isDefined(attrs.uiTimeMask) && attrs.uiTimeMask === 'short') {
				unformattedValueLength = 4;
				formattedValueLength = 5;
				timeFormat = '00:00';
			}

			var timeMask = new StringMask(timeFormat);

			function clearValue (value) {
				return value.replace(/[^0-9]/g, '').slice(0, unformattedValueLength);
			}

			function formatter (value) {
				$log.debug('[uiTimeMask] Formatter called: ', value);
				if(ctrl.$isEmpty(value)) {
					return value;
				}

				var cleanValue = clearValue(value);

				if (cleanValue.length === 0) {
					return '';
				}

				var formattedValue = timeMask.process(cleanValue).result;
				return formattedValue.replace(/[^0-9]$/, '');
			}

			function parser (value) {
				$log.debug('[uiTimeMask] Parser called: ', value);

				var viewValue = formatter(value);
				var modelValue = viewValue;

				if(ctrl.$viewValue !== viewValue) {
					ctrl.$setViewValue(viewValue);
					ctrl.$render();
				}

				return modelValue;
			}

			function validator (value) {
				$log.debug('[uiTimeMask] Validator called: ', value);

				if(angular.isUndefined(value)) {
					return value;
				}

				var splittedValue = value.toString().split(/:/).filter(function(v) {
					return !!v;
				});

				var hours = parseInt(splittedValue[0]),
					minutes = parseInt(splittedValue[1]),
					seconds = parseInt(splittedValue[2] || 0);

				var isValid = value.toString().length === formattedValueLength &&
					hours < 24 && minutes < 60 && seconds < 60;

				ctrl.$setValidity('time', ctrl.$isEmpty(value) || isValid);
				return value;
			}

			ctrl.$formatters.push(formatter);
			ctrl.$formatters.push(validator);
			ctrl.$parsers.push(parser);
			ctrl.$parsers.push(validator);
		}
	};
}]);

'use strict';

angular.module('ui.utils.masks.helpers', [])
.factory('PreFormatters', [function(){
	function clearDelimitersAndLeadingZeros(value) {
		var cleanValue = value.replace(/^-/,'').replace(/^0*/, '');
		cleanValue = cleanValue.replace(/[^0-9]/g, '');
		return cleanValue;
	}

	function prepareNumberToFormatter (value, decimals) {
		return clearDelimitersAndLeadingZeros((parseFloat(value)).toFixed(decimals));
	}

	return {
		clearDelimitersAndLeadingZeros: clearDelimitersAndLeadingZeros,
		prepareNumberToFormatter: prepareNumberToFormatter
	};
}])
.factory('NumberValidators', [function() {
	return {
		maxNumber: function maxValidator(ctrl, value, limit) {
			var max = parseFloat(limit);
			var validity = ctrl.$isEmpty(value) || isNaN(max)|| value <= max;
			ctrl.$setValidity('max', validity);
			return value;
		},
		minNumber: function minValidator(ctrl, value, limit) {
			var min = parseFloat(limit);
			var validity = ctrl.$isEmpty(value) || isNaN(min) || value >= min;
			ctrl.$setValidity('min', validity);
			return value;
		}
	};
}])
.factory('NumberMasks', [function(){
	return {
		viewMask: function (decimals, decimalDelimiter, thousandsDelimiter) {
			var mask = '#' + thousandsDelimiter + '##0';

			if(decimals > 0) {
				mask += decimalDelimiter;
				for (var i = 0; i < decimals; i++) {
					mask += '0';
				}
			}

			return new StringMask(mask, {
				reverse: true
			});
		},
		modelMask: function (decimals) {
			var mask = '###0';

			if(decimals > 0) {
				mask += '.';
				for (var i = 0; i < decimals; i++) {
					mask += '0';
				}
			}

			return new StringMask(mask, {
				reverse: true
			});
		}
	};
}]);

'use strict';

var availableDependencies = [
	'ui.utils.masks.global',
	'ui.utils.masks.br',
	'ui.utils.masks.us'
].filter(function(dependency) {
	try {
		angular.module(dependency);
		return true;
	} catch (e) {
		return false;
	}
});

angular.module('ui.utils.masks', availableDependencies)
.config(['$logProvider', function($logProvider) {
	$logProvider.debugEnabled(false);
}]);

})(angular);
