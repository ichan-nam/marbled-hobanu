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

class gpaStat {
  constructor(id, pointSumAry, relativeCredit, garbageCredit, absoluteCredit) {
    this.id = id;
    this.pointSum = { // pointSum = point * credit 
      endsWith3: pointSumAry[0],
      endsWith5: pointSumAry[1]
    };
    this.relativeCredit = relativeCredit; // credit for relative evalutated courses
    this.garbageCredit = garbageCredit; // credit for F graded courses
    this.absoluteCredit = absoluteCredit; // credit for absolute evalutated courses
  }

  getGpa(option) {
    if (this.relativeCredit + this.absoluteCredit === 0) return (0.).toFixed(2);
    // else
    const pointSum = option ? this.pointSum.endsWith5 : this.pointSum.endsWith3; // option is true: 4.5 / false: 4.3
    return pointSum === 0 ? 'SU과목' : (Math.floor(pointSum / (this.relativeCredit + this.garbageCredit) * 100) / 100.).toFixed(2);
  }
}

const reportInput = document.querySelector('header div input');
const wrongReportInputMsg = '실수가 있었던 거 같아요.\n처음부터 다시 성적표를 드래그해서 복사한 후 붙여넣어주세요.';
let gpa;

// if reportInput is changed, the code below will be running
reportInput.addEventListener('change', event => {
  initializeGpa();

  const tmpTokens = reportInput.value.split('\t');
  
  // dragged range validation
  if (tmpTokens[0] !== '년도/학기' && !tmpTokens[0].startsWith('20')) {
    alert(wrongReportInputMsg);
    return;
  }
  // else
  let startIdx = 0;

  // set logical cursor on the first row of contents
  if (tmpTokens[0] === '년도/학기') {
    if (tmpTokens[5].endsWith('년도/학기')) // copy the entire table from YES
      startIdx = 10;
    else // copy the entire table from myKNU
      startIdx = 5;

    tmpTokens[startIdx] = tmpTokens[startIdx].split(' ')[1];
  }

  let lastGpaSemestersStr = "";
  let lastGpaSemestersIdx = -1;
  const courses = [];

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

    if (gpa.types3[tmpCourse.type] === undefined) {
      gpa.types3[tmpCourse.type] = new gpaStat(tmpCourse.type, [0, 0], 0, 0, 0);
    }

    if (lastGpaSemestersStr !== tmpCourse.year + tmpCourse.semester) {
      lastGpaSemestersStr = tmpCourse.year + tmpCourse.semester;
      gpa.semesters.push(new gpaStat(lastGpaSemestersStr, [0, 0], 0, 0, 0));
      lastGpaSemestersIdx += 1;
    }

    // set GPAs
    if (tmpCourse.grade === 'U') {
      continue;
    } else if (tmpCourse.grade === 'S') {
      setGpaCredits(gpa, "absoluteCredit", tmpCourse, lastGpaSemestersIdx);
    } else if (tmpCourse.grade === 'F') {
      setGpaCredits(gpa, "garbageCredit", tmpCourse, lastGpaSemestersIdx);
    } else {
      setGpaCredits(gpa, "relativeCredit", tmpCourse, lastGpaSemestersIdx);
      setGpaPointSums(gpa, tmpCourse, lastGpaSemestersIdx);
    }
  }

  // last validation
  if (courses[courses.length - 1].grade === '') {
    alert(wrongReportInputMsg);
    return; // 
  }
  // else
  updateValues();
});

function initializeGpa() {
  gpa = {
    total: new gpaStat("total", [0, 0], 0, 0, 0),
    types1: {
      art: new gpaStat("art", [0, 0], 0, 0, 0),
      major: new gpaStat("major", [0, 0], 0, 0, 0)
    },
    types2: {
      cltr: new gpaStat("cltr", [0, 0], 0, 0, 0),
      nonCltr: new gpaStat("nonCltr", [0, 0], 0, 0, 0)
    },
    types3: {},
    semesters: []
  };
}

function setGpaCredits(gpa, whichCredit, tmpCourse, lastGpaSemestersIdx) {
  gpa.total[whichCredit] += tmpCourse.credit;
  gpa.types3[tmpCourse.type][whichCredit] += tmpCourse.credit;
  gpa.semesters[lastGpaSemestersIdx][whichCredit] += tmpCourse.credit;

  if (tmpCourse.type.indexOf('전공') < 0)
    gpa.types1.art[whichCredit] += tmpCourse.credit;
  else
    gpa.types1.major[whichCredit] += tmpCourse.credit;

  if (tmpCourse.code.indexOf('CLTR') < 0)
    gpa.types2.nonCltr[whichCredit] += tmpCourse.credit;
  else
    gpa.types2.cltr[whichCredit] += tmpCourse.credit;
}

function setGpaPointSums(gpa, tmpCourse, lastGpaSemestersIdx) {
  gpa.total.pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
  gpa.total.pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);
  gpa.types3[tmpCourse.type].pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
  gpa.types3[tmpCourse.type].pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);
  gpa.semesters[lastGpaSemestersIdx].pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
  gpa.semesters[lastGpaSemestersIdx].pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);

  if (tmpCourse.type.indexOf('전공') < 0) {
    gpa.types1.art.pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
    gpa.types1.art.pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);
  }
  else {
    gpa.types1.major.pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
    gpa.types1.major.pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);
  }

  if (tmpCourse.code.indexOf('CLTR') < 0) {
    gpa.types2.nonCltr.pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
    gpa.types2.nonCltr.pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);
  }
  else {
    gpa.types2.cltr.pointSum.endsWith3 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, false) * tmpCourse.credit);
    gpa.types2.cltr.pointSum.endsWith5 += makeSecureFloatingNum(convertGradeToPoint(tmpCourse.grade, true) * tmpCourse.credit);
  }
}

function makeSecureFloatingNum(floatingNum) {
  return Math.round(floatingNum * 1e12) / 1e12;
}

function convertGradeToPoint(grade, option) {
  if (option) { // true: 4.5
    if (grade === 'A+') return 4.5;
    else if (grade === 'A0') return 4.25;
    else if (grade === 'A-') return 4.0;
    else if (grade === 'B+') return 3.5;
    else if (grade === 'B0') return 3.25;
    else if (grade === 'B-') return 3.0;
    else if (grade === 'C+') return 2.5;
    else if (grade === 'C0') return 2.25;
    else if (grade === 'C-') return 2.0;
    else if (grade === 'D+') return 1.5;
    else if (grade === 'D0') return 1.25;
    else if (grade === 'D-') return 1.0;
  } else { // false: 4.3
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
}

// update all values by input
function updateValues() {
  document.querySelector('#value1').innerText = gpa.total.relativeCredit + gpa.total.absoluteCredit;
  document.querySelector('#value2').innerText = gpa.total.getGpa(false);
  document.querySelector('#value3').innerText = gpa.total.getGpa(true);
  updateDiagnosis();

  document.querySelector('#value5').innerText = gpa.types1.art.relativeCredit + gpa.types1.art.absoluteCredit;
  document.querySelector('#value6').innerText = gpa.types1.major.relativeCredit + gpa.types1.major.absoluteCredit;
  document.querySelector('#value9').innerText = gpa.types2.cltr.relativeCredit + gpa.types2.cltr.absoluteCredit;
  document.querySelector('#value10').innerText = gpa.types2.nonCltr.relativeCredit + gpa.types2.nonCltr.absoluteCredit;
  updateBoard(2);

  document.querySelectorAll('.veil').forEach((value, key, parent) => {
    value.style.display = 'none';
  });

  updateBoard(3);
  updateBoard(4);

  document.querySelectorAll('.dynamic-table-container').forEach((value, key, parent) => {
    value.style.display = 'block';
  });
}

// update diagnosis value by 4.5 GPA
function updateDiagnosis() {
  const gpaEndsWith5 = parseFloat(document.querySelector('#value3').innerText);
  let diagnosis;

  if (document.querySelector('#option1').checked) {
    if (gpaEndsWith5 >= 4.0) diagnosis = '🥰';
    else if (gpaEndsWith5 >= 3.8) diagnosis = '😃';
    else if (gpaEndsWith5 >= 3.5) diagnosis = '🙂';
    else diagnosis = '🤡'; // gpaEndsWith3 < 3.5
  } else if (document.querySelector('#option2').checked) {
    if (gpaEndsWith5 >= 3.8) diagnosis = '🥰';
    else if (gpaEndsWith5 >= 3.5) diagnosis = '😃';
    else if (gpaEndsWith5 >= 3.0) diagnosis = '🙂';
    else diagnosis = '🤡'; // gpaEndsWith3 < 3.0
  } else {
    diagnosis = '계열선택👆';
  }

  document.querySelector('#value4').innerText = diagnosis;
}

function updateBoard(order) {
  if (document.querySelector('header input').value === "") return;
  // else
  const bool = document.querySelector('#option' + (2 * order - 1)).checked ? false : true;

  switch(order) {
    case 2:
      document.querySelector('#value7').innerText = gpa.types1.art.getGpa(bool);
      document.querySelector('#value8').innerText = gpa.types1.major.getGpa(bool);
      document.querySelector('#value11').innerText = gpa.types2.cltr.getGpa(bool);
      document.querySelector('#value12').innerText = gpa.types2.nonCltr.getGpa(bool);
      break;
    case 3:
      document.querySelector('#dynamic-tr1').innerHTML = `<th></th>`;
      document.querySelector('#dynamic-tr2').innerHTML = `<td>이수학점</td>`;
      document.querySelector('#dynamic-tr3').innerHTML = `<td>평점</td>`;

      let aGpaStat;
      for (let key in gpa.types3) {
        aGpaStat = gpa.types3[key];
        document.querySelector('#dynamic-tr1').innerHTML += `<th>${aGpaStat.id}</th>`;
        document.querySelector('#dynamic-tr2').innerHTML += `<td>${aGpaStat.relativeCredit + aGpaStat.absoluteCredit}</td>`;
        document.querySelector('#dynamic-tr3').innerHTML += `<td>${aGpaStat.getGpa(bool)}</td>`;
      }

      break;
    case 4:
      document.querySelector('#dynamic-tr4').innerHTML = `<th></th>`;
      document.querySelector('#dynamic-tr5').innerHTML = `<td>이수학점</td>`;
      document.querySelector('#dynamic-tr6').innerHTML = `<td>평점</td>`;

      gpa.semesters.forEach((value, index, ary) => {
        document.querySelector('#dynamic-tr4').innerHTML += `<th>${value.id}</th>`;
        document.querySelector('#dynamic-tr5').innerHTML += `<td>${value.relativeCredit + value.absoluteCredit}</td>`;
        document.querySelector('#dynamic-tr6').innerHTML += `<td>${value.getGpa(bool)}</td>`;
      });

      break;
  }
}

const radioBtns = document.querySelectorAll('input[type="radio"]');

// if radioBtn is clicked, the code below will be running
radioBtns.forEach((value, key, parent) => {
  value.addEventListener('change', event => {
    if (event.target.id === 'option1' || event.target.id === 'option2') updateDiagnosis();
    else if (event.target.id === 'option3' || event.target.id === 'option4') updateBoard(2);
    else if (event.target.id === 'option5' || event.target.id === 'option6') updateBoard(3);
    else if (event.target.id === 'option7' || event.target.id === 'option8') updateBoard(4);
  });
});

const noticeBtns = document.querySelectorAll('.fa-question-circle');

// if noticeBtn is clicked, the code below will be running
noticeBtns.forEach((value, key, parent) => {
  value.addEventListener('click', event => {
    const noticeSection = document.querySelector("#notice" + event.target.dataset.order);
    if (noticeSection.style.display === '') // display: none
      noticeSection.style.display = 'block';
    else // noticeSection.style.display === 'block'
      noticeSection.style.display = "";
  });
});