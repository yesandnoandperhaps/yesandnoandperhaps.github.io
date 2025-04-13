/**
 * Refer to hexo-generator-searchdb
 * https://github.com/next-theme/hexo-generator-searchdb/blob/main/dist/search.js
 * Modified by hexo-theme-butterfly and extended for category & tag search.
 */

class LocalSearch {
  constructor ({
    path = '',
    unescape = false,
    top_n_per_article = 1
  }) {
    this.path = path
    this.unescape = unescape
    this.top_n_per_article = top_n_per_article
    this.isfetched = false
    this.datas = null
  }

  getIndexByWord (words, text, caseSensitive = false) {
    const index = []
    const included = new Set()

    if (!caseSensitive) {
      text = text.toLowerCase()
    }
    words.forEach(word => {
      if (this.unescape) {
        const div = document.createElement('div')
        div.innerText = word
        word = div.innerHTML
      }
      const wordLen = word.length
      if (wordLen === 0) return
      let startPosition = 0
      let position = -1
      if (!caseSensitive) {
        word = word.toLowerCase()
      }
      while ((position = text.indexOf(word, startPosition)) > -1) {
        index.push({ position, word })
        included.add(word)
        startPosition = position + wordLen
      }
    })
    // 按关键词出现的位置排序
    index.sort((left, right) => {
      if (left.position !== right.position) {
        return left.position - right.position
      }
      return right.word.length - left.word.length
    })
    return [index, included]
  }

  // 合并命中的结果片段
  mergeIntoSlice (start, end, index) {
    let item = index[0]
    let { position, word } = item
    const hits = []
    const count = new Set()
    while (position + word.length <= end && index.length !== 0) {
      count.add(word)
      hits.push({
        position,
        length: word.length
      })
      const wordEnd = position + word.length

      // 移动到下一个命中位置
      index.shift()
      while (index.length !== 0) {
        item = index[0]
        position = item.position
        word = item.word
        if (wordEnd > position) {
          index.shift()
        } else {
          break
        }
      }
    }
    return {
      hits,
      start,
      end,
      count: count.size
    }
  }

  // 对标题和内容中的关键词高亮显示
  highlightKeyword (val, slice) {
    let result = ''
    let index = slice.start
    for (const { position, length } of slice.hits) {
      result += val.substring(index, position)
      index = position + length
      result += `<mark class="search-keyword">${val.substr(position, length)}</mark>`
    }
    result += val.substring(index, slice.end)
    return result
  }

  getResultItems (keywords) {
    const resultItems = []
    this.datas.forEach(({ title, content, url }) => {
      // 对标题和内容进行关键词检索
      const [indexOfTitle, keysOfTitle] = this.getIndexByWord(keywords, title)
      const [indexOfContent, keysOfContent] = this.getIndexByWord(keywords, content)
      const includedCount = new Set([...keysOfTitle, ...keysOfContent]).size

      const hitCount = indexOfTitle.length + indexOfContent.length
      if (hitCount === 0) return

      const slicesOfTitle = []
      if (indexOfTitle.length !== 0) {
        slicesOfTitle.push(this.mergeIntoSlice(0, title.length, indexOfTitle))
      }

      let slicesOfContent = []
      while (indexOfContent.length !== 0) {
        const item = indexOfContent[0]
        const { position } = item
        // 截取 120 字符长度范围的文本（考虑到输入框长度等因素）
        const start = Math.max(0, position - 20)
        const end = Math.min(content.length, position + 100)
        slicesOfContent.push(this.mergeIntoSlice(start, end, indexOfContent))
      }

      // 对内容中各片段按命中关键词数量及命中次数排序
      slicesOfContent.sort((left, right) => {
        if (left.count !== right.count) {
          return right.count - left.count
        } else if (left.hits.length !== right.hits.length) {
          return right.hits.length - left.hits.length
        }
        return left.start - right.start
      })

      // 限制每篇文章显示的片段数目
      const upperBound = parseInt(this.top_n_per_article, 10)
      if (upperBound >= 0) {
        slicesOfContent = slicesOfContent.slice(0, upperBound)
      }

      let resultItem = ''
      url = new URL(url, location.origin)
      url.searchParams.append('highlight', keywords.join(' '))

      if (slicesOfTitle.length !== 0) {
        resultItem += `<li class="local-search-hit-item"><a href="${url.href}"><span class="search-result-title">${this.highlightKeyword(title, slicesOfTitle[0])}</span>`
      } else {
        resultItem += `<li class="local-search-hit-item"><a href="${url.href}"><span class="search-result-title">${title}</span>`
      }

      slicesOfContent.forEach(slice => {
        resultItem += `<p class="search-result">${this.highlightKeyword(content, slice)}...</p></a>`
      })

      resultItem += '</li>'
      resultItems.push({
        item: resultItem,
        id: resultItems.length,
        hitCount,
        includedCount
      })
    })
    return resultItems
  }

  fetchData () {
    const isXml = !this.path.endsWith('json')
    fetch(this.path)
      .then(response => response.text())
      .then(res => {
        // 获取检索数据
        this.isfetched = true
        this.datas = isXml
          ? [...new DOMParser().parseFromString(res, 'text/xml').querySelectorAll('entry')].map(element => ({
              title: element.querySelector('title').textContent,
              content: element.querySelector('content').textContent,
              url: element.querySelector('url').textContent,
              // 扩展字段（需要你在生成数据时包含这两个字段）
              categories: element.querySelector('categories') ? element.querySelector('categories').textContent : '',
              tags: element.querySelector('tags') ? element.querySelector('tags').textContent : ''
            }))
          : JSON.parse(res)
        // 只保留标题非空的文章，并对内容进行预处理
        this.datas = this.datas.filter(data => data.title).map(data => {
          data.title = data.title.trim()
          data.content = data.content ? data.content.trim().replace(/<[^>]+>/g, '') : ''
          data.url = decodeURIComponent(data.url).replace(/\/{2,}/g, '/')
          return data
        })
        // 移除加载动画
        window.dispatchEvent(new Event('search:loaded'))
      })
  }

  // 对文本节点进行关键词高亮包装
  highlightText (node, slice, className) {
    const val = node.nodeValue
    let index = slice.start
    const children = []
    for (const { position, length } of slice.hits) {
      const text = document.createTextNode(val.substring(index, position))
      index = position + length
      const mark = document.createElement('mark')
      mark.className = className
      mark.appendChild(document.createTextNode(val.substr(position, length)))
      children.push(text, mark)
    }
    node.nodeValue = val.substring(index, slice.end)
    children.forEach(element => {
      node.parentNode.insertBefore(element, node)
    })
  }

  // 从 URL 中取出高亮关键词，并对页面内容进行高亮
  highlightSearchWords (body) {
    const params = new URL(location.href).searchParams.get('highlight')
    const keywords = params ? params.split(' ') : []
    if (!keywords.length || !body) return
    const walk = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null)
    const allNodes = []
    while (walk.nextNode()) {
      if (!walk.currentNode.parentNode.matches('button, select, textarea, .mermaid')) 
        allNodes.push(walk.currentNode)
    }
    allNodes.forEach(node => {
      const [indexOfNode] = this.getIndexByWord(keywords, node.nodeValue)
      if (!indexOfNode.length) return
      const slice = this.mergeIntoSlice(0, node.nodeValue.length, indexOfNode)
      this.highlightText(node, slice, 'search-keyword')
    })
  }
}

window.addEventListener('load', () => {
  // Search 初始化
  const { path, top_n_per_article, unescape, languages } = GLOBAL_CONFIG.localSearch
  const localSearch = new LocalSearch({
    path,
    top_n_per_article,
    unescape
  })

  const input = document.querySelector('#local-search-input input')
  const statsItem = document.getElementById('local-search-stats-wrap')
  const $loadingStatus = document.getElementById('loading-status')
  const isXml = !path.endsWith('json')
  
  const inputEventFunction = () => {
    if (!localSearch.isfetched) return

    // 获取搜索模式。默认使用 name 为 searchMode 的单选按钮，未选中时返回 'text'
    const modeElem = document.querySelector('input[name="searchMode"]:checked')
    const searchMode = modeElem ? modeElem.value : 'text'

    // 统一取小写并过滤特殊字符（XML 模式下额外转换尖括号）
    let searchText = input.value.trim().toLowerCase()
    if (isXml) {
      searchText = searchText.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    if (searchText !== '') $loadingStatus.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>'

    const container = document.getElementById('local-search-results')
    let resultItems = []

    // 根据搜索模式分支执行
    if (searchText.length === 0) {
      container.textContent = ''
      statsItem.textContent = ''
      $loadingStatus.textContent = ''
      return
    }

    if (searchMode === 'text') {
      // 原有的文字搜索逻辑：同时搜索标题和内容
      const keywords = searchText.split(/[-\s]+/)
      resultItems = localSearch.getResultItems(keywords)
    } else if (searchMode === 'categoryTag') {
      // 分类/标签搜索逻辑
      let categoryName = ''
      let tagName = ''
      const categoryMatch = searchText.match(/(?:分类名|分类)[:：]\s*([^\s,，]+)/)
      const tagMatch = searchText.match(/(?:标签名|标签)[:：]\s*([^\s,，]+)/)
      if (categoryMatch) {
        categoryName = categoryMatch[1]
      }
      if (tagMatch) {
        tagName = tagMatch[1]
      }
      const parts = searchText.split(/[,，\s]+/).filter(Boolean)
      if (!categoryName && parts.length > 0) {
        categoryName = parts[0]
      }
      if (!tagName && parts.length > 1) {
        tagName = parts[1]
      }
      
      resultItems = localSearch.datas.filter(data => {
        let catMatch = true, tagMatch = true
        if (categoryName) {
          if (Array.isArray(data.categories)) {
            catMatch = data.categories.some(cat => cat.toLowerCase().indexOf(categoryName) > -1)
          } else if (typeof data.categories === 'string') {
            catMatch = data.categories.toLowerCase().indexOf(categoryName) > -1
          }
        }
        if (tagName) {
          if (Array.isArray(data.tags)) {
            tagMatch = data.tags.some(tag => tag.toLowerCase().indexOf(tagName) > -1)
          } else if (typeof data.tags === 'string') {
            tagMatch = data.tags.toLowerCase().indexOf(tagName) > -1
          }
        }
        return catMatch && tagMatch
      }).map(data => {
        let url = new URL(data.url, location.origin)
        url.searchParams.append('highlight', searchText)
        const highlightText = (text, keyword) => {
          if (!keyword) return text
          return text.replace(new RegExp(`(${keyword})`, 'ig'), '<mark class="search-keyword">$1</mark>')
        }
        const highlightedTitle = data.title
        const highlightedCategories = data.categories ? highlightText(data.categories, categoryName) : '无'
        const highlightedTags = data.tags ? highlightText(data.tags, tagName) : '无'

        return {
          item: `<li class="local-search-hit-item">
                    <a href="${url.href}">
                      <span class="search-result-title">${highlightedTitle}</span>
                      <p class="search-result">分类：${highlightedCategories}<br>标签：${highlightedTags}</p>
                    </a>
                  </li>`,
          id: 0,
          hitCount: 1,
          includedCount: 1
        }
      })
    } else if (searchMode === 'title') {
      // 新增只搜索标题逻辑：仅在标题中匹配关键词并高亮显示
      const keywords = searchText.split(/[-\s]+/)
      resultItems = localSearch.datas.map(data => {
        // 在标题中检索关键词
        const [indexOfTitle] = localSearch.getIndexByWord(keywords, data.title)
        if (indexOfTitle.length === 0) return null

        let url = new URL(data.url, location.origin)
        url.searchParams.append('highlight', keywords.join(' '))

        // 生成标题的高亮片段（与 getResultItems 中方法类似）
        const slicesOfTitle = [localSearch.mergeIntoSlice(0, data.title.length, indexOfTitle.slice())]
        const highlightedTitle = localSearch.highlightKeyword(data.title, slicesOfTitle[0])
        const resultItem = `<li class="local-search-hit-item">
                              <a href="${url.href}">
                                <span class="search-result-title">${highlightedTitle}</span>
                              </a>
                            </li>`

        return {
          item: resultItem,
          id: 0,
          hitCount: indexOfTitle.length,
          includedCount: new Set(indexOfTitle.map(hit => hit.word)).size
        }
      }).filter(Boolean)
    }

    if (resultItems.length === 0) {
      container.textContent = ''
      const statsDiv = document.createElement('div')
      statsDiv.className = 'search-result-stats'
      statsDiv.textContent = languages.hits_empty.replace(/\$\{query}/, searchText)
      statsItem.innerHTML = statsDiv.outerHTML
    } else {
      // 对结果排序：按匹配文章的关键词数量、命中数等降序排序
      resultItems.sort((left, right) => {
        if (left.includedCount !== right.includedCount) {
          return right.includedCount - left.includedCount
        } else if (left.hitCount !== right.hitCount) {
          return right.hitCount - left.hitCount
        }
        return right.id - left.id
      })

      const stats = languages.hits_stats.replace(/\$\{hits}/, resultItems.length)
      container.innerHTML = `<ol class="search-result-list">${resultItems.map(result => result.item).join('')}</ol>`
      statsItem.innerHTML = `<hr><div class="search-result-stats">${stats}</div>`
      window.pjax && window.pjax.refresh(container)
    }
    $loadingStatus.textContent = ''
  }

  let loadFlag = false
  const $searchMask = document.getElementById('search-mask')
  const $searchDialog = document.querySelector('#local-search .search-dialog')

  // 修复 Safari 下高度问题
  const fixSafariHeight = () => {
    if (window.innerWidth < 768) {
      $searchDialog.style.setProperty('--search-height', window.innerHeight + 'px')
    }
  }

  const openSearch = () => {
    btf.overflowPaddingR.add()
    btf.animateIn($searchMask, 'to_show 0.5s')
    btf.animateIn($searchDialog, 'titleScale 0.5s')
    setTimeout(() => { input.focus() }, 300)
    if (!loadFlag) {
      !localSearch.isfetched && localSearch.fetchData()
      input.addEventListener('input', inputEventFunction)
      loadFlag = true
    }
    // 快捷键：Esc关闭
    document.addEventListener('keydown', function f (event) {
      if (event.code === 'Escape') {
        closeSearch()
        document.removeEventListener('keydown', f)
      }
    })
    fixSafariHeight()
    window.addEventListener('resize', fixSafariHeight)
  }

  const closeSearch = () => {
    btf.overflowPaddingR.remove()
    btf.animateOut($searchDialog, 'search_close .5s')
    btf.animateOut($searchMask, 'to_hide 0.5s')
    window.removeEventListener('resize', fixSafariHeight)
  }

  const searchClickFn = () => {
    btf.addEventListenerPjax(document.querySelector('#search-button > .search'), 'click', openSearch)
  }

  const searchFnOnce = () => {
    document.querySelector('#local-search .search-close-button').addEventListener('click', closeSearch)
    $searchMask.addEventListener('click', closeSearch)
    if (GLOBAL_CONFIG.localSearch.preload) {
      localSearch.fetchData()
    }
    localSearch.highlightSearchWords(document.getElementById('article-container'))
  }

  window.addEventListener('search:loaded', () => {
    const $loadDataItem = document.getElementById('loading-database')
    $loadDataItem.nextElementSibling.style.display = 'block'
    $loadDataItem.remove()
  })

  searchClickFn()
  searchFnOnce()

  document.querySelectorAll('input[name="searchMode"]').forEach(item => {
    item.addEventListener('change', () => {
      inputEventFunction();
    });
  });

  // pjax 页面切换时的处理
  window.addEventListener('pjax:complete', () => {
    !btf.isHidden($searchMask) && closeSearch()
    localSearch.highlightSearchWords(document.getElementById('article-container'))
    searchClickFn()
  })
})

