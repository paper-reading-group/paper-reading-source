---
title: MambaVision架构
categories: 论文精读
tags: [CV,Mamba,SSM,Transformer]
author: Ali Hatamizadeh, Jan Kautz
reader: 康怡楠
topic: 计算机视觉中的通用骨干网络设计
---

## 一.论文原本的架构

![屏幕截图 2026-04-09 200206](C:\Users\kangy\Pictures\Screenshots\屏幕截图 2026-04-09 200206.png)

可以看出来，MambaVision是一个混合架构，优先使用CNN快速得到早期特征，提取到局部细节，然后使用改造后的mamba建模，最后使用self attention补全上下文以及长距离理解



## 二.针对各个模块的分析

不同参数量的里面的模块数量是不同

| 模型版本              | N1(Stage1) | N2(Stage2) | N3(Stage3) | N4(Stage4) |
| --------------------- | ---------- | ---------- | ---------- | ---------- |
| MambaVision-Tiny (T)  | 2          | 2          | 8          | 2          |
| MambaVision-Small (S) | 2          | 2          | 12         | 2          |
| MambaVision-Base (B)  | 3          | 4          | 18         | 3          |
| MambaVision-Large (L) | 3          | 4          | 24         | 3          |

## **1>**stem

茎秆层主要的目的是将原本的RGB通道图转化为后续处理的张量，同时完成下采样

src中的实现

```
def __init__(self, in_chans=3, in_dim=64, dim=96):
        """
        Args:
            in_chans: number of input channels.
            dim: feature size dimension.
        """
        # in_dim = 1
        super().__init__()
        self.proj = nn.Identity()
        self.conv_down = nn.Sequential(
            nn.Conv2d(in_chans, in_dim, 3, 2, 1, bias=False),
            nn.BatchNorm2d(in_dim, eps=1e-4),
            nn.ReLU(),
            nn.Conv2d(in_dim, dim, 3, 2, 1, bias=False),
            nn.BatchNorm2d(dim, eps=1e-4),
            nn.ReLU()
            )
```

采用了采用了两层卷积下采样，将原本的维度从H * W * 3依次改为了H/2 * W/2 * C再到H/4 * W/4 *C

其中输出的通道数由模型大小决定

  indim:

- Tiny 系列：32
- 其他系列：64
- dim 是基础通道数（Stage 0 的通道数）
- Tiny: 80
- Small: 96
- Base: 128
- Large: 196

## **2>**ConVBlock

stem将图片转化为张量的形式之后就进行多次卷积以及总计两次降采样，这个地方比较常见，所以不多阐述，代码展示

```

    def __init__(self, dim,
                 drop_path=0.,
                 layer_scale=None,
                 kernel_size=3):
        super().__init__()

        self.conv1 = nn.Conv2d(dim, dim, kernel_size=kernel_size, stride=1, padding=1)
        self.norm1 = nn.BatchNorm2d(dim, eps=1e-5)
        self.act1 = nn.GELU(approximate= 'tanh')
        self.conv2 = nn.Conv2d(dim, dim, kernel_size=kernel_size, stride=1, padding=1)
        self.norm2 = nn.BatchNorm2d(dim, eps=1e-5)
        self.layer_scale = layer_scale
        if layer_scale is not None and type(layer_scale) in [int, float]:
            self.gamma = nn.Parameter(layer_scale * torch.ones(dim))
            self.layer_scale = True
        else:
            self.layer_scale = False
        self.drop_path = DropPath(drop_path) if drop_path > 0. else nn.Identity()

    def forward(self, x):
        input = x
        x = self.conv1(x)
        x = self.norm1(x)
        x = self.act1(x)
        x = self.conv2(x)
        x = self.norm2(x)
        if self.layer_scale:
            x = x * self.gamma.view(1, -1, 1, 1)
        x = input + self.drop_path(x)
        return x
```

## 3>MambaMixer+MLP

这个是主要的框架构成部分

#### 一·对于原本数据的处理

输入进来的(B,L,D):L对应视觉图的H和W转为长度为L的向量（不为H*W），D为维度数，实际上对应的就是原本的通道数，经过多次卷积这个地方已经变为了512

原本cnn对于图像的处理都是b*D * H *W，经过了一个window_partition函数（将原本的图像划分为一个一个窗口），然后将这个转化为了当前形状,这个在swin transformer中亦有记载

args:window_size:一个窗口的大小

第一个维度B:原本的batchsize* num_windows,  num_windows = (H/window_size)*(W/window_size)

第二个:window_size^2,即一个窗口的大小

这个时候就可以进入mambamix进行处理

#### 二·Mambamixer

##### 初始化阶段

因为mamba这个是分为两条路来进行的，所以在初始化的时候将原本的维度进行线性投影到原本两倍的维度，然后再进行分割开成两个，方便后面进入两个通道

同时为了保证计算的效率，选择了先降秩，再升秩

同时设计了一维的深度卷积来提取特征

##### 前向传播阶段

1.首先将上面输入的(B,L,D)进行线性投影变换，得到的是(B,L,2D)，为了适配卷积，将维度转化维(B,2D,L),再使用chunk进行分割,分为两个(B,D,L),相当于对于双通道的差分

2.接着对双分支采用深度卷积以及Silu激活函数，这个时候没有原本的Mamba的因果约束（即可以看到后面的，毕竟原本的mamba是用来做语言预测的，看到后面的也就没什么好预测的了）

![image-20260410153127015](C:\Users\kangy\AppData\Roaming\Typora\typora-user-images\image-20260410153127015.png)

3.现在都激活完之后左侧要做的就是ssm，实现的是mamba的输入依赖选择性机制，而这个“ssm”和原本的ssm是不同的

![image-20260411192233518](C:\Users\kangy\AppData\Roaming\Typora\typora-user-images\image-20260411192233518.png)

这个是ssm的公式，其中xt为当前输入，ht为隐藏状态，并且ABCD都在训练不断训练，最后固定的参数，对于不同的输入，使用相同的记忆权重处理，而mamba的选择性ssm的BC dt[t]怎是由输入的xt动态形成的，训练的是生成BC的权重，而不直接生成,这个就是选择性ssm强的地方

```
self.x_proj = nn.Linear(
            self.d_inner//2, self.dt_rank + self.d_state * 2, bias=False, **factory_kwargs
        )
```

```
x_dbl = self.x_proj(rearrange(x, "b d l -> (b l) d"))
        dt, B, C =  torch.split(x_dbl, [self.dt_rank, self.d_state, self.d_state], dim=-1)
```

上面的是将原本的x线性映射，下面则是映射后对其进行分割为这几个参数其中d_state作为隐藏层维度的大小，就是ht的

维度数，也相当于b,c的大小

```
y = selective_scan_fn(x, 
                              dt, 
                              A, 
                              B, 
                              C, 
                              self.D.float(), 
                              z=None, 
                              delta_bias=self.dt_proj.bias.float(), 
                              delta_softplus=True, 
                              return_last_state=None)
```

这个是ssm最核心的计算输出的步骤，前面实际上还有一堆rearrange的操作，这里都省去

这个主要做的就是从一个序列先进行离散化，然后一个位置一个位置进行扫描，然后每个位置都会有一个ht，

```
for t in range(196):
    # Step 1: 处理 dt
    dt_t = F.softplus(dt[:, :, t] + bias)  # (1, 256)
    # Step 2: 离散化 A
    A_discrete = torch.exp(dt_t.unsqueeze(-1) * A)  # (1, 256, 8)    
    # Step 3: 离散化 B
    B_discrete = dt_t.unsqueeze(-1) * B[:, :, t].unsqueeze(1)  # (1, 256, 8)
    
    # Step 4: 状态更新
    h = A_discrete * h + B_discrete * x[:, :, t].unsqueeze(-1)  # (1, 256, 8)
    # Step 5: 输出计算
    y[:, :, t] = torch.sum(C[:, :, t].unsqueeze(1) * h, dim=-1) + D * x[:, :, t]  # (1, 256)
```

所以这个里面的dt_t不同，则A,B _discreate不同，产生的h就不同，从而影响最后的输出y

到这个地方实际上就得到了输出y了，但是毕竟是两个拼接出来的，实际上这个还要做一个线性转换out_proj变为传进来的样子在传回去

经过了数次的Mamba之后就进入了MLP，这个使用的是timm库中导入的标准的全连接经过两层全连接以及Gelu激活，维度并没发生变化

## 4>自注意力

这个设计的和原本的self attention相同，只不过原本的是针对全局的做自注意力，这个是针对分的窗口来做，所以不在赘述

## 总结

其中stage1,2都为CNN进行快速提取特征，而3,4都采用了相同的基本结构，只是在层数设计上有所不同



