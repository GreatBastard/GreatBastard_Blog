---
title: 'Radix-4 R2C DIT-FFT and C2R DIT-IFFT'
publishDate: 'Apr 27, 2026'
updatedDate: 'Apr 27, 2026'
description: '一种加速实信号FFT/IFFT的算法'
tags:
  - 音频算法
language: 'Chinese'
heroImage: { src: 'https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/r2c-fft/cover.png', inferSize: true }
---

# 数学原理
## Complex to Complex (C2C) DIT-FFT
对于N点序列$x[n]$，它的离散傅里叶变换 Discrete Fourier Transform (DFT) 为
$$
X[k]=\sum_{n=0}^{N-1}x[n]e^{-j2\pi \frac{kn}{N}}=\sum_{n=0}^{N-1}x[n]W_{N}^{kn},\ k=0,\ 1,\ \dots,\ N-1
$$
将$x[n]$按奇偶索引拆分为两个长度为$M=N/2$的子序列：
$$
x_{{e}}[n]=x[2n],\ x_{o}[n]=x[2n+1],\ n=0,\ 1,\ \dots,\ M-1
$$
则它的DFT可以表示为
$$
\begin{aligned}
X[k]&=\sum_{n=0}^{N/2-1}x[2n]e^{-j2\pi k\frac{2n}{N}}+\sum_{n=0}^{N/2-1}x[2n+1]e^{-j2\pi k\frac{2n+1}{N}} \\
&=\sum_{n=0}^{M}x_{e}[n]e^{-j2\pi \frac{kn}{M}}+e^{-j2\pi\frac{k}{N}}\sum_{n=0}^{M}x_{o}[n]e^{-j2\pi \frac{kn}{M}} \\
&=\sum_{n=0}^{M}x_{e}[n]W_{M}^{kn}+W_{N}^{k}\sum_{n=0}^{M}x_{o}[n]W_{M}^{kn} \\
&=E[k]+W_{N}^{k}O[k],\ k=0,\ 1,\ \dots,\ M-1
\end{aligned}
$$
由于周期性$E\left[ k+\frac{n}{2} \right]=E[k],\  O\left[ k+\frac{n}{2} \right]=O[k]$与对称性$W_{N}^{k+2/N}=-W_{N}^{k}$，有
$$
X[k+M]=E[k]-W_{N}^{k}O[k],\ k=0,\ 1,\ \dots,\ M-1
$$

## Real to Complex (R2C) DIT-FFT
由于音频信号都是实信号（虚部均为0），将其当成复信号计算 FFT 时会产生很多不必要的冗余计算。<br>
可以将N点输入实序列$x[n]$按奇偶索引拆分为两个长度为$M=N/2$的子序列：
$$
x_{{e}}[n]=x[2n],\ x_{o}[n]=x[2n+1],\ n=0,\ 1,\ \dots,\ M-1
$$
然后用偶数索引项作为实部，奇数索引项作为虚部，构造一个复序列：
$$
z[n]=x_{{e}}[n]+jx_{{o}}[n],\ n=0,\ 1,\ \dots,\ M-1
$$
对这个复序列做$M$点复DFT：
$$
Z[k]=\sum_{n=0}^{M-1}z[n]W_{M}^{kn}=E[k]+jO[k],\ k=0,\ 1,\ \dots,\ M-1\quad ①
$$
由于$x_{e}$和$x_{o}$都是实序列，故
$$
E^{*}[k]=E[M-k],\ O^{*}[k]=O[M-k],\ k=1,\ 2,\ \dots,\ M-1
$$
其中特殊点$E[0],O[0]$需要单独计算。<br>
又
$$
Z[M-k]=E[M-k]+jO[M-k]=E^{*}[k]+jO^{*}[k]
$$
$$
Z^{*}[M-k]=E[k]-jO[k],\ k=1,\ 2,\ \dots,\ M-1\quad ②
$$
① + ②得
$$
E[k]=\frac{1}{2}(Z[k]+Z^{*}[M-k]),\ k=1,\ 2,\ \dots,\ M-1
$$
① - ②得
$$
O[k]=-\frac{j}{2}(Z[k]-Z^{*}[M-k]),\ k=1,\ 2,\ \dots,\ M-1
$$
故
$$
\begin{aligned}
X[k]&=E[k]+W_{N}^{k}O[k] \\
&=\frac{1}{2}[(Z[k]+Z^*[M-k])-jW_{N}^{k}(Z[k]-Z^*[M-k])],\ k=1,\ 2,\ \dots,\ M-1
\end{aligned}
$$
又由于实数序列DFT的共轭对称性，有
$$
X[N-k]=X^*[k],\ k=1,\ 2,\ \dots,\ M-1
$$
两个特殊点
$$
\begin{aligned}
X[0]&=E[0]+O[0] \\
&=\mathrm{Re}\{Z[0]\}+\mathrm{Im}\{Z[0]\} \\
X[M]&=E[M]+W_{N}^{M}O[M] \\
&=E[0]-O[0] \\
&=\mathrm{Re}\{Z[0]\}-\mathrm{Im}\{Z[0]\}
\end{aligned}
$$
故有

$$X[0]=\mathrm{Re}\{Z[0]\}+\mathrm{Im}\{Z[0]\}, k=0$$

$$X[k]=\frac{1}{2}[(Z[k]+Z^*[M-k])-jW_{N}^{k}(Z[k]-Z^*[M-k])], k=1,\ 2,\ \dots,\ \frac{N}{2}-1$$

$$X[k]=\mathrm{Re}\{Z[0]\}-\mathrm{Im}\{Z[0]\}, k=\frac{N}{2}$$

$$X[k]=X^*[N-k], k=\frac{N}{2}+1,\ \frac{N}{2}+2,\ \dots,\ N-1$$

由此得到，要对$N$点实数序列做DFT时，可将这个实数序列当作一个$\frac{N}{2}$点的复序列，对这个复序列进行$\frac{N}{2}$点DFT，再由上式还原得到原本要求的$N$点DFT。<br>
## Complex to Real (C2R) IFFT
对于音频信号这样一个实信号，它的频域信号是具有共轭对称性的：
$$
X[N-k]=X[k]^*,\ k=1,\ 2,\ ,\dots,\ N-1
$$
故频谱信息只有一半是不重复的，也可以进行计算优化。前面 C2C DIT-FFT 的内容提到，将按奇偶索引拆分为两个长度为$M=N/2$的子序列后带入DFT定义可得
$$
\begin{aligned}
X[k]&=E[k]+W_{N}^{k}O[k],\ k=0,\ 1,\ \dots,\ M-1 \\
X[k+M]&=E[k]-W_{N}^{k}O[k],\ k=0,\ 1,\ \dots,\ M-1
\end{aligned}
$$
从这两个式子中反解得到$E[k]$和$O[k]$：
$$
\begin{aligned}
E[k]&=\frac{X[k]+X[k+M]}{2},\ k=0,\ 1,\ \dots,\ M-1 \\
O[k]&=\frac{X[k]-X[k+M]}{2W_{N}^{k}},\ k=0,\ 1,\ \dots,\ M-1
\end{aligned}
$$
然后根据FFT与IFFT的线性性质，我们就只需要构造复序列：
$$
T[k]=E[k]+jO[k]
$$
再对其进行$N/2$点IFFT：
$$
x[n]=\text{IFFT}\{T[k]\}=x_{e}[n]+jx_{o}[n],\ k=0,\ 1,\ \dots,\ M-1
$$
就得到了实部为时域偶数索引项，虚部为时域奇数索引项的复数信号，由于本身该算法在存储复数时实部和虚部就是交替存储的，得到的复数信号同时也是时域的实数信号，无需进行后处理。<br>
## Radix-4 DIT-FFT
本身我们需要做的是128点实数 FFT和复数IFFT，通过R2C和C2R的处理转化成了64点复数 FFT/IFFT，而由于64恰好是4的整数次幂，因此可将常用的 Radix-2 64点 FFT 改为Radix-4 64点 FFT，可将蝶形运算层数从6层缩减至3层，大幅减少循环次数与函数调用次数。<br>
设序列$x[n]$的长度$N=4^m$，通过抽取将$x[n]$分为四个长度为$\frac{N}{4}$的子序列如下：
$$
\begin{aligned}
x_{1}[n]&=x[4n] \\
x_{2}[n]&=x[4n+1] \\
x_{3}[n]&=x[4n+2] \\
x_{4}[n]&=x[4n+3]
\end{aligned}
$$
则$x[n]$的DFT可表示为
$$
\begin{aligned}
X[k] & =\sum_{n=0}^{N-1}x[n]W_N^{nk} \\
 & =\sum_{n=0}^{N/4-1}x[4n]W_N^{4nk}+\sum_{n=0}^{N/4-1}x[4n+1]W_N^{(4n+1)k}+\sum_{n=0}^{N/4-1}x[4n+2]W_N^{(4n+2)k}+\sum_{n=0}^{N/4-1}x[4n+3]W_N^{(4n+3)k} \\
 & =\sum_{n=0}^{N/4-1}x[4n]W_{N/4}^{nk}+\sum_{n=0}^{N/4-1}x[4n+1]W_{N/4}^{nk}W_N^k+\sum_{n=0}^{N/4-1}x[4n+2]W_{N/4}^{nk}W_N^{2k}+\sum_{n=0}^{N/4-1}x[4n+3]W_{N/4}^{nk}W_N^{3k} \\
 & =\sum_{n=0}^{N/4-1}x_1[n]W_{N/4}^{nk}+\sum_{n=0}^{N/4-1}x_2[n]W_{N/4}^{nk}W_N^k+\sum_{n=0}^{N/4-1}x_3[n]W_{N/4}^{nk}W_N^{2k}+\sum_{n=0}^{N/4-1}x_4[n]W_{N/4}^{nk}W_N^{3k} \\
 & =X_1[k]+W_N^kX_2[k]+W_N^{2k}X_3[k]+W_N^{3k}X_4[k]
\end{aligned}
$$
其中，$X_{1}(k),\ X_{2}(k),\ X_{3}(k),\ X_{4}(k)$ 分别为$x_{1}[n],\ x_{2}[n],\ x_{3}[n],\ x_{4}[n]$ 的$\frac{N}{4}$点DFT，$k=1,\ 2,\ \dots,\ \frac{N}{4}-1$<br>
对于$k=\frac{N}{4}-1$之后的$X[k]$计算过程如下：
$$
\begin{aligned}
X[k+N/4]&=X_{1}[k]+W_{N}^{k+N/4}X_{2} [k]+W_{N}^{2(k+N/4)}X_{3}[k]+W_{N}^{3(k+N/4)}X_{4}[k] \\
&=X_{1}[k]-jW_{N}^{k}X_{2}[k]-W_{N}^{2k}X_{3}[k]+jW_{N}^{3k}X_{4} [k] \\
X[k+2N/4]&=X_{1}[k]+W_{N}^{k+2N/4}X_{2} [k]+W_{N}^{2(k+2N/4)}X_{3}[k]+W_{N}^{3(k+2N/4)}X_{4}[k] \\
&=X_{1}[k]-W_{N}^{k}X_{2}[k]+W_{N}^{2k}X_{3}[k]-W_{N}^{3k}X_{4}[k] \\
X[k+3N/4]&=X_{1}[k]+W_{N}^{k+3N/4}X_{2} [k]+W_{N}^{2(k+3N/4)}X_{3}[k]+W_{N}^{3(k+3N/4)}X_{4}[k] \\
&=X_{1}[k]+jW_{N}^{k}X_{2}[k]-W_{N}^{2k}X_{3}[k]-jW_{N}^{3k}X_{4}[k]
\end{aligned}
$$
用图表示上述过程：
![Fig-1](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/r2c-fft/Fig-1.png)
我们可以继续用上述的方法将每个子序列继续划分，直到最后序列长度为4。4点的DFT计算如下：
$$
\begin{bmatrix}{X[0]}\\ {X[1]}\\ {X[2]}\\ {X[3]}\end{bmatrix}=\begin{bmatrix}{1}&{1}&{1}&{1}\\ {1}&-{j}&-{1}&-{j}\\ {1}&-{1}&{1}&-{1}\\ {1}&{j}&-{1}&{j}\end{bmatrix}\cdot\begin{bmatrix}{x[0]}\\ {x[1]}\\ {x[2]}\\ {x[3]}\end{bmatrix}
$$