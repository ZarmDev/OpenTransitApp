const TI = ["1", "2", "3", "4", "5", "6", "7", "7d", "a", "b", "c", "d", "e", "f", "g", "h", "j", "l", "m", "n", "q", "r", "s", "sf", "sir", "sr", "w", "z"]
var requireStatements = '';
for (var i = 0; i < TI.length; i++) {
  requireStatements += `require('../../assets/images/svg/${TI[i]}.svg'), \n`
}
var test = `[${requireStatements}]`
console.log(test);