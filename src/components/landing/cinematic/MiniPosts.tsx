import { InstagramPost } from "./posts/InstagramPost";
import { TikTokPost } from "./posts/TikTokPost";
import { FacebookPost } from "./posts/FacebookPost";
import { LinkedInPost } from "./posts/LinkedInPost";

/**
 * 4 post tí hon ở 4 góc — frame cuối của cinematic sequence.
 * GSAP animate scale + opacity khi BrandHub reveal.
 */
export function MiniPosts() {
  return (
    <>
      <div className="pointer-events-none absolute top-4 left-4 z-10 w-[160px] opacity-50">
        <InstagramPost likes="2.3K" comments="156" />
      </div>
      <div className="pointer-events-none absolute top-4 right-4 z-10 w-[130px] opacity-50">
        <TikTokPost likes="45K" comments="1.2K" />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 w-[180px] opacity-50">
        <FacebookPost likes="2.3K" comments="342" />
      </div>
      <div className="pointer-events-none absolute right-4 bottom-4 z-10 w-[180px] opacity-50">
        <LinkedInPost likes="892" comments="67" />
      </div>
    </>
  );
}

export default MiniPosts;
