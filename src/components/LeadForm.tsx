"use client";

import { useState, useRef } from "react";
import { FormField, Input, Textarea } from "@/components/FormField";
import { ConsentBox } from "@/components/ConsentBox";
import type { LeadFormData, ContactMethod, LeadApiResponse } from "@/types/lead";

const PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_METHODS: ContactMethod[] = ["전화", "문자", "이메일", "카카오톡"];

const INITIAL_FORM: LeadFormData = {
  name: "",
  phone: "",
  email: "",
  productOrClass: "",
  contactMethod: "",
  message: "",
  privacyRequiredConsent: false,
  optionalInfoConsent: false,
  marketingConsent: false,
  website: "",
};

type Errors = Partial<Record<keyof LeadFormData, string>>;

export function LeadForm() {
  const [form, setForm] = useState<LeadFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");
  const submitLockRef = useRef(false);

  function set<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Errors = {};

    if (!form.name.trim()) next.name = "이름을 입력해주세요.";
    else if (form.name.trim().length > 50) next.name = "50자 이내로 입력해주세요.";

    if (!form.phone.trim()) {
      next.phone = "휴대전화번호를 입력해주세요.";
    } else if (!PHONE_REGEX.test(form.phone.replace(/\s/g, ""))) {
      next.phone = "올바른 휴대전화번호 형식을 입력해주세요. (예: 010-1234-5678)";
    }

    if (!form.productOrClass.trim()) next.productOrClass = "관심 제품/수업명을 입력해주세요.";
    else if (form.productOrClass.trim().length > 100) next.productOrClass = "100자 이내로 입력해주세요.";

    if (form.email.trim() && !EMAIL_REGEX.test(form.email)) {
      next.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (form.message.length > 1000) next.message = "1000자 이내로 입력해주세요.";

    if (!form.privacyRequiredConsent) {
      next.privacyRequiredConsent = "개인정보 수집·이용에 동의해주세요.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitLockRef.current || status === "submitting") return;

    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        document.getElementById(firstErrorKey)?.focus();
      }
      return;
    }

    submitLockRef.current = true;
    setStatus("submitting");
    setServerMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          productOrClass: form.productOrClass,
          contactMethod: form.contactMethod,
          message: form.message,
          privacyRequiredConsent: form.privacyRequiredConsent,
          optionalInfoConsent: form.optionalInfoConsent,
          marketingConsent: form.marketingConsent,
          website: form.website,
        }),
      });

      const data: LeadApiResponse = await res.json();

      if (data.success) {
        setStatus("success");
        setForm(INITIAL_FORM);
      } else {
        setStatus("error");
        setServerMessage(data.message ?? "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      setStatus("error");
      setServerMessage("네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.");
    } finally {
      submitLockRef.current = false;
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">관심 등록이 완료되었습니다!</h2>
        <p className="text-gray-600 mb-6">확인 후 안내드리겠습니다.</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          다시 등록하기
        </button>
      </div>
    );
  }

  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="관심 등록 폼">
      {/* Honeypot — hidden from real users */}
      <div className="absolute -top-[9999px] left-0" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* 이름 */}
        <FormField id="name" label="이름" required error={errors.name}>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            autoComplete="name"
            maxLength={50}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={!!errors.name}
            disabled={isSubmitting}
            aria-required="true"
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </FormField>

        {/* 휴대전화번호 */}
        <FormField id="phone" label="휴대전화번호" required error={errors.phone} hint="예: 010-1234-5678">
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="010-1234-5678"
            autoComplete="tel"
            maxLength={13}
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            error={!!errors.phone}
            disabled={isSubmitting}
            aria-required="true"
          />
        </FormField>

        {/* 이메일 */}
        <FormField id="email" label="이메일" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            maxLength={100}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={!!errors.email}
            disabled={isSubmitting}
          />
        </FormField>

        {/* 관심 제품/수업명 */}
        <FormField id="productOrClass" label="관심 제품/수업명" required error={errors.productOrClass}>
          <Input
            id="productOrClass"
            name="productOrClass"
            type="text"
            placeholder="예: 영어 회화 초급반, 디지털 마케팅 강의"
            maxLength={100}
            value={form.productOrClass}
            onChange={(e) => set("productOrClass", e.target.value)}
            error={!!errors.productOrClass}
            disabled={isSubmitting}
            aria-required="true"
          />
        </FormField>

        {/* 선호 연락 방식 */}
        <FormField id="contactMethod" label="선호 연락 방식">
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="contactMethod-label">
            {CONTACT_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => set("contactMethod", form.contactMethod === method ? "" : method)}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  form.contactMethod === method
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                }`}
                aria-pressed={form.contactMethod === method}
              >
                {method}
              </button>
            ))}
          </div>
        </FormField>

        {/* 문의 내용 */}
        <FormField id="message" label="문의 내용" error={errors.message} hint={`${form.message.length}/1000`}>
          <Textarea
            id="message"
            name="message"
            placeholder="궁금한 점이나 요청 사항을 자유롭게 작성해주세요."
            rows={4}
            maxLength={1000}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            error={!!errors.message}
            disabled={isSubmitting}
          />
        </FormField>

        {/* 구분선 */}
        <hr className="border-gray-200" />

        {/* 개인정보 동의 */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-700">개인정보 동의</p>

          {/* 필수 동의 */}
          <ConsentBox
            badge="필수"
            title="개인정보 수집·이용 동의"
            checkboxId="privacyRequiredConsent"
            checkboxLabel="위 개인정보 수집·이용에 동의합니다. (필수)"
            checked={form.privacyRequiredConsent}
            onChange={(v) => set("privacyRequiredConsent", v)}
            error={errors.privacyRequiredConsent}
          >
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">수집·이용 목적</td>
                  <td className="py-1.5 text-gray-600">제품/수업 관심 고객 확인, 상담 신청 접수, 문의 응대, 제품/수업 등록 및 이용 안내</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">수집 항목</td>
                  <td className="py-1.5 text-gray-600">이름, 휴대전화번호, 관심 제품/수업명</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">보유 및 이용 기간</td>
                  <td className="py-1.5 text-gray-600">수집일로부터 1년 또는 동의 철회·삭제 요청 시까지</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">동의 거부 권리</td>
                  <td className="py-1.5 text-gray-600">이용자는 개인정보 수집·이용에 동의하지 않을 권리가 있으며, 필수 항목에 동의하지 않을 경우 상담 신청 및 안내가 제한될 수 있습니다.</td>
                </tr>
              </tbody>
            </table>
          </ConsentBox>

          {/* 추가 정보 선택 동의 */}
          <ConsentBox
            badge="선택"
            title="추가 정보 수집·이용 동의"
            checkboxId="optionalInfoConsent"
            checkboxLabel="추가 정보 수집·이용에 동의합니다. (선택)"
            checked={form.optionalInfoConsent}
            onChange={(v) => set("optionalInfoConsent", v)}
          >
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">수집 항목</td>
                  <td className="py-1.5 text-gray-600">이메일, 선호 연락 방식, 문의 내용</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">목적</td>
                  <td className="py-1.5 text-gray-600">보다 정확한 상담 및 맞춤 안내</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">보유 기간</td>
                  <td className="py-1.5 text-gray-600">수집일로부터 1년 또는 동의 철회·삭제 요청 시까지</td>
                </tr>
              </tbody>
            </table>
          </ConsentBox>

          {/* 광고성 정보 수신 선택 동의 */}
          <ConsentBox
            badge="선택"
            title="광고성 정보 수신 동의"
            checkboxId="marketingConsent"
            checkboxLabel="광고성 정보 수신에 동의합니다. (선택)"
            checked={form.marketingConsent}
            onChange={(v) => set("marketingConsent", v)}
          >
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">목적</td>
                  <td className="py-1.5 text-gray-600">신규 제품/수업, 이벤트, 할인, 프로모션 등 광고성 정보 발송</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">이용 항목</td>
                  <td className="py-1.5 text-gray-600">이름, 휴대전화번호, 이메일, 관심 제품/수업명</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">발송 방법</td>
                  <td className="py-1.5 text-gray-600">문자, 전화, 이메일, 카카오톡 등</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1.5 pr-3 font-medium text-gray-700 whitespace-nowrap align-top">보유 기간</td>
                  <td className="py-1.5 text-gray-600">동의일로부터 1년 또는 수신 거부·동의 철회 시까지</td>
                </tr>
                <tr>
                  <td colSpan={2} className="py-1.5 text-gray-500 italic">동의하지 않아도 상담 신청에는 불이익이 없습니다.</td>
                </tr>
              </tbody>
            </table>
          </ConsentBox>
        </div>

        {/* 서버 에러 메시지 */}
        {status === "error" && serverMessage && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
            {serverMessage}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-blue-600 text-white font-semibold text-base transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              저장 중...
            </span>
          ) : (
            "관심 등록하기"
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          <span className="text-red-500">*</span> 표시는 필수 입력 항목입니다.
        </p>
      </div>
    </form>
  );
}
