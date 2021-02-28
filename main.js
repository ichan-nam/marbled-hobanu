'use strict';

class Course {
  constructor(year, semester, type, code, name, credit, grade) {
    this.year = year;
    this.semester = semester;
    this.type = type;
    this.code = code;
    this.name = name;
    this.credit = credit;
    this.grade = grade;
  }
}

const reportInputElement = document.querySelector('header div input');
const wrongReportInputMsg = '실수가 있었던 거 같아요.\n처음부터 다시 성적표를 드래그해서 복사한 후 붙여넣어주세요.';

// if reportInputElement is changed, the code below will be running
reportInputElement.addEventListener('change', event => {
  const tmpTokens = reportInputElement.value.split('\t');
  
  // dragged range validation
  if (tmpTokens[0] !== '년도/학기' && !tmpTokens[0].startsWith('20')) {
    alert(wrongReportInputMsg);
    return;
  }
  // else
  let startIdx = 0;

  if (tmpTokens[0] === '년도/학기') {
    if (tmpTokens[5].endsWith('년도/학기')) // copy the entire table from YES
      startIdx = 10;
    else // copy the entire table from myKNU
      startIdx = 5;

    tmpTokens[startIdx] = tmpTokens[startIdx].split(' ')[1];
  }

  const courses = [];
  let totalRelativeCredit = 0; // total credit for relative evalutated courses
  let totalAbsoluteCredit = 0; // total credit for absolute evalutated courses
  let totalPoint = 0.0;

  for (; startIdx < tmpTokens.length - 1; startIdx += 5) {
    if (!tmpTokens[startIdx].startsWith('20')) {
      alert(wrongReportInputMsg);
      return;
    }
    // else
    const tmpCourse = new Course(tmpTokens[startIdx].substring(0, 4), tmpTokens[startIdx][4],
      tmpTokens[startIdx + 1], tmpTokens[startIdx + 2], tmpTokens[startIdx + 3],
      parseInt(tmpTokens[startIdx + 4]), tmpTokens[startIdx + 5].split(' ')[0]
    );
    tmpTokens[startIdx + 5] = tmpTokens[startIdx + 5].split(' ')[1];

    courses.push(tmpCourse);

    if (tmpCourse.grade === 'U' || tmpCourse.grade === 'F') {
      continue;
    } else if (tmpCourse.grade === 'S') {
      totalAbsoluteCredit += tmpCourse.credit;
    } else {
      totalRelativeCredit += tmpCourse.credit;
      totalPoint += convertGradeToPoint(tmpCourse.grade) * tmpCourse.credit;
    }
  }

  console.log(totalAbsoluteCredit + totalRelativeCredit);

  const gpaEndsWith3 = Math.floor(totalPoint / totalRelativeCredit * 100) / 100.;
  console.log(gpaEndsWith3);
});

function convertGradeToPoint(grade) {
  if (grade === 'A+') return 4.3;
  else if (grade === 'A0') return 4.0;
  else if (grade === 'A-') return 3.7;
  else if (grade === 'B+') return 3.3;
  else if (grade === 'B0') return 3.0;
  else if (grade === 'B-') return 2.7;
  else if (grade === 'C+') return 2.3;
  else if (grade === 'C0') return 2.0;
  else if (grade === 'C-') return 1.7;
  else if (grade === 'D+') return 1.3;
  else if (grade === 'D0') return 1.0;
  else if (grade === 'D-') return 0.7;
}