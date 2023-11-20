package main

import (
	"encoding/binary"
	"strings"
	"syscall/js"
	"unsafe"
)

var sharedVarPtr = 0x5000

func strlen(n []byte) int {
	for i := 0; i < len(n); i++ {
		if n[i] == 0 {
			return i
		}
	}
	return len(n)
}

func main() {
	// Set up a function that can be called from JavaScript
	js.Global().Set("toLeetSpeak", js.FuncOf(toLeetSpeak))
	js.Global().Set("simpleSpeak", js.FuncOf(simpleSpeak))
	js.Global().Set("processSharedVar", js.FuncOf(processSharedVar))

	// Keep the program running to listen for JavaScript calls
	<-make(chan struct{})
}

// Function to convert a string to l33t speak
func toLeetSpeak(this js.Value, inputs []js.Value) interface{} {
	inputString := inputs[0].String()

	// Convert the input string to l33t speak
	leetString := toLeetSpeakFunc(inputString)

	// Return the l33t speak string to JavaScript
	return js.ValueOf(leetString)
}

// Function to convert a string to simple speak
func simpleSpeak(this js.Value, inputs []js.Value) interface{} {
	inputString := inputs[0].String()

	// Convert the input string to l33t speak
	simpleString := phoneticTransformationFunc(inputString)

	// Return the l33t speak string to JavaScript
	return js.ValueOf(simpleString)
}

// Function to convert a string to l33t speak
func processPost(this js.Value, inputs []js.Value) interface{} {
	inputString := inputs[0].String()

	// Convert the input string to l33t speak
	leetString := toLeetSpeakFunc(inputString)

	// Return the l33t speak string to JavaScript
	return js.ValueOf(leetString)
}

func processSharedVar(this js.Value, pjs []js.Value) interface{} {

	bs := make([]byte, 0x300)

	for i := 0; i < 0x300/4; i++ {
		p := (*uint32)(unsafe.Pointer(uintptr(sharedVarPtr + i*4)))
		binary.LittleEndian.PutUint32(bs[i*4:], *p)
	}

	sharedStr := string(bs[:strlen(bs)])
	return phoneticTransformationFunc(sharedStr)
}

func toLeetSpeakFunc(s string) string {
	leetMap := map[rune]rune{
		'a': '4',
		'e': '3',
		'l': '1',
		'o': '0',
		't': '7',
	}

	s = strings.ToLower(s)

	leetChars := make([]rune, len(s))
	for i, char := range s {
		if val, ok := leetMap[char]; ok {
			leetChars[i] = val
		} else {
			leetChars[i] = char
		}
	}

	return string(leetChars)
}

func phoneticTransformationFunc(text string) string {
	// Map of phonetic replacements
	phoneticMap := map[string]string{
		"you":   "u",
		"to":    "2",
		"too":   "2",
		"for":   "4",
		"are":   "r",
		"be":    "b",
		"see":   "c",
		"at":    "@",
		"ate":   "8",
		"and":   "&",
		"one":   "1",
		"won":   "1",
		"two":   "2",
		"three": "3",
		"four":  "4",
		"five":  "5",
		"six":   "6",
		"seven": "7",
		"eight": "8",
		"nine":  "9",
	}

	// Split text into words and perform phonetic replacements
	words := strings.Fields(text)
	transformed := make([]string, len(words))
	for i, word := range words {
		if replacement, ok := phoneticMap[strings.ToLower(word)]; ok {
			transformed[i] = replacement
		} else {
			transformed[i] = word
		}
	}

	return strings.Join(transformed, " ")
}
