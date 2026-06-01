import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface LeadNotificationData {
  name: string;
  phone: string;
  email: string;
  productOrClass: string;
  contactMethod: string;
  message: string;
  timestamp: string;
  marketingConsent: boolean;
}

export async function sendLeadNotification(data: LeadNotificationData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const resend = getResend();

  if (!resend || !adminEmail) {
    // 설정 안 된 경우 조용히 건너뜀 (필수 기능 아님)
    return;
  }

  const contactInfo = [
    `이름: ${data.name}`,
    `전화: ${data.phone}`,
    data.email ? `이메일: ${data.email}` : null,
    `관심 제품/수업: ${data.productOrClass}`,
    data.contactMethod ? `선호 연락 방식: ${data.contactMethod}` : null,
    data.message ? `문의 내용: ${data.message}` : null,
    `광고 수신 동의: ${data.marketingConsent ? "동의" : "미동의"}`,
    `등록 시각: ${data.timestamp}`,
  ]
    .filter(Boolean)
    .join("\n");

  await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `[관심 등록] ${data.name}님이 "${data.productOrClass}"에 관심을 등록했습니다`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #1d4ed8; border-bottom: 2px solid #dbeafe; padding-bottom: 8px;">
          새 관심 등록 알림
        </h2>
        <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="background:#f0f9ff;">
            <td style="padding:10px 12px; font-weight:600; color:#374151; width:140px;">이름</td>
            <td style="padding:10px 12px; color:#111827;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px; font-weight:600; color:#374151;">전화</td>
            <td style="padding:10px 12px; color:#111827;">${data.phone}</td>
          </tr>
          ${data.email ? `
          <tr style="background:#f0f9ff;">
            <td style="padding:10px 12px; font-weight:600; color:#374151;">이메일</td>
            <td style="padding:10px 12px; color:#111827;">${data.email}</td>
          </tr>` : ""}
          <tr ${data.email ? "" : 'style="background:#f0f9ff;"'}>
            <td style="padding:10px 12px; font-weight:600; color:#374151;">관심 제품/수업</td>
            <td style="padding:10px 12px; color:#111827; font-weight:600;">${data.productOrClass}</td>
          </tr>
          ${data.contactMethod ? `
          <tr style="background:#f0f9ff;">
            <td style="padding:10px 12px; font-weight:600; color:#374151;">선호 연락</td>
            <td style="padding:10px 12px; color:#111827;">${data.contactMethod}</td>
          </tr>` : ""}
          ${data.message ? `
          <tr>
            <td style="padding:10px 12px; font-weight:600; color:#374151; vertical-align:top;">문의 내용</td>
            <td style="padding:10px 12px; color:#111827; white-space:pre-wrap;">${data.message}</td>
          </tr>` : ""}
          <tr style="background:#f0f9ff;">
            <td style="padding:10px 12px; font-weight:600; color:#374151;">광고 수신</td>
            <td style="padding:10px 12px; color:${data.marketingConsent ? "#16a34a" : "#6b7280"};">
              ${data.marketingConsent ? "✅ 동의" : "미동의"}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 12px; font-weight:600; color:#374151;">등록 시각</td>
            <td style="padding:10px 12px; color:#6b7280;">${data.timestamp}</td>
          </tr>
        </table>
        <p style="margin-top:24px; font-size:12px; color:#9ca3af;">
          이 메일은 관심 등록 웹앱에서 자동 발송되었습니다.
        </p>
      </div>
    `,
    text: contactInfo,
  });
}
