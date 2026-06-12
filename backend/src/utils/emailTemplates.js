const otpTemplate = (otp, type = "verification") => {
  const title = type === "reset" ? "Reset your password" : "Verify your email";
  const copy = type === "reset"
    ? "Use this one-time code to reset your AI Analytics password."
    : "Use this one-time code to finish creating your AI Analytics account.";

  return `
    <div style="margin:0;padding:32px;background:#0a0a14;color:#ffffff;font-family:Arial,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#1a1a2e;border:1px solid #2a2a4a;border-radius:16px;padding:32px;">
        <h1 style="margin:0 0 12px;font-size:26px;color:#ffffff;">${title}</h1>
        <p style="margin:0 0 24px;color:#a1a1aa;line-height:1.6;">${copy}</p>
        <div style="letter-spacing:12px;font-size:34px;font-weight:700;text-align:center;background:#0f0f1a;border:1px solid #6366f1;border-radius:14px;padding:20px;color:#ffffff;">
          ${otp}
        </div>
        <p style="margin:24px 0 0;color:#71717a;font-size:14px;">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    </div>
  `;
};

module.exports = { otpTemplate };
