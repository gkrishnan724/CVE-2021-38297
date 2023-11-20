package main

import (
	"encoding/binary"
	"fmt"
	"os"
	"syscall/js"
	"unsafe"
)

var data2 = "Hello word"
var secretPtr = 0x5000

func clen(n []byte) int {
	for i := 0; i < len(n); i++ {
		if n[i] == 0 {
			return i
		}
	}
	return len(n)
}

func gopal(this js.Value, p []js.Value) interface{} {
	if len(p) != 2 {
		return "Please provide two numbers"
	}

	num1 := p[0].Float()
	num2 := p[1].Float()

	result := num1 + num2
	return result
}

func checkData(this js.Value, p []js.Value) interface{} {
	fmt.Print(data2)
	return data2
}

func ptrToString(ptr uintptr) string {
	p := unsafe.Pointer(ptr)
	return *(*string)(p)
}

func secret(this js.Value, pjs []js.Value) interface{} {

	bs := make([]byte, 0x20)

	ptr := unsafe.Pointer(uintptr(secretPtr))
	p := (*uint32)(ptr)
	binary.LittleEndian.PutUint32(bs, *p)
	bs[0x4] = 0
	fmt.Printf("Type: %T, Ptr: %v, Val: 0x%x,\n", p, p, *p)

	fmt.Printf("PRint BS %s\n", bs)
	fmt.Printf("printed\n")

	stringSecret := string(bs[:clen(bs)])
	fmt.Printf("StringSecret %s\n", stringSecret)

	return 2
}

func printArgsLocation() interface{} {
	fmt.Printf("Os args at (%p), Global data2(ptr,val) at (%p, %s)", &os.Args, &data2, data2)
	fmt.Println(len(os.Args), os.Args)
	fmt.Println(data2)
	for addr := 0x1000; addr < 0x1f000; addr += 8 {
		ptr := unsafe.Pointer(uintptr(addr))
		p := (*uint64)(ptr)
		if (*p) != 0 {
			bs := make([]byte, 8)
			binary.LittleEndian.PutUint64(bs, *p)
			fmt.Printf("Type: %T, Ptr: %v, Val: 0x%x, %s\n", p, p, *p, bs)
		}
	}
	return os.Args
}

func registerCallbacks() {
	js.Global().Set("add", js.FuncOf(gopal))
	js.Global().Set("printGlobal", js.FuncOf(checkData))
	js.Global().Set("printSecret", js.FuncOf(secret))
}

func main() {
	c := make(chan struct{}, 0)

	fmt.Println("Go WebAssembly Initialized")
	registerCallbacks()
	printArgsLocation()

	<-c
}
