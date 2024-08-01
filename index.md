# 安装到根目录

```zsh
ni -w xxx
```

# 为指定包安装本地依赖

源仓库 vue
本仓库 vue-core

```zsh
# shared 包 安装到 reactivity 包中
ni @vue-core/shared --workspace --filter @vue-core/reactivity
```
