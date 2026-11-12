# Thư viện tiếng động — danh sách, nguồn, giấy phép

Mọi file ở đây là **CC0 hoặc public domain**: dùng thương mại được, không bắt buộc ghi công. Kenney khuyến khích ghi công nhưng không bắt buộc. Giấy phép của file Wikimedia Commons lấy từ API ngày 23/10/2026; trước khi phát hành thương mại, mở trang nguồn kiểm lại.

**Dùng trong `edit.py`:** ghi tên file (không đuôi) vào `"sfx"` của shot trong `plan.json`, ví dụ `"sfx": ["pop", "whoosh_dai"]`. Tiếng đặt ở đầu shot; `whoosh`, `whoosh_ngan`, `whoosh_dai`, `riser` bắt đầu sớm hơn để đỉnh hoặc điểm kết rơi đúng điểm cắt (bảng `LEAD` trong `edit.py`). Tên không có trong thư viện thì `edit.py` dùng tiếng tổng hợp sẵn (`whoosh`, `impact`, `heartbeat`) hoặc báo lỗi kèm danh sách tên.

**Mức:** tiếng ngắn chuẩn hóa đỉnh −3 dBFS; tiếng nền (`khong-khi`, `xeo_dau`, `tictac`, `drone`) chuẩn hóa −28 LUFS, fade 1 s hai đầu để lặp hoặc đặt dưới thoại. Định dạng Ogg Vorbis 48 kHz stereo.

**Còn thiếu (chưa tìm được bản CC0 đạt):** braam, tát + tiếng nứt, đĩa nhạc rít, rimshot, stinger, cymbal đảo chiều, tiếng thở, sóng biển, tiếng cười khán giả, đá lạnh, nhai giòn, khóa kéo, gót giày.

## Chuyển cảnh — `chuyen-canh/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `boom` | boom trầm cho thẻ tên/cao trào | 2.5 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `downlifter` | downlifter 2 s sau cú nhấn | 2.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `riser` | riser 4 s dẫn vào cao trào/drop | 4.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `subdrop` | sub drop 120→35 Hz | 1.5 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `whoosh_dai` | whoosh dài cho chuyển chậm | 1.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `whoosh_ngan` | whoosh ngắn, đặt đỉnh đúng điểm cắt | 0.3 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |

## Nhấn chữ, giao diện, đời sống — `nhan-chu/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `bat_tat` | công tắc | 0.6 s | [Kenney — interface-sounds (switch_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `blip` | blip số rất ngắn (20 ms) | 0.0 s | [Kenney — interface-sounds (glitch_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `blip_2` | blip số biến thể | 0.0 s | [Kenney — interface-sounds (glitch_003.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `bong` | chuông ngắn | 0.1 s | [Kenney — interface-sounds (bong_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `click` | click chuột/nút | 0.1 s | [Kenney — interface-sounds (click_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `click_ui` | click giao diện nhẹ | 0.1 s | [Kenney — ui-audio (click1.ogg)](https://kenney.nl/assets/ui-audio) | Kenney | CC0 |
| `cuon` | cuộn | 1.0 s | [Kenney — interface-sounds (scroll_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `ding` | ding kết luận | 1.2 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `ding_ui` | xác nhận, đúng | 0.3 s | [Kenney — interface-sounds (confirmation_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `glitch` | glitch số 0,4 s | 0.4 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `go_phim` | gõ bàn phím | 8.0 s | [Wikimedia Commons — Typing medium speed.ogg](https://commons.wikimedia.org/wiki/File:Typing_medium_speed.ogg) | teto_yasha | Public domain |
| `lat_sach` | lật trang | 0.8 s | [Kenney — rpg-audio (bookFlip1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `loi` | báo lỗi, sai | 0.2 s | [Kenney — interface-sounds (error_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `phong_to` | phóng to, mở thẻ | 0.3 s | [Kenney — interface-sounds (maximize_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `pluck` | gảy dây ngắn | 0.1 s | [Kenney — interface-sounds (pluck_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `pop` | pop khi chữ bật | 0.1 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `rung_may` | điện thoại rung 2 lần | 1.8 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `thong_bao` | thông báo điện thoại 2 nốt | 0.7 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `thu_nho` | thu nhỏ, đóng thẻ | 0.3 s | [Kenney — interface-sounds (minimize_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `tick` | tick liệt kê | 0.0 s | [Kenney — interface-sounds (tick_001.ogg)](https://kenney.nl/assets/interface-sounds) | Kenney | CC0 |
| `tinh_tien` | máy tính tiền | 2.2 s | [Wikimedia Commons — Cash register.ogg](https://commons.wikimedia.org/wiki/File:Cash_register.ogg) | Me | Public domain |
| `xu` | đồng xu, tiền | 0.8 s | [Kenney — rpg-audio (handleCoins.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |

## Va chạm, foley — `va-cham/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `buoc_chan` | bước chân sàn cứng | 0.1 s | [Kenney — impact-sounds (footstep_concrete_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `buoc_chan_go` | bước chân sàn gỗ | 0.3 s | [Kenney — impact-sounds (footstep_wood_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `chuong` | chuông kim loại | 1.5 s | [Kenney — impact-sounds (impactBell_heavy_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `cua_dong` | đóng cửa | 0.7 s | [Kenney — rpg-audio (doorClose_1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `cua_mo` | mở cửa | 0.9 s | [Kenney — rpg-audio (doorOpen_1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `dam` | cú đấm nặng | 0.6 s | [Kenney — impact-sounds (impactPunch_heavy_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `dam_nhe` | cú đấm vừa | 0.4 s | [Kenney — impact-sounds (impactPunch_medium_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `dao` | rút dao | 0.4 s | [Kenney — rpg-audio (drawKnife1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `go` | va gỗ | 0.3 s | [Kenney — impact-sounds (impactWood_heavy_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `keo_ket` | kẽo kẹt | 0.7 s | [Kenney — rpg-audio (creak1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `kim_loai` | va kim loại | 0.2 s | [Kenney — impact-sounds (impactMetal_heavy_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `kinh_vo` | kính va mạnh | 0.2 s | [Kenney — impact-sounds (impactGlass_heavy_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `nga` | ngã, vật mềm rơi | 0.5 s | [Kenney — impact-sounds (impactSoft_heavy_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |

## Hài — `hai/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `boing` | boing | 1.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `bonk` | cốc đầu, bonk | 0.3 s | [Kenney — impact-sounds (impactWood_light_000.ogg)](https://kenney.nl/assets/impact-sounds) | Kenney | CC0 |
| `coi_truot` | còi trượt lên | 1.2 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `de_keu` | dế kêu (im lặng ngượng) | 8.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |

## Căng thẳng — `cang-thang/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `drone` | drone 40–60 Hz, lặp được | 20.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |
| `tictac` | đồng hồ tích tắc | 15.0 s | [Wikimedia Commons — Clock ticking.ogg](https://commons.wikimedia.org/wiki/File:Clock_ticking.ogg) | natalie | Public domain |
| `tim_dap` | nhịp tim 60 BPM | 8.0 s | Tổng hợp bằng FFmpeg trong dự án | DemoVideo | CC0 |

## Không khí (nền) — `khong-khi/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `can_tin` | căng tin trường | 60.0 s | [Wikimedia Commons — High school cafeteria.ogg](https://commons.wikimedia.org/wiki/File:High_school_cafeteria.ogg) | aradlaw | Public domain |
| `chim` | chim hót trong vườn | 47.0 s | [Wikimedia Commons — Birds singing in garden.ogg](https://commons.wikimedia.org/wiki/File:Birds_singing_in_garden.ogg) | ezwa | Public domain |
| `dam_dong` | đám đông lễ hội | 58.1 s | [Wikimedia Commons — Festival concert people crowd.ogg](https://commons.wikimedia.org/wiki/File:Festival_concert_people_crowd.ogg) | stephan | Public domain |
| `gio` | gió hú | 60.0 s | [Wikimedia Commons — Howling wind.ogg](https://commons.wikimedia.org/wiki/File:Howling_wind.ogg) | Tvabutzku1234 | CC0 |
| `hoan_ho` | vỗ tay hoan hô | 11.6 s | [Wikimedia Commons — Clapping hurray.ogg](https://commons.wikimedia.org/wiki/File:Clapping_hurray.ogg) | starlite | Public domain |
| `lop_hoc` | lớp học | 60.0 s | [Wikimedia Commons — Ambient classroom mono.ogg](https://commons.wikimedia.org/wiki/File:Ambient_classroom_mono.ogg) | rcrossley | Public domain |
| `mua` | mưa | 43.0 s | [Wikimedia Commons — Rain (1).ogg](https://commons.wikimedia.org/wiki/File:Rain_(1).ogg) | ezwa | Public domain |
| `mua_sam` | mưa và sấm | 60.0 s | [Wikimedia Commons — Rain and thunder (1).ogg](https://commons.wikimedia.org/wiki/File:Rain_and_thunder_(1).ogg) | ezwa | Public domain |
| `pho` | phố đi bộ | 60.0 s | [Wikimedia Commons — Karlova 0001.ogg](https://commons.wikimedia.org/wiki/File:Karlova_0001.ogg) | Juan de Vojníkov | Public domain |
| `quan_ca_phe` | quán cà phê | 60.0 s | [Wikimedia Commons — Cafe ambiance.ogg](https://commons.wikimedia.org/wiki/File:Cafe_ambiance.ogg) | Marble Toast | CC0 |
| `trung_tam_tm` | trung tâm thương mại vắng | 30.0 s | [Wikimedia Commons — Shopping mall less crowded.ogg](https://commons.wikimedia.org/wiki/File:Shopping_mall_less_crowded.ogg) | natalie | Public domain |
| `vo_tay` | vỗ tay | 17.3 s | [Wikimedia Commons — Applause i.ogg](https://commons.wikimedia.org/wiki/File:Applause_i.ogg) | thore | Public domain |

## Ẩm thực — `am-thuc/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `cat` | cắt bằng dao | 0.6 s | [Kenney — rpg-audio (knifeSlice.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `chat` | chặt | 0.2 s | [Kenney — rpg-audio (chop.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `noi` | nồi kim loại | 1.5 s | [Kenney — rpg-audio (metalPot1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `rot_nuoc` | rót nước | 10.0 s | [Wikimedia Commons — Pouring water bottles.ogg](https://commons.wikimedia.org/wiki/File:Pouring_water_bottles.ogg) | stephan | Public domain |
| `rot_nuoc_soi` | rót nước sôi vào cốc | 13.2 s | [Wikimedia Commons — Boiling water being poured into a mug for tea.ogg](https://commons.wikimedia.org/wiki/File:Boiling_water_being_poured_into_a_mug_for_tea.ogg) | cori | Public domain |
| `xeo_dau` | chiên ngập dầu | 30.0 s | [Wikimedia Commons — Frying fries going in and out of oil.ogg](https://commons.wikimedia.org/wiki/File:Frying_fries_going_in_and_out_of_oil.ogg) | ezwa | Public domain |
| `xeo_ngan` | xèo ngắn | 4.8 s | [Wikimedia Commons — Zzrrrp sizzle.ogg](https://commons.wikimedia.org/wiki/File:Zzrrrp_sizzle.ogg) | stephan | Public domain |

## Thời trang — `thoi-trang/`

| Tên | Dùng cho | Dài | Nguồn | Tác giả | Giấy phép |
|---|---|---|---|---|---|
| `man_trap` | màn trập máy ảnh | 2.1 s | [Wikimedia Commons — Holga shuttersound.ogg](https://commons.wikimedia.org/wiki/File:Holga_shuttersound.ogg) | Doitashimashite at Dutch Wikipedia | Public domain |
| `man_trap_lien` | chụp liên tiếp | 4.0 s | [Wikimedia Commons — Auslösegeräusch SLR Serienaufnahme bis Puffer voll.oga](https://commons.wikimedia.org/wiki/File:Ausl%C3%B6seger%C3%A4usch_SLR_Serienaufnahme_bis_Puffer_voll.oga) | Smial (talk) | CC0 |
| `that_lung` | khóa thắt lưng, da | 0.3 s | [Kenney — rpg-audio (beltHandle1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `vai` | vải sột soạt | 0.7 s | [Kenney — rpg-audio (cloth1.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |
| `vai_2` | vải sột soạt biến thể | 0.5 s | [Kenney — rpg-audio (cloth3.ogg)](https://kenney.nl/assets/rpg-audio) | Kenney | CC0 |

Thêm tiếng mới: đặt file `.ogg` vào nhóm phù hợp, tên không dấu, không trùng tên ở nhóm khác, rồi thêm một dòng vào bảng trên kèm nguồn và giấy phép.
