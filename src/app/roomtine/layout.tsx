import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROOMTINE — 루틴이 쌓이면, 방이 완성된다",
  description: "루틴을 완료할수록 내 방이 꾸며지는, 디지털 룸 데코 라이프 앱",
};

export default function RoomtineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
