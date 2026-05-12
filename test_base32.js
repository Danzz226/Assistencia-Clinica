const base32 = require('thirty-two');
console.log(base32.encode(Buffer.from([1])).toString());
