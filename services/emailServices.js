const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, verificationCode) {
  try {
    const mailOptions = {
      from: `"인증 서비스" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "이메일 인증 코드",
      text: `인증 코드: ${verificationCode} (10분 내에 입력하세요)`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`인증 이메일 전송 성공: ${email}`);
  } catch (error) {
    console.error("인증 이메일 전송 실패:", error);
    throw new Error("인증 이메일 전송 실패");
  }
}

module.exports = { sendVerificationEmail };
