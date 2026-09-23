const fallbackNames = {
  happy: '偏爱此刻',
  excited: '风先起飞',
  calm: '慢慢归岸',
  miss: '等风回信',
  tired: '把夜喝浅',
  anxious: '心有归处',
  regret: '迟到的雨',
  sad: '月光失语',
};

const emotionWords = /开心|兴奋|平静|想念|疲惫|焦虑|遗憾|悲伤|难过|伤心|快乐/;

export function isValidBrewName(value) {
  return typeof value === 'string' && /^[\p{Script=Han}]{2,5}$/u.test(value) && !emotionWords.test(value);
}

export function fallbackBrewName(main, crisis = false) {
  return crisis ? '有人在听' : fallbackNames[main] || '此刻有光';
}

export function shareBrewName(value, main, crisis = false) {
  return isValidBrewName(value) ? value : fallbackBrewName(main, crisis);
}
