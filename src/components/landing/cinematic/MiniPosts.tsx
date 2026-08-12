import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InstagramPost } from "./posts/InstagramPost";
import { TikTokPost } from "./posts/TikTokPost";
import { FacebookPost } from "./posts/FacebookPost";
import { LinkedInPost } from "./posts/LinkedInPost";
import { FloatingHearts, type FloatingHeartsHandle } from "./FloatingHearts";
import { CursorGhost } from "./CursorGhost";
import {
  useGhostTyping,
  InstagramGhostComment,
  TikTokGhostComment,
  FacebookGhostComment,
  LinkedInGhostComment,
} from "./GhostComments";
import { ReactionPicker, useFbReactions, useLiReactions } from "./ReactionPicker";
import {
  useShareSheet,
  InstagramShareSheet,
  TikTokShareSheet,
  FacebookShareSheet,
  LinkedInShareSheet,
} from "./ShareSheet";
import { formatComma, formatCompactK, useLiveCounter } from "./useLiveCounter";
import { useFeedRotation } from "./useFeedRotation";
import {
  facebookFeed,
  instagramFeed,
  linkedinFeed,
  tiktokFeed,
  IG_GHOST_COMMENT_KEYS,
  TT_GHOST_COMMENT_KEYS,
  FB_GHOST_COMMENT_KEYS,
  LI_GHOST_COMMENT_KEYS,
  type FacebookSlide,
  type InstagramSlide,
  type LinkedInSlide,
  type TikTokSlide,
} from "./feedContent";

/**
 * 4 post tí hon ở 4 góc — frame cuối của cinematic sequence.
 * GSAP (trong CinematicHero) animate scale + opacity + stagger khi
 * BrandHub reveal, dùng class .mini-post-{ig,tt,fb,li} làm target.
 *
 * Thu nhỏ bằng CSS `scale` transform trên wrapper — KHÔNG ép `width`
 * xuống nhỏ hơn max-width gốc của từng post. Ép width co width mà
 * không co font/padding khiến text tràn dòng, ảnh vỡ tỉ lệ; scale
 * transform co đều toàn bộ (chữ, ảnh, khoảng cách) nên vẫn sắc nét ở
 * kích thước nhỏ. `transform-origin` đặt tại góc neo (top-left,
 * top-right, ...) để card co về đúng phía góc thay vì co về tâm rồi
 * lệch vị trí khỏi mốc neo.
 *
 * Không cắt bằng max-h/overflow-hidden nữa — cắt làm mất phần cuối
 * caption/comment, đúng cái user muốn thấy trọn vẹn. Thay vào đó chọn
 * scale sao cho chiều cao SAU scale của mỗi card (đo từ native:
 * IG 340×567, TikTok 280×498, FB 430×512, LI 430×556) rơi vào khoảng
 * 220–260px — đủ lớn để đọc, đủ nhỏ để 2 card cùng cột (top+bottom)
 * không chạm nhau trong viewport thực tế.
 *
 * "Sống": mỗi card xoay vòng qua 2-3 "bài viết" khác nhau (feedContent.ts)
 * bằng useFeedRotation — kiểu lướt dọc TikTok/Reels: bài cũ trượt lên +
 * mờ dần, bài mới trượt từ dưới lên thay thế CÙNG LÚC (không phải
 * crossfade tại chỗ, không tạo cảm giác "giật đổi"). `overflow-hidden`
 * luôn bật trên container — tạo khung clip cố định như viewport Reels,
 * nội dung card vẫn hiện đủ vì container height = auto theo card hiện tại.
 * Số like/comment tự tăng theo hook riêng mỗi platform trong lúc đứng ở
 * 1 bài (tần suất khác nhau — IG/TikTok sôi nổi hơn LinkedIn), tim bay
 * lên trên IG/TikTok mô phỏng đúng tương tác nền tảng gốc.
 *
 * Tương tác bổ sung (không sửa 4 file post gốc):
 * - Hover + auto-like pulse đều transform trên 1 DIV CON riêng
 *   (INNER), KHÔNG áp trực tiếp lên .mini-post-* — GSAP (trong
 *   CinematicHero) set inline `transform` (scale/xPercent/yPercent) lên
 *   chính .mini-post-* để bay ra góc + idle-drift; nếu hover/pulse cũng
 *   target transform của phần tử đó, 2 nguồn ghi cùng 1 style sẽ giẫm
 *   lên nhau (inline luôn thắng class, nên hover sẽ bị GSAP đè mất hoặc
 *   ngược lại tùy thời điểm). Tách ra 1 lớp con để 2 hệ animation không
 *   bao giờ chạm cùng property.
 * - CursorGhost: chấm tròn giả lập con trỏ người khác đang xem, trôi
 *   ngẫu nhiên trong card, kiểu multiplayer cursor Figma/Notion.
 *
 * `key={slide.index}` trên component slide bên trong buộc React remount
 * mỗi khi xoay bài — useLiveCounter chỉ set state 1 lần lúc mount nên
 * cần remount để đọc `likesSeed` MỚI của bài mới, không giữ số cũ.
 */
const CARD = "pointer-events-auto absolute z-10";
// INNER giữ pointer-events-auto (để nhận hover) nhưng mọi con CỦA NÓ
// (post component thật + nút Like/Comment bên trong) bị chặn click —
// tránh nhầm giữa "hover để card nảy lên" và "click nút thật bên trong".
const INNER =
  "relative transition-transform duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.06] hover:drop-shadow-2xl [&>*]:pointer-events-none";

// CSS selectors cho cursor ghost targets — mỗi platform có bộ nút tương tác riêng
const IG_TARGETS = [
  "[data-cursor-target='like']",
  "[data-cursor-target='comment']",
  "[data-cursor-target='share']",
  "[data-cursor-target='save']",
];
const TT_TARGETS = IG_TARGETS;
const FB_TARGETS = [
  "[data-cursor-target='like']",
  "[data-cursor-target='comment']",
  "[data-cursor-target='share']",
];
const LI_TARGETS = [
  "[data-cursor-target='like']",
  "[data-cursor-target='comment']",
  "[data-cursor-target='repost']",
  "[data-cursor-target='send']",
];

/**
 * Khung Reels cố định — luôn `overflow-hidden` để tạo viewport clip.
 * Container height = chiều cao card hiện tại (auto, do `current` trong
 * flow quyết định). Khi `sliding`:
 * - `outgoing` (absolute, overlay khớp khung) trượt lên + mờ dần.
 * - `current` (trong flow) trượt từ dưới lên thay thế.
 * Nhờ overflow-hidden luôn bật, phần trượt ra ngoài khung bị cắt →
 * hiệu ứng lướt Reels/TikTok mượt, không bị "2 bài chồng nhau".
 */
function SlideStack({
  sliding,
  slideMs,
  outgoing,
  current,
}: {
  sliding: boolean;
  slideMs: number;
  outgoing: React.ReactNode;
  current: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      {sliding && outgoing && (
        <div
          className="slide-out-up absolute inset-0"
          style={{ animationDuration: `${slideMs}ms` }}
        >
          {outgoing}
        </div>
      )}
      <div
        className={sliding ? "slide-in-up" : undefined}
        style={sliding ? { animationDuration: `${slideMs}ms` } : undefined}
      >
        {current}
      </div>
    </div>
  );
}

export function MiniPosts() {
  return (
    <>
      <MiniInstagram />
      <MiniTikTok />
      <MiniFacebook />
      <MiniLinkedIn />
    </>
  );
}

function MiniInstagram() {
  const rotation = useFeedRotation(instagramFeed, { intervalMs: 6000 });
  return (
    <div
      className={`${CARD} mini-post-ig top-4 left-4 w-[340px] origin-top-left scale-[0.42] opacity-95`}
    >
      <SlideStack
        sliding={rotation.phase === "sliding"}
        slideMs={rotation.slideMs}
        outgoing={
          rotation.outgoing && <InstagramSlideCard slide={rotation.outgoing} />
        }
        current={
          <InstagramSlideCard key={rotation.index} slide={rotation.slide} />
        }
      />
    </div>
  );
}

function InstagramSlideCard({ slide }: { slide: InstagramSlide }) {
  const { t } = useTranslation();
  const likes = useLiveCounter(slide.likesSeed, {
    minIntervalMs: 2000,
    maxIntervalMs: 4000,
    step: 3,
  });
  const heartsRef = useRef<FloatingHeartsHandle>(null);
  const [ghostLikes, setGhostLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ghostCommentActive, setGhostCommentActive] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [shareActive, setShareActive] = useState(false);
  const bumpKey = likes.bumped || ghostLikes > 0 ? "bump" : "";

  const handleInteract = useCallback((type: string) => {
    if (type === "like") {
      heartsRef.current?.emit();
      setGhostLikes((n) => n + 1);
      setLiked(true);
    } else if (type === "comment") {
      setGhostCommentActive(true);
    } else if (type === "save") {
      setSaved(true);
    } else if (type === "share") {
      setShareActive(true);
    }
  }, []);

  const ghostState = useGhostTyping(
    ghostCommentActive,
    IG_GHOST_COMMENT_KEYS.map((k) => t(k)),
    () => setCommentCount((n) => n + 1),
    () => setGhostCommentActive(false),
  );

  const shareState = useShareSheet(shareActive, () => setShareActive(false));

  return (
    <div className={`${INNER} ${likes.bumped ? "scale-[1.03]" : ""}`}>
      <InstagramPost
        caption={t(slide.captionKey)}
        imageUrl={slide.imageUrl}
        liked={liked}
        saved={saved}
        likes={
          <span key={bumpKey} className={bumpKey ? "count-bump" : undefined}>
            {formatComma(likes.value + ghostLikes)}
          </span>
        }
        comments={
          commentCount > 0
            ? `${parseInt(slide.commentsLabel, 10) + commentCount}`
            : slide.commentsLabel
        }
      />
      <FloatingHearts
        ref={heartsRef}
        anchorClassName="right-2 bottom-2"
        minIntervalMs={1600}
        maxIntervalMs={3000}
      />
      <CursorGhost
        color="#f05a28"
        targets={IG_TARGETS}
        onInteract={handleInteract}
      />
      <InstagramGhostComment state={ghostState} />
      <InstagramShareSheet state={shareState} />
    </div>
  );
}

function MiniTikTok() {
  const rotation = useFeedRotation(tiktokFeed, { intervalMs: 5500 });
  return (
    <div
      className={`${CARD} mini-post-tt top-20 right-4 w-[280px] origin-top-right scale-[0.52] opacity-95`}
    >
      <SlideStack
        sliding={rotation.phase === "sliding"}
        slideMs={rotation.slideMs}
        outgoing={
          rotation.outgoing && <TikTokSlideCard slide={rotation.outgoing} />
        }
        current={
          <TikTokSlideCard key={rotation.index} slide={rotation.slide} />
        }
      />
    </div>
  );
}

function TikTokSlideCard({ slide }: { slide: TikTokSlide }) {
  const { t } = useTranslation();
  const likes = useLiveCounter(slide.likesSeed, {
    minIntervalMs: 1800,
    maxIntervalMs: 3400,
    step: 40,
  });
  const heartsRef = useRef<FloatingHeartsHandle>(null);
  const [ghostLikes, setGhostLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ghostCommentActive, setGhostCommentActive] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [shareActive, setShareActive] = useState(false);
  const bumpKey = likes.bumped || ghostLikes > 0 ? "bump" : "";

  const handleInteract = useCallback((type: string) => {
    if (type === "like") {
      heartsRef.current?.emit();
      setGhostLikes((n) => n + 1);
      setLiked(true);
    } else if (type === "comment") {
      setGhostCommentActive(true);
    } else if (type === "save") {
      setSaved(true);
    } else if (type === "share") {
      setShareActive(true);
    }
  }, []);

  const ghostState = useGhostTyping(
    ghostCommentActive,
    TT_GHOST_COMMENT_KEYS.map((k) => t(k)),
    () => setCommentCount((n) => n + 1),
    () => setGhostCommentActive(false),
  );

  const shareState = useShareSheet(shareActive, () => setShareActive(false));

  return (
    <div className={`${INNER} ${likes.bumped ? "scale-[1.03]" : ""}`}>
      <TikTokPost
        liked={liked}
        saved={saved}
        caption={t(slide.captionKey)}
        imageUrl={slide.imageUrl}
        likes={
          <span key={bumpKey} className={bumpKey ? "count-bump" : undefined}>
            {formatCompactK(likes.value + ghostLikes)}
          </span>
        }
        comments={
          commentCount > 0
            ? `${slide.commentsLabel}+${commentCount}`
            : slide.commentsLabel
        }
        shares={slide.sharesLabel}
      />
      <FloatingHearts
        ref={heartsRef}
        anchorClassName="right-1 bottom-20"
        minIntervalMs={1400}
        maxIntervalMs={2600}
      />
      <CursorGhost
        color="#25f4ee"
        targets={TT_TARGETS}
        onInteract={handleInteract}
      />
      <TikTokGhostComment state={ghostState} />
      <TikTokShareSheet state={shareState} />
    </div>
  );
}

function MiniFacebook() {
  const rotation = useFeedRotation(facebookFeed, { intervalMs: 7000 });
  return (
    <div
      className={`${CARD} mini-post-fb bottom-4 left-4 w-[430px] origin-bottom-left scale-[0.43] opacity-95`}
    >
      <SlideStack
        sliding={rotation.phase === "sliding"}
        slideMs={rotation.slideMs}
        outgoing={
          rotation.outgoing && <FacebookSlideCard slide={rotation.outgoing} />
        }
        current={
          <FacebookSlideCard key={rotation.index} slide={rotation.slide} />
        }
      />
    </div>
  );
}

function FacebookSlideCard({ slide }: { slide: FacebookSlide }) {
  const { t } = useTranslation();
  const fbReactions = useFbReactions();
  const likes = useLiveCounter(slide.likesSeed, {
    minIntervalMs: 3000,
    maxIntervalMs: 6000,
    step: 2,
  });
  const [ghostLikes, setGhostLikes] = useState(0);
  const [ghostCommentActive, setGhostCommentActive] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [reactionVisible, setReactionVisible] = useState(false);
  const [reactionPick, setReactionPick] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<
    (typeof fbReactions)[number] | null
  >(null);
  const [shared, setShared] = useState(false);
  const [shareActive, setShareActive] = useState(false);
  const bumpKey = likes.bumped || ghostLikes > 0 ? "bump" : "";

  const handleInteract = useCallback(
    (type: string) => {
      if (type === "like") {
        // Facebook thật: hover/long-press Thích → hiện reaction picker,
        // dừng ~500ms rồi "chọn" 1 reaction ngẫu nhiên (ưu tiên like/love).
        // Reaction đã chọn PERSIST trên nút Thích sau khi picker đóng —
        // giống hành vi thật (nút đổi icon+màu vĩnh viễn, không chỉ nháy).
        setReactionVisible(true);
        setGhostLikes((n) => n + 1);
        setTimeout(() => {
          const chosen =
            Math.random() < 0.6
              ? fbReactions[0]
              : fbReactions[Math.floor(Math.random() * fbReactions.length)];
          setReactionPick(chosen.key);
          setActiveReaction(chosen);
          setTimeout(() => {
            setReactionVisible(false);
            setReactionPick(null);
          }, 900);
        }, 450);
      } else if (type === "comment") {
        setGhostCommentActive(true);
      } else if (type === "share") {
        setShared(true);
        setShareActive(true);
      }
    },
    [fbReactions],
  );

  const ghostState = useGhostTyping(
    ghostCommentActive,
    FB_GHOST_COMMENT_KEYS.map((k) => t(k)),
    () => setCommentCount((n) => n + 1),
    () => setGhostCommentActive(false),
  );

  const shareState = useShareSheet(shareActive, () => setShareActive(false));

  return (
    <div className={`${INNER} ${likes.bumped ? "scale-[1.03]" : ""}`}>
      <FacebookPost
        authorName={t(slide.authorNameKey)}
        authorRole={t(slide.authorRoleKey)}
        content={t(slide.contentKey)}
        imageUrl={slide.imageUrl}
        activeReaction={activeReaction}
        shared={shared}
        likes={
          <span key={bumpKey} className={bumpKey ? "count-bump" : undefined}>
            {formatCompactK(likes.value + ghostLikes)}
          </span>
        }
        comments={
          commentCount > 0
            ? `${parseInt(slide.commentsLabel, 10) + commentCount}`
            : slide.commentsLabel
        }
        shares={slide.sharesLabel}
      />
      <CursorGhost
        color="#1877f2"
        targets={FB_TARGETS}
        onInteract={handleInteract}
      />
      <div className="absolute right-2 bottom-1.5">
        <ReactionPicker
          reactions={fbReactions}
          selected={reactionPick}
          visible={reactionVisible}
        />
      </div>
      <FacebookGhostComment state={ghostState} />
      <FacebookShareSheet state={shareState} />
    </div>
  );
}

function MiniLinkedIn() {
  const rotation = useFeedRotation(linkedinFeed, { intervalMs: 8000 });
  return (
    <div
      className={`${CARD} mini-post-li right-4 bottom-4 w-[430px] origin-bottom-right scale-[0.4] opacity-95`}
    >
      <SlideStack
        sliding={rotation.phase === "sliding"}
        slideMs={rotation.slideMs}
        outgoing={
          rotation.outgoing && <LinkedInSlideCard slide={rotation.outgoing} />
        }
        current={
          <LinkedInSlideCard key={rotation.index} slide={rotation.slide} />
        }
      />
    </div>
  );
}

function LinkedInSlideCard({ slide }: { slide: LinkedInSlide }) {
  const { t } = useTranslation();
  const liReactions = useLiReactions();
  const likes = useLiveCounter(slide.likesSeed, {
    minIntervalMs: 4000,
    maxIntervalMs: 8000,
    step: 1,
  });
  const [ghostLikes, setGhostLikes] = useState(0);
  const [ghostCommentActive, setGhostCommentActive] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [reactionVisible, setReactionVisible] = useState(false);
  const [reactionPick, setReactionPick] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<
    (typeof liReactions)[number] | null
  >(null);
  const [shareActive, setShareActive] = useState(false);
  const bumpKey = likes.bumped || ghostLikes > 0 ? "bump" : "";

  const handleInteract = useCallback(
    (type: string) => {
      if (type === "like") {
        // LinkedIn thật: hover/long-press Thích → hiện 6 reaction riêng
        // (Thích/Chúc mừng/Ủng hộ/Yêu thích/Sâu sắc/Hài hước), thiên về
        // "Sâu sắc" và "Chúc mừng" hơn IG/FB do văn hoá platform formal.
        // Reaction PERSIST trên nút sau khi picker đóng.
        setReactionVisible(true);
        setGhostLikes((n) => n + 1);
        setTimeout(() => {
          const pool = liReactions.filter((r) =>
            ["like", "insightful", "celebrate", "support"].includes(r.key),
          );
          const chosen = pool[Math.floor(Math.random() * pool.length)];
          setReactionPick(chosen.key);
          setActiveReaction(chosen);
          setTimeout(() => {
            setReactionVisible(false);
            setReactionPick(null);
          }, 900);
        }, 450);
      } else if (type === "comment") {
        setGhostCommentActive(true);
      } else if (type === "send") {
        setShareActive(true);
      }
    },
    [liReactions],
  );

  const ghostState = useGhostTyping(
    ghostCommentActive,
    LI_GHOST_COMMENT_KEYS.map((k) => t(k)),
    () => setCommentCount((n) => n + 1),
    () => setGhostCommentActive(false),
  );

  const shareState = useShareSheet(shareActive, () => setShareActive(false));

  return (
    <div className={`${INNER} ${likes.bumped ? "scale-[1.03]" : ""}`}>
      <LinkedInPost
        authorName={t(slide.authorNameKey)}
        authorTitle={t(slide.authorTitleKey)}
        content={t(slide.contentKey)}
        articleHeadline={t(slide.articleHeadlineKey)}
        imageUrl={slide.imageUrl}
        activeReaction={activeReaction}
        likes={
          <span key={bumpKey} className={bumpKey ? "count-bump" : undefined}>
            {formatComma(likes.value + ghostLikes)}
          </span>
        }
        comments={
          commentCount > 0
            ? `${parseInt(slide.commentsLabel, 10) + commentCount}`
            : slide.commentsLabel
        }
      />
      <CursorGhost
        color="#0a66c2"
        targets={LI_TARGETS}
        onInteract={handleInteract}
      />
      <div className="absolute right-2 bottom-1.5">
        <ReactionPicker
          reactions={liReactions}
          selected={reactionPick}
          visible={reactionVisible}
        />
      </div>
      <LinkedInGhostComment state={ghostState} />
      <LinkedInShareSheet state={shareState} />
    </div>
  );
}

export default MiniPosts;
