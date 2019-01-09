# 进程间通信：互斥与同步

**互斥**：确保一个进程在使用一个共享变量或文件时，其他进程不能做同样的操作。

 - 需要对共享资源进行保护，数据一致性问题
 - 如果处理方式不当，会造成
  - 死锁问题：多个进程互不相让，都不能得到足够的资源
  - 饥饿问题：一个进程总是得不到资源，其他进程轮流占用资源
  - 数据一致性问题

 **同步：**多个进程协作的问题

- 通过什么机制在进程间通信？
- 进程因为同步，状态应如何维护？
- 同步策略不当，依然有可能造成死锁和饥饿

## 忙等待的互斥及其解决办法
**临界区：**对共享内存的程序片段

### 1. 软件方法（应用程序员）
1. 锁变量：设置一个共享锁（初始值为0），当一个进程想进入临界区时，它首先测试这把锁，如果锁的值为0，则该进程将其设置为1并进入临界区。若这把锁已经为1，则等待其值变为0。该方法有疏漏。
2. 严格轮换法：强制两个进程轮流进入临界区

```
// Process A:
while (TRUE) {
	while( turn != 0 ); // 忙等待
	critical_region();
	turn = 1;
	noncritical_region();
}

// Process B:
while (TRUE) {
	while( turn != 1 );
	critical_region();
	turn = 0;
	noncritical_region();
}
```

忙等待：连续测试一个变量直至某个值出现为止。

`turn`是一个公共变量，描述谁能进入临界区。进入临界区之前，循环检测 turn 的值。退出临界区时，将 turn 设为0；

2. Perterson 解法
采用双标志，增加一个全局变量 turn 来标志轮到谁进入临界区了

```
// Process A
flag[0] = TRUE;
turn = 1;
while(flag[1] && turn == 1);
critical section
flag[0] = FALSE;
remainder section

// Process B
flag[1] = TRUE;
turn = 0;
while(flag[0] && turn == 0);
critical section
flag[1] = FALSE;
remainder section
```

### 2. 硬件方法（处理器设计者）
1. 屏蔽中断：使每个进程在刚刚进入临界区后立刻屏蔽所有中断，并在离开之前再打开终端。屏蔽中断后，时钟中断也会被屏蔽。
2. TSL指令：test and set lock 具有原子性
将一个内存字 lock 读入寄存器RX中，然后在该内存地址存一个非零值。当 lock 为零时，任何进程都可以使用TSL指令将其设置为1，并读写共享内存。当操作结束时，进程用一条普通的 move 指令将 lock 的值重新设置为0。

### 3. 信号量方法（操作系统）
信号量的概念在1965年由学者Dijkstra提出，本质上是一个**整型值**。其特殊性在于它的值只能被”初始化“和PV两个原语操作所修改，用于实现进程的互斥与同步。

信号量的定义：

```
Typedef struct {
	int count;
	Pointer PCB Queue;
} Semaphore;
```

Count一般初始化为一个非负整数。若为非负整数，则表示当前空闲资源的数量，若为负数，则其绝对值表示当前等待进程的数量。

**mutex：**一种特殊的二值信号量，对信号量的解锁和上锁的进程必须是同一个。

#### 用信号量实现同步与互斥：生产者-消费者问题
设置三个信号量，一个称为`full`，用来记录充满的缓冲槽数目；一个称为`empty`，记录空的缓冲槽的数目；一个称为`mutex`，用来确保生产者和消费者不会同时访问缓冲区。

```
#define N 100
typedef int semaphore;
semaphore mutex = 1;
semaphore full = 0;
semaphore empty = N;

void producer() {
  int item;
  while (true) {
    item = produce_item();
    down(&empty);
    down(&mutex);
    insert_item(item);
    up(&mutex);
    up(&full);
  }
}

void consumer() {
  int item;
  while (true) {
    down(&full);
    down(&mutex);
    item = remove_item();
    up(&mutex);
    up(&empty);
    consume_item(item);
  }
}
```

## 经典进程同步问题
### 读者-写者问题
允许多个“读者”同时读数据，只允许一个”写者“写数据，当有写者正在写入数据时，不允许读者读数据

根据阻塞的策略不同：

- 读者优先：仅当所有读者从临界区退出，方可允许写者写入
- 写者优先：仅当所有写者从临界区退出，方可允许读者读取

互斥需求：

- “读-写”互斥
- “写-写”互斥
- “读-读”允许同时进入临界区


#### 第一类：读者优先

信号量的设计：

- 首先，保证读者与写者的互斥，引入信号量db
- 其次，因为允许多个读者进入临界区，需要记录进入临界区的读者的数量，进入信号量 rc
- 为保证多个读者对 rc 更新的会ill，引入信号量 mutex


只要有读者，写者就等待

```
// reader

While (TRUE) {
	down(&mutex); // 获得对 rc 的互斥访问权
	rc = rc + 1; // 现在多了一个读者
	if (rc == 1) down(&db); // 如果这是第一个读者
	up(&mutex); // 释放对 rc 的互斥访问权
	read_data(); // 读取数据
	down(&mutex); // 获得对 rc 的互斥访问权
	rc = rc - 1; // 读者访问完毕
	if (rc == 0) up(&db); // 如果这是最后一个读者，就可以唤醒写者
	up(&mutex); // 释放对 rc 的互斥访问权
	use_data_read; // 非临界区
}


// writer
While (TRUE) {
	think_up_data(); // 非临界区
	down(&db);
	write_data();
	up(&db);
}
```

#### 第二类：写者优先

- 当有写者的请求到来时，跳到正在等待的其他读者之前执行，之后到达的读者也需要等待
- 如果在写的过程中有新的写者到达，优先服务写者，等待中的读者需要等待所有写者完成操作

### 哲学家就餐问题

```
#define N 5
#define LEFT (i+N-1)%N
#define RIGHT (i+1)%N
#define THINKING 0 // 哲学家在思考
#define HUNGRY 1 // 哲学家企图拿起筷子
#define EATING 2
typedef int semaphore;
semaphore mutex = 1; // 临界区的互斥
int state[N]; // 各个哲学家的状态
semaphore s[N]; // 每个哲学家一个信号量

// 每个哲学家的主进程
void philosopher() {
  while(TRUE) {

  }
}

// 非单独进程
void take_forks(int i) {
  down(&mutex); // 进入临界区
  state[i] = HUNGRY; // 记录哲学家 i 处于饥饿状态
  test(i); // 尝试获取第二把叉子
  up(&mutex); // 离开临界区
  down(&s[i]); // 如果得不到需要的叉子就阻塞
}

void put_forks(int i) {
  down(&mutex); // 进入临界区
  state[i] = THINKING; // 已经就餐完毕
  test(LEFT); // 检查左边的哲学家可以吃吗
  test(RIGHT); // 检查右边的哲学家可以吃吗
  up(&mutex); // 离开临界区
}

void test(int i) {
  if (state[i] == HUNGRY && state[LEFT] != EATING && state[RIGHT] != EATING) {
    state[i] = EATING;
    up(&s[i]);
  }
}
```
