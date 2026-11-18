// 성장 캘린더 data. Official sources only (see docs/growth-sources.md, checked 2026-11-09):
//  - 질병관리청 예방접종도우미 「어린이 표준예방접종일정표(2026)」 https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuCd=115&menuLv=1
//  - 국민건강보험공단 영유아 건강검진 시기 https://www.nhis.or.kr/nhis/healthin/wbhaca04800m01.do
//  - CDC "Learn the Signs. Act Early." milestones (2022 checklists, pages updated 2026-05) https://www.cdc.gov/act-early/milestones/
//    Korean lines are our translation of the CDC wording; "activities" are picked from CDC's "What you can do" tips.
//  - Benefit timing = this site's own verified benefit records (nat-001 첫만남이용권, nat-002/003 부모급여).
// Ages: m = months after birth (calendar months), d = days after birth (birth day = day 0).

/** Age bands; each band's milestones are CDC's "by N months" list for the band's end age. */
export const BANDS = [
  { id: "b0", from: 0, to: 2, cdc: "2-months" },
  { id: "b2", from: 2, to: 4, cdc: "4-months" },
  { id: "b4", from: 4, to: 6, cdc: "6-months" },
  { id: "b6", from: 6, to: 9, cdc: "9-months" },
  { id: "b9", from: 9, to: 12, cdc: "1-year" },
  { id: "b12", from: 12, to: 15, cdc: "15-months" },
  { id: "b15", from: 15, to: 18, cdc: "18-months" },
  { id: "b18", from: 18, to: 24, cdc: "2-years" },
  { id: "b24", from: 24, to: 30, cdc: "30-months" },
  { id: "b30", from: 30, to: 36, cdc: "3-years" },
];

/**
 * Schedule items. at: { m } or { d } start; until: optional end ({ m } or { d }, inclusive month = through the day before).
 * kind: vax | check | benefit | day.
 */
export const ITEMS = [
  // ── 국가예방접종 (KDCA 2026) ──
  { id: "hepb1", kind: "vax", at: { d: 0 }, ko: "B형간염 1차", en: "Hepatitis B, dose 1", noteKo: "출생 시", noteEn: "At birth" },
  { id: "bcg", kind: "vax", at: { d: 0 }, until: { d: 28 }, ko: "결핵(BCG, 피내용) 1회", en: "Tuberculosis (BCG, intradermal)", noteKo: "생후 4주 이내", noteEn: "Within 4 weeks of birth" },
  { id: "hepb2", kind: "vax", at: { m: 1 }, ko: "B형간염 2차", en: "Hepatitis B, dose 2", noteKo: "생후 1개월", noteEn: "1 month" },
  { id: "m2", kind: "vax", at: { m: 2 }, ko: "DTaP·IPV(폴리오)·Hib·폐렴구균·로타바이러스 1차", en: "DTaP, IPV (polio), Hib, pneumococcal, rotavirus — dose 1", noteKo: "생후 2개월 · 혼합백신으로 접종할 수 있어요", noteEn: "2 months · combination vaccines may be used" },
  { id: "m4", kind: "vax", at: { m: 4 }, ko: "DTaP·IPV·Hib·폐렴구균·로타바이러스 2차", en: "DTaP, IPV, Hib, pneumococcal, rotavirus — dose 2", noteKo: "생후 4개월", noteEn: "4 months" },
  { id: "m6", kind: "vax", at: { m: 6 }, ko: "DTaP·Hib·폐렴구균 3차 · B형간염 3차 · 로타(RV5) 3차", en: "DTaP, Hib, pneumococcal dose 3 · hepatitis B dose 3 · rotavirus (RV5 only) dose 3", noteKo: "생후 6개월 · 로타 RV1은 2회로 끝나요", noteEn: "6 months · RV1 rotavirus is complete after 2 doses" },
  { id: "ipv3", kind: "vax", at: { m: 6 }, until: { m: 18 }, ko: "폴리오(IPV) 3차", en: "Polio (IPV), dose 3", noteKo: "생후 6~18개월", noteEn: "6–18 months" },
  { id: "flu", kind: "vax", at: { m: 6 }, ko: "인플루엔자 (매년)", en: "Influenza (every year)", noteKo: "생후 6개월부터 매년 · 처음 맞는 해는 4주 간격 2회", noteEn: "Every year from 6 months · 2 doses 4 weeks apart in the first season" },
  { id: "m12", kind: "vax", at: { m: 12 }, until: { m: 15 }, ko: "Hib·폐렴구균 4차 · MMR 1차 · 수두 1회", en: "Hib & pneumococcal dose 4 · MMR dose 1 · varicella", noteKo: "생후 12~15개월", noteEn: "12–15 months" },
  { id: "hepa", kind: "vax", at: { m: 12 }, until: { m: 23 }, ko: "A형간염 1차 (2차는 1차 후 6개월 이상 지나서)", en: "Hepatitis A dose 1 (dose 2 at least 6 months later)", noteKo: "생후 12~23개월 시작", noteEn: "Start at 12–23 months" },
  { id: "je", kind: "vax", at: { m: 12 }, until: { m: 23 }, ko: "일본뇌염 기초접종", en: "Japanese encephalitis, primary doses", noteKo: "불활성화 백신 1~2차(1개월 간격) 또는 약독화 생백신 1차 · 생후 12~23개월", noteEn: "Inactivated vaccine doses 1–2 (1 month apart) or live vaccine dose 1 · 12–23 months" },
  { id: "dtap4", kind: "vax", at: { m: 15 }, until: { m: 18 }, ko: "DTaP 4차", en: "DTaP, dose 4", noteKo: "생후 15~18개월", noteEn: "15–18 months" },
  { id: "je3", kind: "vax", at: { m: 24 }, until: { m: 35 }, ko: "일본뇌염 추가접종", en: "Japanese encephalitis, next dose", noteKo: "불활성화 3차(2차 후 11개월) 또는 생백신 2차(1차 후 12개월) · 생후 24~35개월", noteEn: "Inactivated dose 3 (11 months after dose 2) or live dose 2 (12 months after dose 1) · 24–35 months" },
  // ── 영유아 건강검진 (NHIS) ──
  { id: "chk1", kind: "check", at: { d: 14 }, until: { d: 35 }, ko: "영유아 건강검진 1차", en: "Infant health checkup #1", noteKo: "생후 14~35일", noteEn: "Day 14–35" },
  { id: "chk2", kind: "check", at: { m: 4 }, until: { m: 6 }, ko: "영유아 건강검진 2차", en: "Infant health checkup #2", noteKo: "생후 4~6개월", noteEn: "4–6 months" },
  { id: "chk3", kind: "check", at: { m: 9 }, until: { m: 12 }, ko: "영유아 건강검진 3차 (발달선별검사)", en: "Infant health checkup #3 (developmental screening)", noteKo: "생후 9~12개월", noteEn: "9–12 months" },
  { id: "chk4", kind: "check", at: { m: 18 }, until: { m: 24 }, ko: "영유아 건강검진 4차", en: "Infant health checkup #4", noteKo: "생후 18~24개월", noteEn: "18–24 months" },
  { id: "oral1", kind: "check", at: { m: 18 }, until: { m: 29 }, ko: "영유아 구강검진 1차", en: "Infant dental checkup #1", noteKo: "생후 18~29개월", noteEn: "18–29 months" },
  { id: "chk5", kind: "check", at: { m: 30 }, until: { m: 36 }, ko: "영유아 건강검진 5차", en: "Infant health checkup #5", noteKo: "생후 30~36개월", noteEn: "30–36 months" },
  { id: "oral2", kind: "check", at: { m: 30 }, until: { m: 41 }, ko: "영유아 구강검진 2차", en: "Infant dental checkup #2", noteKo: "생후 30~41개월", noteEn: "30–41 months" },
  // ── 혜택 시기 (site benefit records) ──
  { id: "pay60", kind: "benefit", at: { d: 0 }, until: { d: 60 }, ko: "부모급여 신청 (출생 후 60일 이내)", en: "Apply for the Parental Benefit (within 60 days of birth)", noteKo: "만 0세 월 100만원", noteEn: "₩1,000,000/month at age 0", href: "/guide/parent-allowance-deadline" },
  { id: "pay12", kind: "benefit", at: { m: 12 }, ko: "부모급여 월 50만원으로 전환", en: "Parental Benefit changes to ₩500,000/month", noteKo: "만 1세(12~23개월) · 자동 전환", noteEn: "Age 1 (12–23 months) · switches automatically", href: "/benefit/nat-003" },
  { id: "pay24", kind: "benefit", at: { m: 24 }, ko: "부모급여 지급 종료 (24개월)", en: "Parental Benefit ends (24 months)", noteKo: "부모급여는 23개월까지", noteEn: "Paid through 23 months", href: "/benefit/nat-003" },
  { id: "voucher", kind: "benefit", at: { m: 24 }, ko: "첫만남이용권 사용기한 (출생일부터 2년)", en: "First Meeting Voucher expires (2 years from birth)", noteKo: "남은 금액은 이 날 전에 사용하세요", noteEn: "Use any remaining balance before this date", href: "/benefit/nat-001" },
  // ── 기념일 ──
  { id: "d100", kind: "day", at: { d: 99 }, ko: "백일 (태어난 날을 1일로 셈)", en: "100th day (counting birth day as day 1)" },
  { id: "dol", kind: "day", at: { m: 12 }, ko: "첫돌", en: "First birthday" },
];

/** CDC milestones per band (social · language · cognitive · movement) + 3 CDC activity tips. */
export const MILESTONES = {
  b0: {
    social: [["말을 걸거나 안아주면 진정해요", "Calms down when spoken to or picked up"], ["얼굴을 바라봐요", "Looks at your face"], ["다가가면 반가워하는 것 같아요", "Seems happy to see you when you walk up"], ["말을 걸거나 웃어주면 웃어요", "Smiles when you talk to or smile at her"]],
    language: [["울음 외의 소리를 내요", "Makes sounds other than crying"], ["큰 소리에 반응해요", "Reacts to loud sounds"]],
    cognitive: [["움직이는 사람을 눈으로 따라가요", "Watches you as you move"], ["장난감을 몇 초 동안 바라봐요", "Looks at a toy for several seconds"]],
    movement: [["엎드려 있을 때 고개를 들어요", "Holds head up when on tummy"], ["양팔과 양다리를 움직여요", "Moves both arms and both legs"], ["손을 잠깐씩 펴요", "Opens hands briefly"]],
    play: [["아기가 소리를 내면 웃으며 대답해 주세요 — 주고받는 대화의 시작이에요", "Respond when your baby makes sounds — smile and talk back"], ["말하기·책 읽기·노래를 자주 들려주세요", "Talk, read, and sing to your baby"], ["깨어 있을 때 엎드려 놀게 하고 눈높이에 장난감을 두세요 (곁에서 지켜보기)", "Tummy time while awake, with toys at eye level (stay with your baby)"]],
  },
  b2: {
    social: [["관심을 끌려고 스스로 웃어요", "Smiles on his own to get your attention"], ["웃기려 하면 킥킥거려요", "Chuckles when you try to make him laugh"], ["관심을 끌려고 쳐다보거나 움직이거나 소리를 내요", "Looks, moves, or makes sounds to get your attention"]],
    language: [["'우~', '아~' 같은 옹알이를 해요", "Makes sounds like \u201coooo\u201d, \u201caahh\u201d (cooing)"], ["말을 걸면 소리로 대답해요", "Makes sounds back when you talk to him"], ["목소리 나는 쪽으로 고개를 돌려요", "Turns head towards the sound of your voice"]],
    cognitive: [["배고플 때 젖이나 젖병을 보면 입을 벌려요", "If hungry, opens mouth when he sees breast or bottle"], ["자기 손을 흥미롭게 바라봐요", "Looks at her hands with interest"]],
    movement: [["안고 있을 때 받쳐주지 않아도 고개를 가눠요", "Holds head steady without support when held"], ["손에 쥐여준 장난감을 잡고 있어요", "Holds a toy when you put it in his hand"], ["팔을 휘둘러 장난감을 쳐요", "Uses his arm to swing at toys"], ["손을 입으로 가져가요", "Brings hands to mouth"], ["엎드리면 팔꿈치로 상체를 받쳐요", "Pushes up onto elbows/forearms when on tummy"]],
    play: [["담요 위에 안전한 장난감을 두고 손 뻗기·발차기를 하게 해 주세요", "Let your baby reach for and kick at safe toys on a blanket"], ["까꿍 놀이를 해 보세요", "Play peek-a-boo"], ["아기 소리를 따라 하며 '대화'를 주고받아 보세요", "Copy your baby's sounds and take turns \u201ctalking\u201d"]],
  },
  b4: {
    social: [["익숙한 사람을 알아봐요", "Knows familiar people"], ["거울 속 자기 모습 보기를 좋아해요", "Likes to look at self in a mirror"], ["소리 내어 웃어요", "Laughs"]],
    language: [["번갈아 소리를 주고받아요", "Takes turns making sounds with you"], ["혀를 내밀고 '푸르르' 소리를 내요", "Blows \u201craspberries\u201d"], ["꺅 하는 소리를 내요", "Makes squealing noises"]],
    cognitive: [["물건을 입에 넣어 탐색해요", "Puts things in her mouth to explore them"], ["원하는 장난감을 잡으려고 손을 뻗어요", "Reaches to grab a toy she wants"], ["더 먹기 싫으면 입을 다물어요", "Closes lips to show she doesn't want more food"]],
    movement: [["엎드린 자세에서 뒤집어 바로 누워요", "Rolls from tummy to back"], ["엎드려서 팔을 쭉 펴고 상체를 들어요", "Pushes up with straight arms when on tummy"], ["앉을 때 손으로 바닥을 짚어 몸을 받쳐요", "Leans on hands to support herself when sitting"]],
    play: [["그림책 속 그림을 보며 이야기해 주세요", "\u201cRead\u201d colorful pictures together and talk about them"], ["장난감을 손이 닿을 듯 말 듯한 곳에 두고 뒤집기를 응원해 주세요", "Put toys just out of reach to encourage rolling"], ["이유식 시작 시기는 소아과 의사와 상의하세요", "Ask your baby's doctor when to start solid foods"]],
  },
  b6: {
    social: [["낯선 사람 앞에서 수줍어하거나 매달리거나 무서워해요", "Is shy, clingy, or fearful around strangers"], ["기쁨·슬픔·화남·놀람 등 여러 표정을 지어요", "Shows several facial expressions"], ["이름을 부르면 쳐다봐요", "Looks when you call her name"], ["부모가 떠나면 반응해요(쳐다보거나 손을 뻗거나 울어요)", "Reacts when you leave"], ["까꿍 놀이에 웃어요", "Smiles or laughs when you play peek-a-boo"]],
    language: [["'마마마마', '바바바바' 같은 다양한 소리를 내요", "Makes sounds like \u201cmamamama\u201d and \u201cbababababa\u201d"], ["안아달라고 팔을 들어요", "Lifts arms up to be picked up"]],
    cognitive: [["떨어져 안 보이는 물건을 찾아요", "Looks for objects when dropped out of sight"], ["두 물건을 맞부딪혀요", "Bangs two things together"]],
    movement: [["혼자 앉는 자세로 바꿔요", "Gets to a sitting position by herself"], ["물건을 한 손에서 다른 손으로 옮겨요", "Moves things from one hand to the other"], ["손가락으로 음식을 긁어 당겨요", "Uses fingers to \u201crake\u201d food towards himself"], ["받쳐주지 않아도 앉아 있어요", "Sits without support"]],
    play: [["아기 소리를 따라 하고 그 소리로 시작하는 단어를 말해 주세요 ('바바바' → '바나나')", "Repeat your baby's sounds and say simple words using them"], ["장난감을 조금 떨어진 곳에 두고 기기·구르기를 응원해 주세요", "Place toys a little out of reach to encourage crawling or scooting"], ["'빠이빠이' 손 흔들기를 가르쳐 주세요", "Teach waving \u201cbye-bye\u201d"]],
  },
  b9: {
    social: [["'짝짜꿍' 같은 놀이를 함께 해요", "Plays games with you, like pat-a-cake"]],
    language: [["'빠이빠이' 손을 흔들어요", "Waves \u201cbye-bye\u201d"], ["부모를 '엄마', '아빠' 등으로 불러요", "Calls a parent \u201cmama\u201d or \u201cdada\u201d or another special name"], ["'안 돼'를 알아들어요(잠깐 멈춰요)", "Understands \u201cno\u201d"]],
    cognitive: [["블록을 컵에 넣는 것처럼 통에 물건을 넣어요", "Puts something in a container"], ["숨기는 걸 본 물건을 찾아요", "Looks for things he sees you hide"]],
    movement: [["붙잡고 일어서요", "Pulls up to stand"], ["가구를 잡고 걸어요", "Walks, holding on to furniture"], ["잡아주면 뚜껑 없는 컵으로 마셔요", "Drinks from a cup without a lid, as you hold it"], ["엄지와 검지로 작은 것을 집어요", "Picks things up between thumb and pointer finger"]],
    play: [["하고 있는 일을 말이나 노래로 들려주세요 ('손 씻자~')", "Talk or sing about what you're doing"], ["아기가 한 말을 늘려서 되돌려 주세요 ('차' → '맞아, 파란 차')", "Build on what your baby tries to say"], ["블록 등 손을 쓰는 장난감으로 함께 놀아 주세요", "Play with blocks and toys that use hands"]],
  },
  b12: {
    social: [["놀 때 다른 아이를 따라 해요", "Copies other children while playing"], ["좋아하는 물건을 보여줘요", "Shows you an object she likes"], ["신나면 손뼉을 쳐요", "Claps when excited"], ["인형을 안아요", "Hugs stuffed doll or other toy"], ["안기거나 뽀뽀하며 애정을 표현해요", "Shows you affection"]],
    language: [["'엄마', '아빠' 외에 한두 단어를 말하려 해요", "Tries to say one or two words besides \u201cmama\u201d or \u201cdada\u201d"], ["이름을 말하면 그 물건을 쳐다봐요", "Looks at a familiar object when you name it"], ["손짓과 말을 함께 하면 지시를 따라요", "Follows directions given with both a gesture and words"], ["원하는 것을 손가락으로 가리켜요", "Points to ask for something or to get help"]],
    cognitive: [["전화기·컵·책을 제대로 쓰려고 해요", "Tries to use things the right way, like a phone, cup, or book"], ["작은 블록을 두 개 이상 쌓아요", "Stacks at least two small objects"]],
    movement: [["혼자 몇 걸음 걸어요", "Takes a few steps on his own"], ["손가락으로 음식을 집어 먹어요", "Uses fingers to feed herself some food"]],
    play: [["아이가 가리키는 물건의 이름을 말해 주세요", "Name objects when your child points to them"], ["신발 가져오기처럼 일상 일을 돕게 해 주세요", "Let your child help with everyday activities"], ["블록을 쌓고 무너뜨리며 놀아 주세요", "Stack blocks and let your child knock them down"]],
  },
  b15: {
    social: [["떨어져 놀다가도 부모가 가까이 있는지 확인해요", "Moves away from you, but looks to make sure you are close by"], ["재미있는 것을 가리켜 보여줘요", "Points to show you something interesting"], ["씻겨 달라고 손을 내밀어요", "Puts hands out for you to wash them"], ["함께 책 몇 쪽을 봐요", "Looks at a few pages in a book with you"], ["옷 입을 때 팔을 넣거나 발을 들어 도와요", "Helps you dress him"]],
    language: [["'엄마', '아빠' 외에 세 단어 이상 말하려 해요", "Tries to say three or more words besides \u201cmama\u201d or \u201cdada\u201d"], ["손짓 없이 한 단계 지시를 따라요 ('그거 줘')", "Follows one-step directions without gestures"]],
    cognitive: [["빗자루질 같은 집안일을 따라 해요", "Copies you doing chores"], ["장난감 자동차를 밀며 노는 등 간단히 놀아요", "Plays with toys in a simple way"]],
    movement: [["아무것도 잡지 않고 걸어요", "Walks without holding on to anyone or anything"], ["끄적거려요", "Scribbles"], ["뚜껑 없는 컵으로 마셔요(가끔 흘려요)", "Drinks from a cup without a lid and may spill"], ["손가락으로 집어 먹어요", "Feeds himself with his fingers"], ["숟가락을 써 보려 해요", "Tries to use a spoon"], ["도움 없이 소파나 의자에 오르내려요", "Climbs on and off a couch or chair without help"]],
    play: [["인형에게 밥 먹이기 같은 역할 놀이를 해 보세요", "Encourage pretend play, like feeding a stuffed animal"], ["몸 이름을 가리키며 알려 주세요 ('여기 코!')", "Teach names of body parts"], ["공 굴리기, 통에 넣고 빼기 놀이를 해 보세요", "Roll balls back and forth, put things in and out of containers"]],
  },
  b18: {
    social: [["다른 사람이 다치거나 속상하면 알아차려요", "Notices when others are hurt or upset"], ["새로운 상황에서 부모 얼굴을 보고 반응을 정해요", "Looks at your face to see how to react in a new situation"]],
    language: [["'곰 어디 있어?' 하면 책에서 가리켜요", "Points to things in a book when you ask"], ["'우유 더'처럼 두 단어를 붙여 말해요", "Says at least two words together"], ["물으면 몸의 두 군데 이상을 가리켜요", "Points to at least two body parts when asked"], ["손 키스·고개 끄덕이기 같은 몸짓을 써요", "Uses more gestures, like blowing a kiss or nodding yes"]],
    cognitive: [["한 손으로 잡고 다른 손으로 뚜껑을 열어요", "Holds something in one hand while using the other"], ["장난감의 스위치·버튼을 써 보려 해요", "Tries to use switches, knobs, or buttons on a toy"], ["장난감 음식을 접시에 놓는 것처럼 여러 장난감으로 놀아요", "Plays with more than one toy at the same time"]],
    movement: [["공을 차요", "Kicks a ball"], ["뛰어요", "Runs"], ["계단 몇 칸을 걸어 올라가요(도움 있어도 괜찮아요)", "Walks (not climbs) up a few stairs, with or without help"], ["숟가락으로 먹어요", "Eats with a spoon"]],
    play: [["식사 준비 때 컵·냅킨 나르기를 맡겨 보세요", "Let your child help get ready for mealtime"], ["공을 차고 굴리고 던지며 놀아 주세요", "Give balls to kick, roll, and throw"], ["모양·동물 퍼즐을 함께 하며 이름을 말해 주세요", "Do simple puzzles together and name each piece"]],
  },
  b24: {
    social: [["다른 아이 옆에서 놀고 가끔 함께 놀아요", "Plays next to other children and sometimes plays with them"], ["'나 봐!' 하며 할 수 있는 걸 보여줘요", "Shows you what she can do by saying \u201cLook at me!\u201d"], ["'정리할 시간이야' 같은 간단한 일과를 따라요", "Follows simple routines when told"]],
    language: [["50단어 정도 말해요", "Says about 50 words"], ["'멍멍이 뛰어'처럼 동작 단어를 넣어 두 단어 이상 말해요", "Says two or more words together, with one action word"], ["책 그림을 가리키며 물으면 이름을 말해요", "Names things in a book when you point and ask"], ["'나', '우리' 같은 말을 써요", "Says words like \u201cI,\u201d \u201cme,\u201d or \u201cwe\u201d"]],
    cognitive: [["블록을 음식처럼 인형에게 먹이는 흉내를 내요", "Uses things to pretend"], ["작은 의자를 딛고 올라가 물건을 잡는 등 문제를 해결해요", "Shows simple problem-solving skills"], ["두 단계 지시를 따라요", "Follows two-step instructions"], ["색깔을 하나 이상 알아요", "Shows he knows at least one color"]],
    movement: [["문손잡이를 돌리거나 뚜껑을 돌려 열어요", "Uses hands to twist things"], ["헐렁한 바지 같은 옷을 혼자 벗어요", "Takes some clothes off by himself"], ["두 발로 깡충 뛰어요", "Jumps off the ground with both feet"], ["책장을 한 장씩 넘겨요", "Turns book pages, one at a time"]],
    play: [["아이가 원하는 대로 노는 '자유 놀이' 시간을 주세요", "Encourage \u201cfree play\u201d"], ["책을 읽으며 '누가? 뭐? 어디?'를 물어봐 주세요", "Ask \u201cWho?\u201d \u201cWhat?\u201d \u201cWhere?\u201d about books"], ["크레파스나 분필로 선과 동그라미 그리기를 해 보세요", "Draw lines and circles together"]],
  },
  b30: {
    social: [["부모가 떠난 뒤 10분 안에 진정해요(어린이집 등원 등)", "Calms down within 10 minutes after you leave"], ["다른 아이들을 알아보고 함께 놀아요", "Notices other children and joins them to play"]],
    language: [["두 번 이상 주고받으며 대화해요", "Talks with you in conversation using at least two back-and-forth exchanges"], ["'누구', '뭐', '어디', '왜' 질문을 해요", "Asks \u201cwho,\u201d \u201cwhat,\u201d \u201cwhere,\u201d or \u201cwhy\u201d questions"], ["그림 속 동작을 말해요('뛰어', '먹어')", "Says what action is happening in a picture or book"], ["물으면 자기 이름을 말해요", "Says first name, when asked"], ["대부분 다른 사람이 알아들을 만큼 말해요", "Talks well enough for others to understand, most of the time"]],
    cognitive: [["보여주면 동그라미를 그려요", "Draws a circle, when you show him how"], ["주의를 주면 뜨거운 물건을 만지지 않아요", "Avoids touching hot objects when you warn her"]],
    movement: [["큰 구슬이나 마카로니를 줄에 꿰어요", "Strings items together"], ["헐렁한 바지나 점퍼를 혼자 입어요", "Puts on some clothes by himself"], ["포크를 써요", "Uses a fork"]],
    play: [["감정을 말로 표현하도록 도와주세요", "Talk about emotions and give your child words for feelings"], ["계단·몸 등을 세며 숫자 놀이를 해 보세요", "Play counting games"], ["과일 씻기처럼 간단한 요리를 함께 해 보세요", "Let your child help with simple cooking tasks"]],
  },
};

export const SOURCES = [
  { ko: "질병관리청 예방접종도우미 · 어린이 표준예방접종일정표(2026)", en: "KDCA Immunization Helper · Children's standard immunization schedule (2026)", url: "https://nip.kdca.go.kr/irhp/infm/goVcntInfo.do?menuCd=115&menuLv=1" },
  { ko: "국민건강보험공단 · 영유아 건강검진 안내", en: "National Health Insurance Service · Infant health checkups", url: "https://www.nhis.or.kr/nhis/healthin/wbhaca04800m01.do" },
  { ko: "미국 CDC · Learn the Signs. Act Early. 발달 이정표 (한국어는 번역·요약)", en: "U.S. CDC · Learn the Signs. Act Early. milestones", url: "https://www.cdc.gov/act-early/milestones/" },
  { ko: "복지로 · 부모급여 / 첫만남이용권 안내", en: "Bokjiro · Parental Benefit / First Meeting Voucher", url: "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html" },
];

// pt-BR (/pt-br/growth): attach Portuguese texts in place (item.pt / item.notePt, milestone pair[2], source.pt).
import { ITEMS_PT, MILESTONES_PT, SOURCES_PT } from "./growth-data-pt.js";
for (const it of ITEMS) { const t = ITEMS_PT[it.id]; if (t) { it.pt = t[0]; if (t[1]) it.notePt = t[1]; } }
for (const [b, cats] of Object.entries(MILESTONES)) for (const [cat, list] of Object.entries(cats)) list.forEach((pair, i) => { const t = MILESTONES_PT[b]?.[cat]?.[i]; if (t) pair[2] = t; });
SOURCES.forEach((s, i) => { if (SOURCES_PT[i]) s.pt = SOURCES_PT[i]; });
