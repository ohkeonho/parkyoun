// regex.js

const emailRegex =/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i; // 이메일 정규 표현식
const nameRegex = /^[가-힣a-zA-Z]{2,}$/; // 이름 정규 표현식 (한글 또는 영문자, 2자 이상)
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/; // 비밀번호 정규 표현식
const idRegex = /^[a-zA-Z0-9]{4,20}$/; // ID 정규 표현식 (영문자와 숫자만 허용, 4~20자)

// 정규 표현식 모듈 내보내기
module.exports = {
  emailRegex,
  nameRegex,
  passwordRegex,
  idRegex,
};
