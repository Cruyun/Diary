package main

import (
	"fmt"
)

// append
var runes []rune

func main() {
	for _, r := range "hello, world" {
		runes = append(runes, r)
	}
	fmt.Printf("%q\n", runes) // "['H' 'e' 'l' 'l' 'o' ',' ' ' '世' '界']"
}