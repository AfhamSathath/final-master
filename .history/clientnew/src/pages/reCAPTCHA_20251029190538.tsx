import ReCAPTCHA from "react-google-recaptcha";

<div className="flex justify-center mt-2">
  <ReCAPTCHA
    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || process.env.REACT_APP_RECAPTCHA_SITE_KEY}
    onChange={setCaptchaToken}
  />
</div>
