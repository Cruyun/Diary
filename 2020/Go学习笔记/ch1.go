// 1.2
// for 循环在字符串或 slice 数据上迭代
package main

import (
	"fmt"
	"os"
)

func main() {
	s, sep := "", ""
	// Go 不允许无用的临时变量，所以使用空标识符_
	for _, arg := range os.Args[1:] {
		s += sep + arg
		sep = " "
	}
	fmt.Println(s)
}

// 1.3 找出重复行
package main

import (
	"bufio"
	"fmt"
	"os"	
)

func main() {
	counts := make(map[string]int) // 内置的函数 make 可以永凯新建 map
	input := bufio.NewScanner(os.Stdin)
	for input.Scan() {
		counts[input.Text()]++
	}
	for line, n := range counts {
		if n > 1 {
			fmt.Println("%d\t%s\n", n, line)
		}
	}
}

// 读取文件 os.Open()

package main

import (
	"bufio"
	"fmt"
	"os"	
)

func main() {
	counts := make(map[string]int)
	files := os.Args[1:]
	if len(files) == 0 {
		countLines(os.Stdin, counts)
	} else {
		for _, args := range files {
			// 返回两个值，第一个是打开的文件*os file
			// 第二个是内置的 error 乐享的值，如果 err等于特殊的内置值 nil，标准文件成功打开
			f, err := os.Open(arg)
			if err != nill {
				fmt.Fprintf(os.Stderr, "dup2:%v\n", err)
				continue
			}
			countLines(f, counts)
			f.Close()
		}
	}
	for line, n := range counts {
		if n > 1 {
			fmt.Println("%d\t%s\n", n, line)
		}
	}
}

func countLines(f *os.File, counts map[string]int) {
	input := bufio.NewScanner(f)
	for input.Scan() {
		counts[input.Text()]++
	}
}

// dup3 很少使用
// 一次读取整个输入到大块内存，一次性分割所有行，然后处理这些行
// 引用一个 Readfile 函数（从 io/ioutil包）
package main

import (
	"io/ioutil"
	"fmt"
	"os"
	"strings"
)

func main() {
	counts := make(map[string]int)
	for _, filename := range os.Args[1:] {
		// Readfile 函数返回一个可以转换成字符串的字节 slice，这样可以被 Split 分割
		data, err := ioutil.Readfile(filename)
		if err != nil {
			fmt.Fprintf(os.Stderr, "dup3: %v\n", err)
			continue
		}
		for _, line := range strings.Split(string(data), "\n") {
			counts[line]++
		}
	}
	for line, n := range counts {
		if n > 1 {
			fmt.Println("%d\t%s\n", n, line)
		}
	}
}

// 1.5 获取一个 url
// http.Get 产生一个 HTTP 请求
// resp.status 找到状态码
package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

func main() {
	for _, url := range os.Args[1:] {
		resp, err := http.Get(url)
		if err != nil {
			fmt.Fprintf(os.Stderr, "fetch: %v\n", err)
			os.Exit(1)
		}
		b, err := ioutil.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "fetch: reading %s:%v\n", url, err)
			os.Exit(1)
		}
		fmt.Printf("%s", b)
	}
}

// 并发获取多个 url
package main

import (
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"
)

func main() {
	start := time.Now()
	ch := make(chan string)
	for _, url := range os.Args[1:] {
		go fetch(url, ch) // 启动一个 goroutine
	}
	for range os.Args[1:] {
		fmt.Println(<-ch) // 从通道 ch 获取
	}
	fmt.Printf("%.2fs elapased\n", time.Since(start).Seconds())
}

func fetch(url string, ch char<- string) {
	start := time.Now()
	resp, err := http.Get(url)
	if err != nil {
		ch <- fmt.Sprint(err)
		return
	}

	nbytes, err := io.Copy(ioutil.Discard, resp.Body)
	resp.Body.Close()
	if err != nil {
		ch <- fmt.Sprint("while reading %s: %v", url, err)
		return
	}
	secs := time.Since(start).Seconds()
	ch <- fmt.Sprint("%.2fs %7d %s", secs, nbytes, url)
}
