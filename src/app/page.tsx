import { LeadForm } from "@/components/LeadForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">관심 등록하기</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              제품 또는 수업에 관심이 있으시면 연락처를 남겨주세요.
              <br />
              확인 후 안내드리겠습니다.
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-6">
            <LeadForm />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          본 사이트는 개인정보보호법을 준수합니다.
        </p>
      </div>
    </main>
  );
}
