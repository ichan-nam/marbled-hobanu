'use strict';

const reportInputElement = document.querySelector('header div input');

reportInputElement.addEventListener('change', event => {
  const tmpTokens = reportInputElement.value.split('\t');
  
  if (tmpTokens[0] !== '년도/학기' && !tmpTokens[0].startsWith('20')) {
    alert('실수가 있었던 거 같아요.\n처음부터 다시 성적표를 드래그해서 복사한 후 붙여넣어주세요.');
    return;
  }
  // else
  let startIdx = 0;
  const tokens = [];

  if (tmpTokens[0] === '년도/학기') {
    if (tmpTokens[5].endsWith('년도/학기')) // copy the entire table from YES
      startIdx = 10;
    else // copy the entire table from myKNU
      startIdx = 5;

    tokens.push(tmpTokens[startIdx].split(' ')[1]);
  } else {
    tokens.push(tmpTokens[startIdx]);
  }

  for (startIdx += 1; startIdx < tmpTokens.length; startIdx++) {
    if (startIdx % 5) {
      tokens.push(tmpTokens[startIdx]);
    } else {
      tokens.push(tmpTokens[startIdx].split(' ')[0]);
      tokens.push(tmpTokens[startIdx].split(' ')[1]);
    }
  }

  tokens.pop();

  console.log(tokens);
});