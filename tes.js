const a = 'valuee';
const split = a.split('');
const c = split[0];
split.splice(0,1);
split.unshift(c.toUpperCase());
const d = split.join('').toString()
console.log(d);