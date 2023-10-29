const dataForm = document.getElementById('data-form');
const captchaInput = document.getElementById('captcha-input');
const idInput = document.getElementById('id-input');
const pwdInput = document.getElementById('pwd-input');
const titleInput = document.getElementById('title-input');
const contentInput = document.getElementById('content-input');

dataForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const captcha = captchaInput.value;
    const id = idInput.value;
    const pwd = pwdInput.value;
    const title = titleInput.value;
    const content = contentInput.value;

    const threadData = {
        captcha: captcha,
        id: id,
        pwd: pwd,
        title: title,
        content: content
    };

    fetch('/submitThread', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(threadData)
    })
        .then(response => {
            if (response.ok) {
                console.log('데이터가 성공적으로 서버로 전송되었습니다.');

                titleInput.value = '';
                contentInput.value = '';
                location.reload();
            }
        })

    captchaInput.value = '';
});

fetch('/threads')
    .then(response => response.json())
    .then(jsonData => {
        const threadListElement = document.getElementById('thread-list');

        jsonData.forEach(threadData => {
            const threadElement = document.createElement('li');
            threadElement.classList.add('thread');

            // 스타일 설정
            const threadStyle = document.createElement('style');
            threadStyle.textContent = "img { width: 50vw; height: auto; }";
            document.head.appendChild(threadStyle);

            // ID, 날짜, 제목, 내용 요소 생성 및 설정
            const idElement = document.createElement("p");
            idElement.textContent = threadData.id;

            const dateElement = document.createElement("p");
            dateElement.textContent = threadData.date;

            const titleElement = document.createElement("h3");
            titleElement.textContent = threadData.title;

            const contentElement = document.createElement("div");
            contentElement.innerHTML = threadData.content;

            // 요소들을 threadElement에 추가
            threadElement.appendChild(idElement);
            threadElement.appendChild(dateElement);
            threadElement.appendChild(titleElement);
            threadElement.appendChild(contentElement);

            // threadElement를 목록에 추가
            threadListElement.appendChild(threadElement);
        });
    })
    .catch(error => console.error('JSON 파일을 로드하는 중 오류가 발생했습니다:', error));