/**
 * Số thứ tự "01 / 02..." trước heading mỗi section chính — nhịp điều hướng
 * trực quan khi cuộn qua trang landing dài nhiều section (tham khảo
 * pattern numbered-section marker phổ biến ở landing page agency/SaaS).
 */
export function SectionEyebrow({ index }: { index: number }) {
  return (
    <span className="text-brand-orange/50 mb-3 block text-xs font-bold tracking-[0.2em]">
      {String(index).padStart(2, "0")}
    </span>
  );
}

export default SectionEyebrow;
