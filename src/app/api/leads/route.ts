import { NextRequest, NextResponse } from "next/server";
import { appendLeadToSheet, checkDuplicatePhone } from "@/lib/googleSheets";
import { sendLeadNotification } from "@/lib/email";
import type { LeadApiRequest, LeadApiResponse } from "@/types/lead";

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

function validatePhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.replace(/\s/g, ""));
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest): Promise<NextResponse<LeadApiResponse>> {
  try {
    const body: LeadApiRequest = await req.json();

    // Honeypot check — bots fill this field
    if (body.website && body.website.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    // Required field validation
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ success: false, message: "이름을 입력해주세요." }, { status: 400 });
    }
    if (body.name.trim().length > 50) {
      return NextResponse.json({ success: false, message: "이름은 50자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!body.phone || body.phone.trim().length === 0) {
      return NextResponse.json({ success: false, message: "휴대전화번호를 입력해주세요." }, { status: 400 });
    }
    if (!validatePhone(body.phone)) {
      return NextResponse.json({ success: false, message: "올바른 휴대전화번호 형식을 입력해주세요." }, { status: 400 });
    }
    if (!body.productOrClass || body.productOrClass.trim().length === 0) {
      return NextResponse.json({ success: false, message: "관심 제품/수업명을 입력해주세요." }, { status: 400 });
    }
    if (body.productOrClass.trim().length > 100) {
      return NextResponse.json({ success: false, message: "관심 제품/수업명은 100자 이내로 입력해주세요." }, { status: 400 });
    }
    if (!body.privacyRequiredConsent) {
      return NextResponse.json({ success: false, message: "개인정보 수집·이용에 동의해주세요." }, { status: 400 });
    }
    if (body.email && body.email.trim().length > 0 && !validateEmail(body.email)) {
      return NextResponse.json({ success: false, message: "올바른 이메일 형식을 입력해주세요." }, { status: 400 });
    }
    if (body.message && body.message.length > 1000) {
      return NextResponse.json({ success: false, message: "문의 내용은 1000자 이내로 입력해주세요." }, { status: 400 });
    }

    // 전화번호 중복 검사
    const isDuplicate = await checkDuplicatePhone(body.phone.trim());
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, message: "이미 등록된 휴대전화번호입니다. 확인 후 안내드리겠습니다." },
        { status: 409 }
      );
    }

    const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    await appendLeadToSheet({
      timestamp,
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() ?? "",
      product_or_class: body.productOrClass.trim(),
      contact_method: body.contactMethod?.trim() ?? "",
      message: body.message?.trim() ?? "",
      privacy_required_consent: body.privacyRequiredConsent ? "Y" : "N",
      optional_info_consent: body.optionalInfoConsent ? "Y" : "N",
      marketing_consent: body.marketingConsent ? "Y" : "N",
      source: "web",
    });

    // 관리자 이메일 알림 (실패해도 제출은 성공 처리)
    sendLeadNotification({
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() ?? "",
      productOrClass: body.productOrClass.trim(),
      contactMethod: body.contactMethod?.trim() ?? "",
      message: body.message?.trim() ?? "",
      timestamp,
      marketingConsent: body.marketingConsent,
    }).catch((err) => console.error("[email notification] failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/leads] Error:", error);
    return NextResponse.json(
      { success: false, message: "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
