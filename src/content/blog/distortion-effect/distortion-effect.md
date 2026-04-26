---
title: '失真效果器的制作'
publishDate: 'Feb 17, 2022'
updatedDate: 'Feb 18, 2022'
description: '尝试自制失真效果器，希望以后演出的时候能用上自己亲手做的单块效果器'
tags:
  - 音乐
  - 电子
  - 乐队
  - 吉他
language: 'Chinese'
heroImage: { src: './thumbnail.png', color: '#9698C1' }
---

# 初次尝试

第一次开始尝试自制效果器还是在去年年底，在CSDN上找到了一个博主自制失真效果器的文章：[自制电吉他效果器 DIY](https://blog.csdn.net/qq_41342525/article/details/105127331)，便照着文章自己做了一下，电路板焊接还算成功，但是由于本身电路设计就很粗糙，最后测试音色感觉太干，不能拿去实际使用。

## 电路图绘制

采用**Altium Designer**软件，按照那位博主的电路图绘制。

![简单失真效果器电路图](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/circuit_1.png)

## PCB板绘制

其中有几个元件在原生库里没有封装，我自己画了封装，当时我还是第一次使用这个软件，过程还是蛮麻烦的。

![简单失真效果器PCB板图](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/PCB_1.png)

## PCB板打印&元件焊接

打印PCB板的厂家我选的是嘉立创，速度还行而且价格很便宜(甚至五张不超过10*10cm的样板免费)。

![简单失真效果器PCB空板](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/emptyboard_1.png)

由于之前有焊接电路板的经验，焊接过程可以说是轻车熟路，不到两个小时就焊完了并且没出什么差错。

![简单失真效果器电路板成品图1](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/board_1_1.png)

![简单失真效果器电路板成品图2](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/board_1_2.png)

插上电源，接上吉他的时候发现能正常工作，还是蛮开心的。但是音色确实不太行。所以我又萌生了复刻大厂经典效果器的想法。

---

# BOSS SD-1 Overdrive的复刻

BOSS在效果器行业的地位绝对是毋庸置疑的，并且发布于1981年的SD-1 Overdrive一直以来销量都很高，网络上也能找到现成的电路图，所以我选择先复刻这款经典效果器。

## 电路图绘制

![BOSS SD-1 Overdrive电路图](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/circuit_2.png)

## PCB板绘制

之前第一次尝试画PCB板的时候有很多设计得不好的地方，这次我逐一做了改进。

### 元件分层设计

这次在元件的分布上我采用了双层设计，除发光二极管以外的贴片元件都放在了bottom layer，直插元件都放在了top layer，这样更方便焊接，也能缩小板子的面积，给top overlay层留出更大的空间印图案。

### 电源、输入输出接口位置调整

上次我画的电源接口的位置属实下饭，离板子边缘还有不小距离，导致没办法设计装壳。于是这次我专门等元件都到货之后再开始画封装和PCB板，量好各个元件的尺寸后将电源、输入输出接口的位置都调整到了板子边缘，方便装壳。

### 最终效果

![BOSS SD-1 Overdrive PCB Diagram Top Layer](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/PCB_2_top.png)

![BOSS SD-1 Overdrive PCB Diagram Bottom Layer](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/PCB_2_bottom.png)

## PCB板打印&元件焊接

依旧嘉立创(免费打样+包邮，着实令人感动)。

![BOSS SD-1 Overdrive PCB实物Top Layer](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/emptyboard_2_top.png)

![BOSS SD-1 Overdrive PCB实物Bottom Layer](https://greatbastard-blog-1309491218.cos.ap-chengdu.myqcloud.com/img/Articles/Distortion_Effector/emptyboard_2_bottom.png)

---

# 暂停说明

最近这段时间一直在忙网页建设的事，板子到手后只焊了十个电阻，等我把bug改完就会继续开焊喽，到时候再继续更新这篇文章。