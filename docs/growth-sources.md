# 성장 캘린더 sources (checked 2026-11-09 KST)

Everything shown on `/growth` and `/en/growth` comes from these official pages. Dates are computed from the birth date the parent enters.

## 국가예방접종 — 질병관리청 「어린이 표준예방접종일정표(2026)」
- 예방접종도우미: https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuCd=115&menuLv=1
- Same 2026 table republished by public health centres (used to read the cells): https://health.dobong.go.kr/Contents.asp?code=10004917 , https://www.busan.go.kr/depart/ahlifepeople0302 , https://daejeon.go.kr/drh/DrhContentsHtmlView.do?menuSeq=1680
- Used: HepB 출생·1·6개월 / BCG 4주 이내 / DTaP 2·4·6·15–18개월 / IPV 2·4·6–18개월 / Hib 2·4·6·12–15개월 / PCV 2·4·6·12–15개월 / RV1 2·4개월, RV5 2·4·6개월 / MMR 12–15개월 / 수두 12–15개월 / HepA 12–23개월 시작, 2차는 6개월 이상 후 / 일본뇌염 불활성화 1–2차 12–23개월(1개월 간격), 3차 2차 후 11개월(24–35개월); 생백신 1차 12–23개월, 2차 12개월 후 / 인플루엔자 6개월 이상 매년(첫해 4주 간격 2회). Later doses (만 4–6세, 6세, 11–12세) are only mentioned as text after 36 months.
- Interpretation: "N개월" single-point doses are shown as the whole month N (from the N-month date to the day before N+1 months); ranges "A~B개월" run to the day before B+1 months.

## 영유아 건강검진 — 국민건강보험공단
- https://www.nhis.or.kr/nhis/healthin/wbhaca04800m01.do (also 보건복지부 https://www.mohw.go.kr/menu.es?mid=a10706020200)
- 건강검진 1차 14–35일, 2차 4–6개월, 3차 9–12개월, 4차 18–24개월, 5차 30–36개월 (6–8차 42–71개월 mentioned as text); 구강검진 18–29개월, 30–41개월.

## 발달 이정표 · 놀이 — U.S. CDC "Learn the Signs. Act Early." (2022 checklists; pages updated 2026-05-16)
- https://www.cdc.gov/act-early/milestones/ — 2-months, 4-months, 6-months, 9-months, 1-year, 15-months, 18-months, 2-years, 30-months, 3-years.
- Each band shows the CDC list for the band's end age ("by N months, most children (75%+)"). English text is CDC's wording (lightly shortened); Korean is our translation. Activities are three of CDC's "What you can do" tips per age. CDC notes these are not a screening tool — the page disclaimer says so.

## 혜택 시기 — this site's verified benefit records (src/data/benefits.ts + patches-2026.ts, verified 2026-10-26)
- 부모급여 0세 월 100만원 / 1세(12–23개월) 월 50만원 / 출생 후 60일 이내 신청 — 복지로 https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html
- 첫만남이용권 사용기한 출생일부터 2년 — 복지로 https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004656

## 백일
- Shown as D+100 counting the birth day as day 1 (the usual Korean count); this is a calendar convention, not a health guideline.
