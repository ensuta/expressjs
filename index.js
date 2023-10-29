const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const svgCaptcha = require('svg-captcha');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

const playlistDirectory = path.join(__dirname, 'playlist'); // MP3 파일이 있는 폴더 경로
let playlist = {}; // 파일 정보를 저장할 객체

// 서버 시작 시 폴더 스캔 및 파일 정보 수집
fs.readdirSync(playlistDirectory).forEach((file) => {
  if (file.endsWith('.mp3')) {
    const filePath = path.join(playlistDirectory, file);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    playlist[file] = {
      fileSize: fileSize,
      contentType: 'audio/mp3', // 파일 형식에 따라 변경
    };
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/audio', (req, res) => {
    res.sendFile(path.join(__dirname, 'audioStream.html'));
});

app.get('/bbs', (req, res) => {
    res.sendFile(path.join(__dirname, 'bbs.html'));
});

app.get('/bbs/bbs.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'bbs.js'));
});

app.get('/bbs/patch', (req, res) => {
  res.sendFile(path.join(__dirname, 'patchnote.html'));
});

app.get('/jphanja', (req, res) => {
  res.sendFile(path.join(__dirname, 'jphanja.html'));
});

app.get('/jphanja/jphanja.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'jphanja.js'));
});

app.get('/jphanja/gana', (req, res) => {
  res.sendFile(path.join(__dirname, 'gana.html'));
});

app.get('/hanjajson', (req, res) => {
  res.sendFile(path.join(__dirname, 'japanese_hanja.json'));
});

app.get('/threads', (req, res) => {
  const threadsdb = path.join(__dirname, 'db/threads.json');

  // 파일을 읽어 JSON 데이터를 파싱
  fs.readFile(threadsdb, 'utf8', (err, data) => {
    if (err) {
      console.error('파일을 읽는 중 오류가 발생했습니다:', err);
      return res.status(500).json({ error: '서버 오류' });
    }

    try {
      // JSON 데이터 파싱
      const jsonData = JSON.parse(data);

      // 패스워드 필드를 제외한 필드만 남기고 새로운 배열 생성
      const filteredData = jsonData.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        date: item.date,
      }));

      res.json(filteredData);
    } catch (parseError) {
      console.error('JSON 데이터 파싱 중 오류가 발생했습니다:', parseError);
      res.status(500).json({ error: '데이터 처리 오류' });
    }
  });
});


app.use(session({
  secret: 'T5afE"KgQ=IVR7N7>QwRONuRH*Ot2', // 세션 암호화에 사용되는 비밀 키
  resave: false, // 세션의 재저장 여부
  saveUninitialized: true, // 초기화되지 않은 세션을 저장할지 여부
  cookie: {
    maxAge: 60000 // 세션 만료 시간 (밀리초)
  }
}));

app.get('/captcha', (req, res) => {
  const captcha = svgCaptcha.create();
  req.session.captcha = captcha.text; // 캡챠 문자열을 세션에 저장
  res.type('svg');
  res.status(200).send(captcha.data);
});

app.use(bodyParser.json());

// POST 요청 처리
app.post('/submitThread', (req, res) => {
  const threadData = req.body;

  for (const key in threadData) {
    if(!['captcha', 'id', 'title', 'pw', 'content'].includes(key)) {
      delete threadData[key];
    }
  }

  const userInputCaptha = threadData.captcha;
  const actualCaptcha = req.session.captcha;

  if(userInputCaptha !== actualCaptcha || userInputCaptha === undefined){
    return;
  }

  console.log(threadData);

  delete threadData.captcha;

  console.log(threadData);


  threadData.date = new Date().toISOString();
  const idString = threadData.id;
  const titleString = threadData.title;
  const contentString = threadData.content;

  if(idString.length > 50)
  {
    return;
  }

  const newidString = idString.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const newtitleString = titleString.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const newcontentString = contentString.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

  threadData.id = newidString;
  threadData.title = newtitleString;
  threadData.content = newcontentString;

  console.log('받은 데이터:', threadData);
  // 응답 보내기
  res.sendStatus(200); // 성공적으로 데이터를 받았음을 알림
  
  const threadjsonFilePath = 'db/threads.json';

  // JSON 파일 읽기
  fs.readFile(threadjsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('파일을 읽는 중 오류가 발생했습니다:', err);
        return;
    }

    try {
        // JSON 파일 내용 파싱
        const jsonData = JSON.parse(data);

        // 새로운 데이터를 배열의 1번째 인덱스에 추가
        jsonData.splice(0, 0, threadData);

        // 업데이트된 데이터를 JSON 문자열로 변환
        const updatedData = JSON.stringify(jsonData, null, 2);

        // JSON 파일에 업데이트된 데이터 덮어쓰기
        fs.writeFile(threadjsonFilePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('파일을 쓰는 중 오류가 발생했습니다:', err);
                return;
            }
            console.log('데이터가 성공적으로 추가되었습니다.');
        });
    } catch (parseError) {
        console.error('JSON 데이터 파싱 중 오류가 발생했습니다:', parseError);
    }
  });

});



app.get('/getPlaylist', (req, res) => {
    res.json(playlist);
  });

app.get('/playlist/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'playlist', filename);

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mp3',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mp3',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
