import axios from "axios";

export const validateCaptcha = async (token) => {
  try {
    const secret = process.env.GOOGLE_RECAPTCHA_SECRET;
    const res = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );
    return res.data.success;
  } catch (err) {
    console.error("Captcha verification failed:", err.message);
    return false;
  }
};
