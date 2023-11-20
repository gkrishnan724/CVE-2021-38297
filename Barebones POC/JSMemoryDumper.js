function byteArrayToHexString(byteArray) {
    return Array.prototype.map.call(byteArray, function(byte) {
        return '\\x' + ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
}


function readStringFromMemory(offset, length) {
    const memoryBuffer = new Uint8Array(goExp.mem.buffer, offset, length);
    return byteArrayToHexString(memoryBuffer)
}

function convertHexToAscii(hexString) {
    // Remove the leading \x and split the string by \x
    const hexArray = hexString.replace(/\\x/g, '').match(/.{1,2}/g);
    
    // Convert each pair of hex digits to its ASCII equivalent
    const asciiString = hexArray.map(hex => String.fromCharCode(parseInt(hex, 16))).join('');
  
    return asciiString;
  }
  

function initWasm(argv) {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch('main.wasm'), go.importObject).then((result) => {
        go.argv = ['main.wasm',argv]; //Pass argv
        go.run(result.instance);
        console.log(result.instance.exports);
        goExp = result.instance.exports;
    });
}


function createAs(length) {
    let str = ""
    for (let i=0;i<length;i++){
        str += "A"
    }
    return str;
}