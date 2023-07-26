/*
// 서버를 띄우기 위한 express 기본 라이브러리
const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // 사용할 포트 번호

// 경로 수정: 'HTML' 폴더가 프로젝트 루트 안에 위치하므로 '../HTML'로 경로 지정
app.use(express.static(path.join(__dirname, '..', 'HTML')));

// 경로 수정: index.html이 'HTML' 폴더 안에 있으므로 'HTML/index.html'로 경로 지정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'HTML', 'index.html'));
});

// 서버실행
app.listen(port, () => {
  console.log(`서버가 정상 작동중 입니다. 서버주소 : http://localhost:${port}`);
});
*/

// 서버를 띄우기 위한 express 기본 라이브러리
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000; // 사용할 포트 번호

// MySQL 연결 설정
const connection = mysql.createConnection({
    host: '127.0.0.1', // MySQL 호스트 주소 
    user: 'root',  // MySQL 사용자명
    password: '0000', // MySQL 비밀번호
    database: 'memberdb'   // 사용할 데이터베이스 이름
  });

// MySQL에 테이블 생성 쿼리
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
  )
`;

// MySQL에 테이블 생성 쿼리 실행
connection.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('테이블 생성 에러:', err);
  } else {
    console.log('테이블이 성공적으로 생성되었습니다.');
  }
});

// express-session 미들웨어 설정
app.use(
  session({
    secret: 'your_session_secret_key', // 세션 데이터 암호화에 사용될 비밀키
    resave: false,
    saveUninitialized: true
  })
);

// body-parser 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '..', 'HTML')));

// 회원가입 처리
app.post('/signup', (req, res) => {
  const { name, username, email, password } = req.body;

  // MySQL에 회원 정보 저장
  const query = `INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)`;
  connection.query(query, [name, username, email, password], (err, result) => {
    if (err) {
      console.error('회원가입 에러:', err);
      res.status(500).send('회원가입에 실패했습니다.');
    } else {
      console.log('회원가입 성공:', result);
      res.send('회원가입이 완료되었습니다.');
    }
  });
});

// 로그인 처리
app.post('/login', (req, res) => {
    const { username, password } = req.body; // 로그인 폼에서 아이디와 비밀번호 입력 받음
  
    // MySQL에서 회원 정보 조회
   const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
  connection.query(query, [username, password], (err, result) => {
      if (err) {
        console.error('로그인 에러:', err);
        res.status(500).send('로그인에 실패했습니다.');
      } else {
        if (result.length > 0) {
          console.log('로그인 성공:', result[0]);
          // 로그인 성공 시 세션에 로그인 정보 저장
          req.session.user = {
            id: result[0].id,
            name: result[0].name,
            username: result[0].username,
            email: result[0].email
          };
          // 로그인에 성공하면 index.html로 이동
          res.redirect('/index.html');
        } else {
          console.log('로그인 실패: 유효하지 않은 사용자 정보');
          res.status(401).send('로그인 실패: 유효하지 않은 사용자 정보입니다.');
        }
      }
    });
  });
  
  // 서버 시작
  app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });



