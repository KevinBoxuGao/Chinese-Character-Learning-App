const vowels = ['a', 'e', 'i', 'o', 'u']
  const numbers = ['1', '2', '3', '4']
  const accentedVowels = {
    'a': 'āáǎà',
    'e': 'ēéěè',
    'i': 'īíǐì',
    'o': 'ōóǒò',
    'u': 'ūúǔù'
  }


export const processWords = (pinyin: string, english:string) => {
  let result = []
  let pinyinArray = convertPinyin(pinyin)
  let englishArray = english.split(',')
  for(let i=0; i<Math.min(pinyinArray.length, englishArray.length); i++) {
    result.push({
      pinyin: pinyinArray[i],
      english: convertEnglish(englishArray[i])
    })
  }
  if(pinyinArray.length > englishArray.length) {
    for(let i=englishArray.length; i<pinyinArray.length; i++) { 
      result.push({
        pinyin: pinyinArray[i],
        english: []
      })
    }
  } else if(englishArray.length > pinyinArray.length) {
    for(let i=pinyinArray.length; i<englishArray.length; i++) {
      result[result.length-1].english = result[result.length-1].english.concat(convertEnglish(englishArray[i]))
    }
  }
  return result
}

export const addPinyinAccent = (pinyin: string) => {
  if(numbers.includes(pinyin[pinyin.length-1])) {
    let accent = pinyin[pinyin.length-1]
    for(let j=0; j<pinyin.length; j++) {
      if(vowels.includes(pinyin[j])) {
        pinyin = pinyin.slice(0, j) + accentedVowels[pinyin[j]][accent-1] + pinyin.slice(j+1)
        break
      }
    }
    pinyin = pinyin.slice(0, -1)
  }
  return pinyin
}

export const convertPinyin = (pinyin: string) => {
    let pinyinArray;
    if(pinyin) {
      pinyinArray = pinyin.split('/');
      for(let i=0; i<pinyinArray.length; i++) {
        if(numbers.includes(pinyinArray[i][pinyinArray[i].length-1])) {
          let accent = pinyinArray[i][pinyinArray[i].length-1]
          for(let j=0; j<pinyinArray[i].length; j++) {
            if(vowels.includes(pinyinArray[i][j])) {
              pinyinArray[i] = pinyinArray[i].slice(0, j) + accentedVowels[pinyinArray[i][j]][accent-1] + pinyinArray[i].slice(j+1)
              break
            }
          }
          pinyinArray[i] = pinyinArray[i].slice(0, -1)
        }
      }
    } else {
      pinyinArray = []
    }
    return pinyinArray 
  }

export const convertEnglish = (english: string) => {
    let englishArray;
    if(english) {
      englishArray = english.split('/');
    } else {
      englishArray = []
    }
    return englishArray
  }