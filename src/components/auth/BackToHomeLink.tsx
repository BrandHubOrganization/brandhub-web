import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { HERO_SKIP_INTRO_KEY } from "@/components/landing/cinematic/CinematicHero";

/** Link quay về landing page — đặt đầu form ở mọi trang auth (login/register/quên mật khẩu...).
 * User tới đây từ landing rồi mới sang auth, nên chắc chắn đã xem cinematic
 * Hero intro — báo Hero bỏ qua animation 3500px, vào thẳng demo. */
export function BackToHomeLink() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = () => {
    sessionStorage.setItem(HERO_SKIP_INTRO_KEY, "1");
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-muted-foreground hover:text-foreground mb-6 flex cursor-pointer items-center gap-1.5 text-sm transition-colors"
    >
      <ArrowLeft className="size-4" />
      {t("auth.common.backToHome")}
    </button>
  );
}

export default BackToHomeLink;
