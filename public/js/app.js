<script src="./simpletest.js"></script>
<script>

// Syntax: 
  // betterRound(numObj, digits)

// Parameters:
  // numObject (number)
  // digits (precision)

// Return value:
  // The given number rounded using fixed-point notation.

// Test descriptions:
// It should return a string.
// It should be able to accept a string as a first argument.
// If second argument is greater than the provided decimal digits of the first argument, it should add zeroes accordingly.
// If no second argument, the number of decimal digits should default to 2.
// If second argument is a floating-point number, it should round to the nearest integer.
// It should return a string of a rounded integer when the second argument is set to 0.
// If first argument is a whole integer and second argument is greater than 0, it should add a decimal and decimal digits that correspond with the precision length. 
// It should round up if the last digit is 5 or higher.
// It should round down if the last digit is 4 or lower.
// It should handle negative numbers in a traditional rounding sense (floor), not a financial rounding sense (ceiling). 
// It should handle exponential numbers.
// It should handle first arguments that the native toFixed() method is unable to accurately round.
// It should throw a RangeError if precision is over 100.


function betterRound(value, precision) {
  // If no second argument, default to 2.
  if (precision === undefined) {
    precision = 2;
  } else {
    precision = Math.round(Math.abs(precision));
  }

  var power = Math.pow(10, precision); 

  if (precision > 100) {
      throw new RangeError("Precision must be between 0 and 100");
  }

  // Convert to string for manipulation.
  value = String(value);

  // Get decimal index; if there is no decimal (index -1), set to value.length.
  var decimalIndex = value.indexOf('.');
  if (decimalIndex < 0) {
    decimalIndex = value.length;
  }

  // Grabs the substring on the left of the decimal 
  // and another substring on the right of the decimal.
  var wholeInteger = value.substring(0, decimalIndex);
  var decimalNumbers = value.substring(decimalIndex + 1);

  // Case 1: Zeroes handling (value does not require rounding).
  // If/while length of decimalNumbers is less than precision,  
  // keep adding zeroes (still string) until equal.
  if (decimalNumbers.length < precision) {
    while (decimalNumbers.length < precision) {
      decimalNumbers += '0';
    }
    value = [wholeInteger, decimalNumbers];
    var zeroesString = value.join('.');
    return zeroesString;
  }

  // Case 2: Value requires rounding.
  // Insert decimal in the correct place within the decimalNumbers substring; 
  // set to the variable.
  decimalNumbers = decimalNumbers.substring(0, precision) + '.' 
  + decimalNumbers.substring(precision);

  // Concatenate the wholeInteger and decimalNumbers substrings; 
  // use the number parametre.
  value = wholeInteger + decimalNumbers; 

  // Round the number result and divide by the power variable.
  value = Math.round(value) / power; 

  return value.toString(); 
}


tests({
  'It should return a string.': function() {
    var result = betterRound(1);
    eq(typeof result, "string");
  },
  'It should be able to accept a string as a first argument.': function() {
    var result = betterRound("1.256", 2);
    eq(result, "1.26");
  },
  'If second argument is greater than the provided decimal digits of the first argument, it should add zeroes accordingly.': function() {
    var result = betterRound(1.2, 5);
    eq(result, "1.20000");
  },
  'If no second argument, the number of decimal digits should default to 2.': function() {
    var result = betterRound(1.256);
    eq(result, "1.26");
  },
  'If second argument is a floating-point number, it should round to the nearest integer.': function() {
    var result = betterRound(1.234, 1.7);
    eq(result, "1.23");
  },
  'It should return a string of a rounded integer when the second argument is set to 0.': function() {
    var result = betterRound(1.256, 0);
    eq(result, "1");
  },
  'If first argument is a whole integer and second argument is greater than 0, it should add a decimal and decimal digits that correspond with the precision length.': function() {
    var result = betterRound(12, 3);
    eq(result, "12.000");
  },
  'It should round up if the last digit is 5 or higher.': function() {
    eq(betterRound(1.55, 1), "1.6");
    eq(betterRound(1.56, 1), "1.6");
    eq(betterRound(1.57, 1), "1.6");
    eq(betterRound(1.58, 1), "1.6");
    eq(betterRound(1.59, 1), "1.6");
  },
  'It should round down if the last digit is 4 or lower.': function() {
    eq(betterRound(1.54, 1), "1.5");
    eq(betterRound(1.53, 1), "1.5");
    eq(betterRound(1.52, 1), "1.5");
    eq(betterRound(1.51, 1), "1.5");
    eq(betterRound(1.50, 1), "1.5");
  },
  'It should handle negative numbers in a traditional rounding sense (floor), not a financial rounding sense (ceiling).': function() {
    eq(betterRound(-1.542), "-1.54"); 
  },
  'It should handle exponential numbers.': function() {
    eq(betterRound(1.005e2, 2), "100.50");
  },
  'It should handle first arguments that the native toFixed() method is unable to accurately round.': function() {
    eq(betterRound(0.615, 2), "0.62");
    eq(betterRound(10.235, 2), "10.24");
    eq(betterRound(1.005, 2), "1.01");
  }, 
  'It should throw a RangeError if precision is over 100.': function() {
    try {
      betterRound(1.23, 101);
    } catch(e) {
      eq(e instanceof RangeError, true);
    }
  }
});
</script>
