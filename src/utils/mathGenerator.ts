import { GradeLevel, MathOperator, MathQuestion } from '../types';

export function generateQuestionList(grade: GradeLevel = 'grade2', count: number = 10): MathQuestion[] {
  const questions: MathQuestion[] = [];
  for (let i = 1; i <= count; i++) {
    questions.push(generateSingleQuestion(i, grade));
  }
  return questions;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSingleQuestion(id: number, grade: GradeLevel): MathQuestion {
  let num1 = 0;
  let num2 = 0;
  let operator: MathOperator = '+';
  let correctAnswer = 0;
  let hint = '';
  let explanation = '';

  switch (grade) {
    case 'grade1': {
      // 20 以內加減法
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '+') {
        num1 = getRandomInt(2, 12);
        num2 = getRandomInt(1, 20 - num1);
        correctAnswer = num1 + num2;
        hint = `可以從 ${num1} 往上數 ${num2} 個數字。`;
        explanation = `${num1} 加 ${num2} 等於 ${correctAnswer}。`;
      } else {
        num1 = getRandomInt(5, 20);
        num2 = getRandomInt(1, num1);
        correctAnswer = num1 - num2;
        hint = `從 ${num1} 倒數 ${num2} 個數字，或是想 ${num2} 加多少會是 ${num1}？`;
        explanation = `${num1} 減 ${num2} 等於 ${correctAnswer}。`;
      }
      break;
    }

    case 'grade2':
    default: {
      // 兩位數加法與減法（如 prompt 所指定）
      operator = Math.random() > 0.45 ? '+' : '-';
      if (operator === '+') {
        num1 = getRandomInt(12, 79);
        num2 = getRandomInt(11, 99 - num1);
        correctAnswer = num1 + num2;

        const ones1 = num1 % 10;
        const ones2 = num2 % 10;
        const carry = ones1 + ones2 >= 10;

        hint = carry
          ? `個位數 ${ones1} + ${ones2} = ${ones1 + ones2}，滿十要記得進 1 到十位數喔！`
          : `個位加個位 (${ones1}+${ones2})，十位加十位 (${Math.floor(num1 / 10)}+${Math.floor(num2 / 10)})。`;

        explanation = `算式拆解：個位數 ${ones1} + ${ones2} = ${ones1 + ones2}，十位數 ${Math.floor(num1 / 10) * 10} + ${Math.floor(num2 / 10) * 10} = ${(Math.floor(num1 / 10) + Math.floor(num2 / 10)) * 10}，合計為 ${correctAnswer}。`;
      } else {
        num1 = getRandomInt(25, 99);
        num2 = getRandomInt(11, num1 - 5);
        correctAnswer = num1 - num2;

        const ones1 = num1 % 10;
        const ones2 = num2 % 10;
        const borrow = ones1 < ones2;

        hint = borrow
          ? `個位數 ${ones1} 減 ${ones2} 不夠減，要向十位數借 1 當作 10 喔！`
          : `先算個位數 ${ones1} - ${ones2}，再算十位數！`;

        explanation = `算式拆解：${num1} 減 ${num2}。${borrow ? `十位借 1 換 10，(${ones1} + 10) - ${ones2} = ${ones1 + 10 - ones2}，剩餘十位相減，` : ''}答案是 ${correctAnswer}。`;
      }
      break;
    }

    case 'grade3': {
      // 九九乘法與兩位數加減
      const roll = Math.random();
      if (roll < 0.6) {
        operator = '×';
        num1 = getRandomInt(2, 9);
        num2 = getRandomInt(2, 9);
        correctAnswer = num1 * num2;
        hint = `背誦九九乘法表：${num1} 的乘法，${num1} × ${num2} 是多少呢？`;
        explanation = `${num1} × ${num2} 代表有 ${num2} 個 ${num1} 相加，答案是 ${correctAnswer}。`;
      } else {
        operator = roll < 0.8 ? '+' : '-';
        if (operator === '+') {
          num1 = getRandomInt(25, 68);
          num2 = getRandomInt(18, 99 - num1);
          correctAnswer = num1 + num2;
          hint = `注意個位數進位！`;
          explanation = `${num1} + ${num2} = ${correctAnswer}。`;
        } else {
          num1 = getRandomInt(50, 99);
          num2 = getRandomInt(15, num1 - 10);
          correctAnswer = num1 - num2;
          hint = `如果不夠減，記得向十位數借十！`;
          explanation = `${num1} - ${num2} = ${correctAnswer}。`;
        }
      }
      break;
    }

    case 'grade4': {
      // 除法（整除）或加減乘綜合
      const choice = getRandomInt(1, 4);
      if (choice === 1) {
        operator = '÷';
        num2 = getRandomInt(2, 9);
        correctAnswer = getRandomInt(2, 12);
        num1 = num2 * correctAnswer;
        hint = `想想看：${num2} 乘上多少會等於 ${num1} 呢？`;
        explanation = `${num1} ÷ ${num2} = ${correctAnswer}（因為 ${num2} × ${correctAnswer} = ${num1}）。`;
      } else if (choice === 2) {
        operator = '×';
        num1 = getRandomInt(6, 15);
        num2 = getRandomInt(3, 9);
        correctAnswer = num1 * num2;
        hint = `可以拆成 (${Math.floor(num1 / 10) * 10} × ${num2}) + (${(num1 % 10)} × ${num2})！`;
        explanation = `${num1} × ${num2} = ${correctAnswer}。`;
      } else if (choice === 3) {
        operator = '+';
        num1 = getRandomInt(45, 95);
        num2 = getRandomInt(35, 95);
        correctAnswer = num1 + num2;
        hint = `這是百位數進位題目，仔細算喔！`;
        explanation = `${num1} + ${num2} = ${correctAnswer}。`;
      } else {
        operator = '-';
        num1 = getRandomInt(100, 180);
        num2 = getRandomInt(25, 90);
        correctAnswer = num1 - num2;
        hint = `百位數減法，注意退位！`;
        explanation = `${num1} - ${num2} = ${correctAnswer}。`;
      }
      break;
    }
  }

  const prompt = `${num1} ${operator} ${num2} = ?`;

  return {
    id,
    prompt,
    num1,
    num2,
    operator,
    correctAnswer,
    hint,
    explanation,
  };
}
