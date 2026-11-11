export const questionCardMessages = {
  vi: {
    question: "Câu hỏi",
    of: "/",
    recommended: "Đề xuất",
    other: "Ý khác",
    otherDescription: "Nhập câu trả lời theo ý bạn.",
    answer: "Trả lời AI",
    placeholder: "Nhập câu trả lời của bạn…",
    back: "Quay lại",
    next: "Tiếp theo",
    submit: "Gửi trả lời",
  },
  en: {
    question: "Question",
    of: "of",
    recommended: "Recommended",
    other: "Something else",
    otherDescription: "Write your own answer.",
    answer: "Reply to AI",
    placeholder: "Type your answer…",
    back: "Back",
    next: "Next",
    submit: "Send reply",
  },
};

export const serverRenderMessages = {
  vi: {
    title: "Dựng video tự động",
    submitting: "Đang gửi yêu cầu…",
    progress: "Tiến trình dựng video",
    description:
      "Dựng cảnh đang mở từ media và giọng đọc bạn đã thêm. Thành phẩm được lưu riêng; bạn có thể đóng trang và quay lại xem tiến trình.",
    version: "Từ bản lưu",
    download: "Tải video MP4",
    connection:
      "Chưa lấy được trạng thái. Đang kết nối lại; không cần gửi lại yêu cầu.",
    submitFailed:
      "Chưa xác nhận được yêu cầu. Đang kiểm tra lại công việc đã gửi.",
    downloadFailed:
      "Chưa tải được video. Bạn có thể thử tải lại mà không dựng lại.",
    reconciliation:
      "Công việc cần kiểm tra lại kết quả. Hệ thống không tự gọi AI thêm lần nữa.",
    failed: "Chưa dựng được video. Media và bản dựng gốc vẫn được giữ nguyên.",
    renderMp4:
      "Xuất thêm video MP4 (bỏ chọn để chỉ lấy bản dựng trên timeline)",
    agentProgress: (turns: number, previews: number) =>
      `AI đang dựng: lượt ${turns}, đã xem lại ${previews} bản nháp`,
    openTimeline: "Mở trên timeline",
    sceneName: "Bản AI dựng",
    importedAll:
      "Đã thêm thành cảnh mới trên timeline. Hoàn tác (Ctrl+Z) để gỡ.",
    mp4Only: (items: string) =>
      `Đã thêm thành cảnh mới (Ctrl+Z để gỡ). Chỉ có trong MP4, timeline chưa hỗ trợ: ${items}.`,
    importFailed:
      "Chưa mở được bản dựng trên timeline. Media gốc của dự án cần còn đầy đủ.",
    memoryTitle: (count: number) => `AI đang ghi nhớ ${count} sở thích của bạn`,
    forget: (note: string) => `Xóa ghi nhớ: ${note}`,
    memoryFailed: "Chưa xóa được ghi nhớ. Thử lại sau.",
    stages: {
      queued: "Đang chờ dựng video",
      analyzing: "Đang phân tích media",
      planning: "Đang lập phương án dựng",
      rendering: "Đang dựng video",
      qc: "Đang kiểm tra thành phẩm",
      uploading: "Đang lưu video",
      completed: "Video đã sẵn sàng",
      failed: "Dựng video chưa thành công",
      reconciliation_required: "Đang chờ kiểm tra kết quả",
    },
  },
  en: {
    title: "Render video automatically",
    submitting: "Submitting…",
    progress: "Video rendering progress",
    description:
      "Render the active scene using your media and narration. The result is saved separately; you can close this page and return to check progress.",
    version: "From saved version",
    download: "Download MP4",
    connection:
      "Could not retrieve status. Reconnecting; you do not need to resubmit.",
    submitFailed:
      "Could not confirm admission. Checking previously submitted work.",
    downloadFailed:
      "Could not download the video. You can retry the download without rendering again.",
    reconciliation:
      "The result needs reconciliation. The system will not call AI again automatically.",
    failed:
      "The video could not be rendered. Your original media and editable project are retained.",
    renderMp4: "Also export an MP4 (untick to get only the editable timeline)",
    agentProgress: (turns: number, previews: number) =>
      `AI is editing: turn ${turns}, reviewed ${previews} drafts`,
    openTimeline: "Open on timeline",
    sceneName: "AI edit",
    importedAll:
      "Added as a new scene on the timeline. Undo (Ctrl+Z) removes it.",
    mp4Only: (items: string) =>
      `Added as a new scene (Ctrl+Z removes it). Only in the MP4, not yet on the timeline: ${items}.`,
    importFailed:
      "Could not open the edit on the timeline. The project's original media must still be present.",
    memoryTitle: (count: number) => `AI remembers ${count} of your preferences`,
    forget: (note: string) => `Forget: ${note}`,
    memoryFailed: "Could not remove the preference. Try again later.",
    stages: {
      queued: "Waiting to render video",
      analyzing: "Analyzing media",
      planning: "Planning the edit",
      rendering: "Rendering video",
      qc: "Checking the result",
      uploading: "Saving video",
      completed: "Your video is ready",
      failed: "Rendering failed",
      reconciliation_required: "Waiting for result verification",
    },
  },
};

export const assistantMessages = {
  vi: {
    local: "Tự lưu trên trình duyệt",
    saved: "Đã lưu",
    save: "Lưu bản dựng",
    savedMedia: "Đã lưu bản dựng và media gốc",
    saveFailed: "Chưa lưu được bản dựng",
    assistant: "Trợ lý AI",
    title: "Trợ lý dựng video",
    you: "Bạn",
    conversation: "Cuộc trò chuyện chỉnh sửa video",
    renderTools: "Dựng MP4 trên máy chủ",
    changes: "Thay đổi đã áp dụng",
    close: "Đóng",
    description:
      "Nhắn cho Claude để dựng video từ clip của bạn, rồi nhắn tiếp để sửa.",
    clarify: "Cần anh/chị làm rõ trước khi chỉnh; timeline chưa thay đổi.",
    answer: "Trả lời AI",
    reply: "Gửi trả lời",
    newRequest: "Yêu cầu mới",
    tooLong:
      "Cuộc trao đổi vượt 4.000 ký tự. Hãy rút gọn câu trả lời hoặc bắt đầu yêu cầu mới.",
    appliedSaveFailed:
      "Chỉnh sửa đã hiện trên timeline và có thể Undo, nhưng chưa lưu lên máy chủ. Hãy bấm Lưu bản dựng.",
    question: "Bạn muốn thay đổi điều gì?",
    capabilities:
      "Claude có thể thêm hoặc sửa chữ, đổi khung hình, cắt clip, chỉnh tốc độ, âm lượng, chuyển cảnh và tên bản dựng. Mọi thay đổi được áp dụng cùng lúc và có thể hoàn tác.",
    examples: [
      "Thêm tiêu đề BrandHub trong 3 giây đầu",
      "Đổi khung hình thành 9:16",
      "Giảm âm lượng clip xuống một nửa",
    ],
    plan: "Kết quả chỉnh sửa",
    undoable: "thao tác · Hoàn tác một bước",
    apply: "Áp dụng vào bản dựng",
    instruction: "Yêu cầu chỉnh sửa",
    placeholder: "Ví dụ: thêm tiêu đề ở đầu video…",
    saveFirst: "Bản dựng được lưu trước khi gửi AI.",
    propose: "Gửi",
    working: "Đang xử lý…",
    stale:
      "Bản dựng đã thay đổi sau yêu cầu AI. Hãy lập lại kế hoạch để giữ các chỉnh sửa hiện tại.",
    invalid:
      "Kế hoạch có thao tác không hợp lệ hoặc xung đột. Hãy lập lại kế hoạch.",
    failed: "Chưa hoàn tất yêu cầu AI. Bản dựng được giữ nguyên.",
    applied: "Đã áp dụng kế hoạch. Dùng Hoàn tác để quay lại.",
    actions: {
      rename_project: "Đổi tên",
      set_aspect_ratio: "Đổi khung hình",
      add_text: "Thêm chữ",
      set_text: "Sửa chữ",
      set_volume: "Chỉnh âm lượng",
      trim_clip: "Cắt clip",
      set_speed: "Chỉnh tốc độ",
      set_transition: "Chuyển cảnh",
    },
    fields: {
      text: "Nội dung",
      element_id: "Lớp",
      aspect_ratio: "Tỷ lệ",
      start_seconds: "Bắt đầu (giây)",
      duration_seconds: "Thời lượng (giây)",
      volume: "Âm lượng",
      speed: "Tốc độ",
      transition_id: "Hiệu ứng",
    },
  },
  en: {
    local: "Autosaved on this browser",
    saved: "Saved",
    save: "Save project",
    savedMedia: "Project and original media saved",
    saveFailed: "Could not save this project",
    assistant: "AI assistant",
    title: "Video editing assistant",
    you: "You",
    conversation: "Video editing conversation",
    renderTools: "Render MP4 on server",
    changes: "Applied changes",
    close: "Close",
    description:
      "Message Claude to edit a video from your clips, then keep messaging to refine it.",
    clarify: "Please clarify before editing; the timeline has not changed.",
    answer: "Reply to AI",
    reply: "Send reply",
    newRequest: "New request",
    tooLong:
      "This conversation exceeds 4,000 characters. Shorten your answer or start a new request.",
    appliedSaveFailed:
      "Your edits are visible on the timeline and can be undone, but have not been saved to the server. Click Save project.",
    question: "What would you like to change?",
    capabilities:
      "Claude can add or edit text, change the aspect ratio, trim clips, adjust speed, volume, transitions and the project name. Apply the changes together and undo them in one step.",
    examples: [
      "Add the title BrandHub for the first 3 seconds",
      "Change the aspect ratio to 9:16",
      "Reduce clip volume by half",
    ],
    plan: "Edit result",
    undoable: "actions · Undo in one step",
    apply: "Apply to project",
    instruction: "Editing instruction",
    placeholder: "For example: add a title at the start…",
    saveFirst: "The project is saved before sending it to AI.",
    propose: "Send",
    working: "Working…",
    stale:
      "The project changed after this AI request. Create a new plan to keep your current edits.",
    invalid:
      "The plan contains invalid or conflicting actions. Create a new plan.",
    failed: "Could not complete the AI request. Your project is retained.",
    applied: "Plan applied. Use Undo to return to the previous edit.",
    actions: {
      rename_project: "Rename project",
      set_aspect_ratio: "Change aspect ratio",
      add_text: "Add text",
      set_text: "Edit text",
      set_volume: "Adjust volume",
      trim_clip: "Trim clip",
      set_speed: "Adjust speed",
      set_transition: "Set transition",
    },
    fields: {
      text: "Text",
      element_id: "Layer",
      aspect_ratio: "Ratio",
      start_seconds: "Start (seconds)",
      duration_seconds: "Duration (seconds)",
      volume: "Volume",
      speed: "Speed",
      transition_id: "Transition",
    },
  },
};

export const autoEditChatMessages = {
  vi: {
    conversation: "Trò chuyện dựng video",
    you: "Bạn",
    assistant: "Claude",
    hello: "Bạn muốn làm video gì?",
    intro:
      "Thêm clip vào dự án, rồi kể cho mình bằng lời thường: video để làm gì, dài khoảng bao lâu, cảm giác ra sao. Nếu chưa rõ mình sẽ hỏi lại. Xong bạn có thể nhắn để sửa tiếp.",
    placeholder:
      "Ví dụ: làm video 20 giây quảng cáo matcha latte, vui tươi, có chữ giới thiệu",
    followUp: "Muốn sửa gì? Ví dụ: chữ to hơn, bỏ đoạn cuối, nhạc nhẹ hơn…",
    send: "Gửi",
    newVideo: "Làm video mới",
    starting: "Đang bắt đầu…",
    saving: "Đang lưu video cho bạn…",
    patience:
      "Thường mất 5–15 phút. Bạn có thể đóng bảng này, video vẫn được làm tiếp.",
    checking: "Đang kiểm tra lại kết quả, bạn chờ một chút nhé.",
    failed:
      "Lần này mình chưa làm được video. Bạn thử nhắn lại, hoặc mô tả theo cách khác nhé.",
    loadingVideo: "Đang mở video…",
    videoFailed: "Chưa mở được video.",
    retry: "Thử lại",
    download: "Tải video về máy",
    connection: "Đang kết nối lại… Bạn không cần gửi lại tin nhắn.",
    sendFailed: "Chưa gửi được tin nhắn. Bạn thử lại sau ít giây nhé.",
    sending: "Đang gửi cho Claude…",
    stillWorking: "Claude đang làm lượt trước, đợi xong rồi nhắn tiếp nhé.",
    apply: "Áp dụng vào timeline",
    appliedAgain: "Áp dụng thêm lần nữa",
    applied:
      "Đã thêm thành cảnh mới trên timeline. Muốn gỡ thì bấm Hoàn tác (Ctrl+Z).",
    applyFailed: "Chưa đưa được video vào timeline. Bạn thử lại nhé.",
    sceneName: "Bản Claude dựng",
    layersAvailable:
      "Có lớp video, chữ và âm thanh riêng để chỉnh trên timeline.",
    flattened:
      "Bản này chỉ có MP4 liền. Gửi yêu cầu dựng mới để có các lớp chỉnh riêng.",
    approximate:
      "Một số hiệu ứng chỉ hiển thị đầy đủ trong MP4; trên timeline chúng được giản lược. Video, chữ và âm thanh được nhập theo các lớp đã xuất.",
    saveFailed:
      "Đã thêm vào timeline nhưng chưa lưu lên máy chủ. Bấm Lưu dự án để thử lại; Ctrl+Z vẫn hoàn tác được.",
  },
  en: {
    conversation: "Video editing chat",
    you: "You",
    assistant: "Claude",
    hello: "What video would you like?",
    intro:
      "Add your clips to the project, then describe it in plain words: what it is for, roughly how long, how it should feel. I will ask if something is unclear, and you can message me to change it afterwards.",
    placeholder:
      "e.g. a cheerful 20-second ad for a matcha latte with an intro title",
    followUp:
      "What should change? e.g. bigger text, drop the ending, softer music…",
    send: "Send",
    newVideo: "Start a new video",
    starting: "Getting started…",
    saving: "Saving your video…",
    patience:
      "This usually takes 5–15 minutes. You can close this panel; the work continues.",
    checking: "Double-checking the result, one moment please.",
    failed:
      "I could not make the video this time. Please try again or describe it differently.",
    loadingVideo: "Opening the video…",
    videoFailed: "Could not open the video.",
    retry: "Retry",
    download: "Download video",
    connection: "Reconnecting… You do not need to send your message again.",
    sending: "Sending to Claude…",
    stillWorking: "Claude is still working on the previous turn; message again when it finishes.",
    sendFailed:
      "Could not send the message. Please try again in a few seconds.",
    apply: "Apply to timeline",
    appliedAgain: "Apply again",
    applied:
      "Added as a new scene on the timeline. Press Undo (Ctrl+Z) to remove it.",
    applyFailed: "Could not add the video to the timeline. Please try again.",
    sceneName: "Claude edit",
    layersAvailable:
      "Separate video, text and audio layers are available for timeline editing.",
    flattened:
      "This result is a single MP4. Send a new editing request to get separate editable layers.",
    approximate:
      "Some effects are fully represented only in the MP4 and are simplified on the timeline. Video, text and audio follow the exported layers.",
    saveFailed:
      "Added to the timeline but not saved to the server. Click Save project to retry; Ctrl+Z still undoes the import.",
  },
};
