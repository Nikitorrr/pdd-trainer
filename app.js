// scripts/app.js

const SUPABASE_URL = 'https://astcajoqsmklsrfbmxug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzdGNham9xc21rbHNyZmJteHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTU2NTYsImV4cCI6MjA3NzQ3MTY1Nn0.SKPsvgFMrK0NN7Qwk_nlgHzrVBJlUleXFB-uzFdTGZw';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentQuestionIndex = 0;
let questions = [];

async function loadQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Ошибка загрузки вопросов:', error);
    document.getElementById('question-container').innerHTML = 'Ошибка загрузки вопросов.';
    return;
  }

  questions = data;
  showQuestion(currentQuestionIndex);
}

function showQuestion(index) {
  if (index >= questions.length) {
    document.getElementById('question-container').innerHTML = '<h2>Тренировка завершена! 🎉</h2>';
    document.getElementById('next-btn').style.display = 'none';
    return;
  }

  const q = questions[index];
  let imgHtml = '';
  if (q.image_url) {
    imgHtml = `<img src="${q.image_url}" alt="Иллюстрация к вопросу" style="max-width: 100%; height: auto; margin: 1rem 0;">`;
  }

  // Собираем варианты ответов из option1, option2, option3
  const answers = [q.option1, q.option2, q.option3];
  const answersHtml = answers.map((ans, i) => 
    `<label><input type="radio" name="answer" value="${i}"> ${ans}</label><br>`
  ).join('');

  document.getElementById('question-container').innerHTML = `
    <h3>Вопрос ${index + 1} из ${questions.length}</h3>
    <p>${q.question_text}</p>
    ${imgHtml}
    <div class="answers">${answersHtml}</div>
    <button id="check-btn">Проверить</button>
  `;

  document.getElementById('check-btn').onclick = () => checkAnswer(q.correct_answer - 1); // минус 1, потому что в БД 1,2,3 → в JS 0,1,2
}

function checkAnswer(correctIndex) {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    alert('Выберите ответ!');
    return;
  }

  const userAnswer = parseInt(selected.value);
  const isCorrect = userAnswer === correctIndex;

  // Подсветка
  const labels = document.querySelectorAll('label');
  labels.forEach((label, i) => {
    if (i === correctIndex) {
      label.style.color = 'green';
      label.style.fontWeight = 'bold';
    }
    if (i === userAnswer && i !== correctIndex) {
      label.style.color = 'red';
    }
  });

  // Показываем объяснение
  const explanationDiv = document.createElement('div');
  explanationDiv.innerHTML = `<p><strong>Объяснение:</strong> ${questions[currentQuestionIndex].explanation}</p>`;
  document.getElementById('question-container').appendChild(explanationDiv);

  // Меняем кнопку
  document.getElementById('check-btn').style.display = 'none';
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Следующий вопрос';
  nextBtn.onclick = () => {
    currentQuestionIndex++;
    showQuestion(currentQuestionIndex);
  };
  document.getElementById('question-container').appendChild(nextBtn);
}

loadQuestions();
