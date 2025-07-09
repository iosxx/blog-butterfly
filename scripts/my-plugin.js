hexo.extend.filter.register('before_post_render', function (data) {
    // 不处理文章外的数据
    if (data.layout !== 'post') {
        return data
    }

    /**
     * 如果Front-matter中设置cover变量，此处可以通过data.cover获取到。
     * 获取不到则代表不存在变量了，就进入提取文章内图片的逻辑了
     */
    if (!data.cover) {
        const imageRegex = /!\[.*?\]\((.*?)\)/g
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i

        const matches = data.content.matchAll(imageRegex)
        const firstImageMatch = Array.from(matches).find(match => {
            let url = match[1]
            return imageExtensions.test(url)
        })

        // 如果文章中包含图片标签，则将第一个匹配的图片链接设置为首图
        if (firstImageMatch) {

            let url = firstImageMatch[1]
            if (!url.startsWith('http')) {
                url = '/' + data.path.replace('.html', '') + '/' + url
            }
            data.cover = url
        } else {
            // 如果文章中没有图片标签，则设置默认的首图链接
            data.cover = 'https://cdn.jsdmirror.com/gh/iosxx/blog@posts/img/53fad04b91e36dc43c3f5f7aeace8c0b.jpeg'
        }
    }

    return data
})
