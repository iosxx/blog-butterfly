---
title: 终于完成hexo自动首图封面了
urlname: zpav84nkg2mwbthp
date: '2025-07-11 09:09:58'
updated: '2025-07-11 09:41:25'
cover: 'https://cdn.nlark.com/yuque/0/2025/jpeg/40683968/1752198072914-087533c9-66fe-4b75-a115-1274f2401748.jpeg'
description: '不理解为什么这么多人用都没有自动首图封面这个功能，百度搜了好久都没见到，最后害得我自己出马，以下是过程，我自己也保存记录位置:/theme/butterfly/scritps/fliter/random_cover.js (其他主题自己找位置)/**  * Random cover for p...'
---
![](https://cdn.jsdmirror.com/gh/iosxx/blog@posts/img/2cc0f7b1171a85f099dccd8ed84abac7.jpeg)

不理解为什么这么多人用都没有自动首图封面这个功能，百度搜了好久都没见到，最后害得我自己出马，以下是过程，我自己也保存记录

位置:

/theme/butterfly/scritps/fliter/random_cover.js

 (其他主题自己找位置)



```plain
/**
 * Random cover for posts
 */

'use strict'

hexo.extend.generator.register('post', locals => {
  // 用于记录最近使用的封面索引
  const recentIndexes = []
  // 最大历史记录长度
  let maxHistorySize = 3

  const getRandomCover = defaultCover => {
    if (!defaultCover) return false
    if (!Array.isArray(defaultCover)) return defaultCover

    const coverCount = defaultCover.length
    if (coverCount === 1) return defaultCover[0]

    // 动态计算最大历史记录长度
    maxHistorySize = Math.min(coverCount - 1, 3)
    
    // 创建可用索引池
    const availableIndexes = []
    for (let i = 0; i < coverCount; i++) {
      if (!recentIndexes.includes(i)) {
        availableIndexes.push(i)
      }
    }

    // 从可用池中随机选择
    const randomIndex = availableIndexes.length > 0
      ? availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
      : Math.floor(Math.random() * coverCount)

    // 更新历史记录
    recentIndexes.push(randomIndex)
    if (recentIndexes.length > maxHistorySize) {
      recentIndexes.shift()
    }

    return defaultCover[randomIndex]
  }

  // 提取文章内容中的第一张图片
  const extractFirstImage = content => {
    if (!content) return null
    
    // 匹配Markdown图片语法
    const mdRegex = /!\[.*?\]\((.*?)\)/
    const mdMatch = content.match(mdRegex)
    if (mdMatch && mdMatch[1]) return mdMatch[1]
    
    // 匹配HTML img标签
    const htmlRegex = /<img\s+.*?src=['"](.*?)['"]/
    const htmlMatch = content.match(htmlRegex)
    if (htmlMatch && htmlMatch[1]) return htmlMatch[1]
    
    return null
  }

  // 处理防盗链图片 - 替换为本地路径或代理
  const processAntiLeechImage = (url, postPath) => {
    const imgTestReg = /\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i
    
    // 如果是相对路径，转换为绝对路径
    if (url.startsWith('/')) {
      return url;
    }
    
    // 如果是本地图片且开启了post_asset_folder
    if (hexo.config.post_asset_folder && 
        !url.includes('://') && 
        imgTestReg.test(url)) {
      return `${postPath}${url}`;
    }
    
    // 处理已知防盗链域名
    const antiLeechDomains = [
      'cdn.jsdmirror.com'
      // 可以在此添加其他防盗链域名
    ];
    
    // 检查是否是需要处理的防盗链图片
    const isAntiLeech = antiLeechDomains.some(domain => url.includes(domain));
    
    if (isAntiLeech) {
      // 方案1: 使用本地代理 (需要您自己实现代理功能)
      // return `/image-proxy?url=${encodeURIComponent(url)}`;
      
      // 方案2: 替换为占位图
      // return 'https://via.placeholder.com/800x400?text=Cover+Image';
      
      // 方案3: 跳过不使用
      return null;
    }
    
    return url;
  }

  const handleImg = data => {
    const imgTestReg = /\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i
    let { cover: coverVal, top_img: topImg } = data

    // 处理top_img路径
    if (hexo.config.post_asset_folder) {
      if (topImg && topImg.indexOf('/') === -1 && imgTestReg.test(topImg)) {
        data.top_img = `${data.path}${topImg}`
      }
    }

    // 如果明确设置cover为false，直接返回
    if (coverVal === false) return data

    let extractedCover = null
    
    // 尝试提取文章内容中的第一张图片
    if (!coverVal && data.content) {
      extractedCover = extractFirstImage(data.content)
      
      // 处理防盗链图片
      if (extractedCover) {
        extractedCover = processAntiLeechImage(extractedCover, data.path)
      }
    }

    // 处理用户设置的封面路径
    if (hexo.config.post_asset_folder && coverVal) {
      if (coverVal.indexOf('/') === -1 && imgTestReg.test(coverVal)) {
        coverVal = `${data.path}${coverVal}`
      }
    }

    // 如果封面未设置，尝试使用提取的图片或随机封面
    if (!coverVal) {
      const { cover: { default_cover: defaultCover } } = hexo.theme.config
      const randomCover = getRandomCover(defaultCover)
      
      // 优先使用提取的文章图片，其次使用随机封面
      data.cover = extractedCover || randomCover || false
    } else {
      data.cover = coverVal
    }

    // 如果封面是图片URL，设置封面类型
    if (data.cover && (data.cover.indexOf('//') !== -1 || imgTestReg.test(data.cover))) {
      data.cover_type = 'img'
    }

    return data
  }

  // 处理文章列表
  const posts = locals.posts.sort('date').toArray()
  const { length } = posts

  return posts.map((post, i) => {
    if (i) post.prev = posts[i - 1]
    if (i < length - 1) post.next = posts[i + 1]

    post.__post = true

    return {
      data: handleImg(post),
      layout: 'post',
      path: post.path
    }
  })
})

```

配合我的语雀简直完美，自动固定连接，自动封面图，每次写个日常还要写 md 格式，关键语雀还反人类，每次复制封面图链接他都会自带超链接，还取消不掉，简直反人类，一带超链接，封面图必错，无限循环，真的折磨，现在好了，哈哈哈哈，我的博客说说

