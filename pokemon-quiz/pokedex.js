
(()=>{const root=document.getElementById('app');
// National Pokédex 001–1025; Korean names from PokeAPI/pokeapi data/v2/csv/pokemon_species_names.csv.
const POKEMON_NAMES = [
  "이상해씨",
  "이상해풀",
  "이상해꽃",
  "파이리",
  "리자드",
  "리자몽",
  "꼬부기",
  "어니부기",
  "거북왕",
  "캐터피",
  "단데기",
  "버터플",
  "뿔충이",
  "딱충이",
  "독침붕",
  "구구",
  "피죤",
  "피죤투",
  "꼬렛",
  "레트라",
  "깨비참",
  "깨비드릴조",
  "아보",
  "아보크",
  "피카츄",
  "라이츄",
  "모래두지",
  "고지",
  "니드런♀",
  "니드리나",
  "니드퀸",
  "니드런♂",
  "니드리노",
  "니드킹",
  "삐삐",
  "픽시",
  "식스테일",
  "나인테일",
  "푸린",
  "푸크린",
  "주뱃",
  "골뱃",
  "뚜벅쵸",
  "냄새꼬",
  "라플레시아",
  "파라스",
  "파라섹트",
  "콘팡",
  "도나리",
  "디그다",
  "닥트리오",
  "나옹",
  "페르시온",
  "고라파덕",
  "골덕",
  "망키",
  "성원숭",
  "가디",
  "윈디",
  "발챙이",
  "슈륙챙이",
  "강챙이",
  "캐이시",
  "윤겔라",
  "후딘",
  "알통몬",
  "근육몬",
  "괴력몬",
  "모다피",
  "우츠동",
  "우츠보트",
  "왕눈해",
  "독파리",
  "꼬마돌",
  "데구리",
  "딱구리",
  "포니타",
  "날쌩마",
  "야돈",
  "야도란",
  "코일",
  "레어코일",
  "파오리",
  "두두",
  "두트리오",
  "쥬쥬",
  "쥬레곤",
  "질퍽이",
  "질뻐기",
  "셀러",
  "파르셀",
  "고오스",
  "고우스트",
  "팬텀",
  "롱스톤",
  "슬리프",
  "슬리퍼",
  "크랩",
  "킹크랩",
  "찌리리공",
  "붐볼",
  "아라리",
  "나시",
  "탕구리",
  "텅구리",
  "시라소몬",
  "홍수몬",
  "내루미",
  "또가스",
  "또도가스",
  "뿔카노",
  "코뿌리",
  "럭키",
  "덩쿠리",
  "캥카",
  "쏘드라",
  "시드라",
  "콘치",
  "왕콘치",
  "별가사리",
  "아쿠스타",
  "마임맨",
  "스라크",
  "루주라",
  "에레브",
  "마그마",
  "쁘사이저",
  "켄타로스",
  "잉어킹",
  "갸라도스",
  "라프라스",
  "메타몽",
  "이브이",
  "샤미드",
  "쥬피썬더",
  "부스터",
  "폴리곤",
  "암나이트",
  "암스타",
  "투구",
  "투구푸스",
  "프테라",
  "잠만보",
  "프리져",
  "썬더",
  "파이어",
  "미뇽",
  "신뇽",
  "망나뇽",
  "뮤츠",
  "뮤",
  "치코리타",
  "베이리프",
  "메가니움",
  "브케인",
  "마그케인",
  "블레이범",
  "리아코",
  "엘리게이",
  "장크로다일",
  "꼬리선",
  "다꼬리",
  "부우부",
  "야부엉",
  "레디바",
  "레디안",
  "페이검",
  "아리아도스",
  "크로뱃",
  "초라기",
  "랜턴",
  "피츄",
  "삐",
  "푸푸린",
  "토게피",
  "토게틱",
  "네이티",
  "네이티오",
  "메리프",
  "보송송",
  "전룡",
  "아르코",
  "마릴",
  "마릴리",
  "꼬지모",
  "왕구리",
  "통통코",
  "두코",
  "솜솜코",
  "에이팜",
  "해너츠",
  "해루미",
  "왕자리",
  "우파",
  "누오",
  "에브이",
  "블래키",
  "니로우",
  "야도킹",
  "무우마",
  "안농",
  "마자용",
  "키링키",
  "피콘",
  "쏘콘",
  "노고치",
  "글라이거",
  "강철톤",
  "블루",
  "그랑블루",
  "침바루",
  "핫삼",
  "단단지",
  "헤라크로스",
  "포푸니",
  "깜지곰",
  "링곰",
  "마그마그",
  "마그카르고",
  "꾸꾸리",
  "메꾸리",
  "코산호",
  "총어",
  "대포무노",
  "딜리버드",
  "만타인",
  "무장조",
  "델빌",
  "헬가",
  "킹드라",
  "코코리",
  "코리갑",
  "폴리곤2",
  "노라키",
  "루브도",
  "배루키",
  "카포에라",
  "뽀뽀라",
  "에레키드",
  "마그비",
  "밀탱크",
  "해피너스",
  "라이코",
  "앤테이",
  "스이쿤",
  "애버라스",
  "데기라스",
  "마기라스",
  "루기아",
  "칠색조",
  "세레비",
  "나무지기",
  "나무돌이",
  "나무킹",
  "아차모",
  "영치코",
  "번치코",
  "물짱이",
  "늪짱이",
  "대짱이",
  "포챠나",
  "그라에나",
  "지그제구리",
  "직구리",
  "개무소",
  "실쿤",
  "뷰티플라이",
  "카스쿤",
  "독케일",
  "연꽃몬",
  "로토스",
  "로파파",
  "도토링",
  "잎새코",
  "다탱구",
  "테일로",
  "스왈로",
  "갈모매",
  "패리퍼",
  "랄토스",
  "킬리아",
  "가디안",
  "비구술",
  "비나방",
  "버섯꼬",
  "버섯모",
  "게을로",
  "발바로",
  "게을킹",
  "토중몬",
  "아이스크",
  "껍질몬",
  "소곤룡",
  "노공룡",
  "폭음룡",
  "마크탕",
  "하리뭉",
  "루리리",
  "코코파스",
  "에나비",
  "델케티",
  "깜까미",
  "입치트",
  "가보리",
  "갱도라",
  "보스로라",
  "요가랑",
  "요가램",
  "썬더라이",
  "썬더볼트",
  "플러시",
  "마이농",
  "볼비트",
  "네오비트",
  "로젤리아",
  "꼴깍몬",
  "꿀꺽몬",
  "샤프니아",
  "샤크니아",
  "고래왕자",
  "고래왕",
  "둔타",
  "폭타",
  "코터스",
  "피그점프",
  "피그킹",
  "얼루기",
  "톱치",
  "비브라바",
  "플라이곤",
  "선인왕",
  "밤선인",
  "파비코",
  "파비코리",
  "쟝고",
  "세비퍼",
  "루나톤",
  "솔록",
  "미꾸리",
  "메깅",
  "가재군",
  "가재장군",
  "오뚝군",
  "점토도리",
  "릴링",
  "릴리요",
  "아노딥스",
  "아말도",
  "빈티나",
  "밀로틱",
  "캐스퐁",
  "켈리몬",
  "어둠대신",
  "다크펫",
  "해골몽",
  "미라몽",
  "트로피우스",
  "치렁",
  "앱솔",
  "마자",
  "눈꼬마",
  "얼음귀신",
  "대굴레오",
  "씨레오",
  "씨카이저",
  "진주몽",
  "헌테일",
  "분홍장이",
  "시라칸",
  "사랑동이",
  "아공이",
  "쉘곤",
  "보만다",
  "메탕",
  "메탕구",
  "메타그로스",
  "레지락",
  "레지아이스",
  "레지스틸",
  "라티아스",
  "라티오스",
  "가이오가",
  "그란돈",
  "레쿠쟈",
  "지라치",
  "테오키스",
  "모부기",
  "수풀부기",
  "토대부기",
  "불꽃숭이",
  "파이숭이",
  "초염몽",
  "팽도리",
  "팽태자",
  "엠페르트",
  "찌르꼬",
  "찌르버드",
  "찌르호크",
  "비버니",
  "비버통",
  "귀뚤뚜기",
  "귀뚤톡크",
  "꼬링크",
  "럭시오",
  "렌트라",
  "꼬몽울",
  "로즈레이드",
  "두개도스",
  "램펄드",
  "방패톱스",
  "바리톱스",
  "도롱충이",
  "도롱마담",
  "나메일",
  "세꿀버리",
  "비퀸",
  "파치리스",
  "브이젤",
  "플로젤",
  "체리버",
  "체리꼬",
  "깝질무",
  "트리토돈",
  "겟핸보숭",
  "흔들풍손",
  "둥실라이드",
  "이어롤",
  "이어롭",
  "무우마직",
  "돈크로우",
  "나옹마",
  "몬냥이",
  "랑딸랑",
  "스컹뿡",
  "스컹탱크",
  "동미러",
  "동탁군",
  "꼬지지",
  "흉내내",
  "핑복",
  "페라페",
  "화강돌",
  "딥상어동",
  "한바이트",
  "한카리아스",
  "먹고자",
  "리오르",
  "루카리오",
  "히포포타스",
  "하마돈",
  "스콜피",
  "드래피온",
  "삐딱구리",
  "독개굴",
  "무스틈니",
  "형광어",
  "네오라이트",
  "타만타",
  "눈쓰개",
  "눈설왕",
  "포푸니라",
  "자포코일",
  "내룸벨트",
  "거대코뿌리",
  "덩쿠림보",
  "에레키블",
  "마그마번",
  "토게키스",
  "메가자리",
  "리피아",
  "글레이시아",
  "글라이온",
  "맘모꾸리",
  "폴리곤Z",
  "엘레이드",
  "대코파스",
  "야느와르몽",
  "눈여아",
  "로토무",
  "유크시",
  "엠라이트",
  "아그놈",
  "디아루가",
  "펄기아",
  "히드런",
  "레지기가스",
  "기라티나",
  "크레세리아",
  "피오네",
  "마나피",
  "다크라이",
  "쉐이미",
  "아르세우스",
  "비크티니",
  "주리비얀",
  "샤비",
  "샤로다",
  "뚜꾸리",
  "차오꿀",
  "염무왕",
  "수댕이",
  "쌍검자비",
  "대검귀",
  "보르쥐",
  "보르그",
  "요테리",
  "하데리어",
  "바랜드",
  "쌔비냥",
  "레파르다스",
  "야나프",
  "야나키",
  "바오프",
  "바오키",
  "앗차프",
  "앗차키",
  "몽나",
  "몽얌나",
  "콩둘기",
  "유토브",
  "켄호로우",
  "줄뮤마",
  "제브라이카",
  "단굴",
  "암트르",
  "기가이어스",
  "또르박쥐",
  "맘박쥐",
  "두더류",
  "몰드류",
  "다부니",
  "으랏차",
  "토쇠골",
  "노보청",
  "동챙이",
  "두까비",
  "두빅굴",
  "던지미",
  "타격귀",
  "두르보",
  "두르쿤",
  "모아머",
  "마디네",
  "휠구",
  "펜드라",
  "소미안",
  "엘풍",
  "치릴리",
  "드레디어",
  "배쓰나이",
  "깜눈크",
  "악비르",
  "악비아르",
  "달막화",
  "불비달마",
  "마라카치",
  "돌살이",
  "암팰리스",
  "곤율랭",
  "곤율거니",
  "심보러",
  "데스마스",
  "데스니칸",
  "프로토가",
  "늑골라",
  "아켄",
  "아케오스",
  "깨봉이",
  "더스트나",
  "조로아",
  "조로아크",
  "치라미",
  "치라치노",
  "고디탱",
  "고디보미",
  "고디모아젤",
  "유니란",
  "듀란",
  "란쿨루스",
  "꼬지보리",
  "스완나",
  "바닐프티",
  "바닐리치",
  "배바닐라",
  "사철록",
  "바라철록",
  "에몽가",
  "딱정곤",
  "슈바르고",
  "깜놀버슬",
  "뽀록나",
  "탱그릴",
  "탱탱겔",
  "맘복치",
  "파쪼옥",
  "전툴라",
  "철시드",
  "너트령",
  "기어르",
  "기기어르",
  "기기기어르",
  "저리어",
  "저리릴",
  "저리더프",
  "리그레",
  "벰크",
  "불켜미",
  "램프라",
  "샹델라",
  "터검니",
  "액슨도",
  "액스라이즈",
  "코고미",
  "툰베어",
  "프리지오",
  "쪼마리",
  "어지리더",
  "메더",
  "비조푸",
  "비조도",
  "크리만",
  "골비람",
  "골루그",
  "자망칼",
  "절각참",
  "버프론",
  "수리둥보",
  "워글",
  "벌차이",
  "버랜지나",
  "앤티골",
  "아이앤트",
  "모노두",
  "디헤드",
  "삼삼드래",
  "활화르바",
  "불카모스",
  "코바르온",
  "테라키온",
  "비리디온",
  "토네로스",
  "볼트로스",
  "레시라무",
  "제크로무",
  "랜드로스",
  "큐레무",
  "케르디오",
  "메로엣타",
  "게노세크트",
  "도치마론",
  "도치보구",
  "브리가론",
  "푸호꼬",
  "테르나",
  "마폭시",
  "개구마르",
  "개굴반장",
  "개굴닌자",
  "파르빗",
  "파르토",
  "화살꼬빈",
  "불화살빈",
  "파이어로",
  "분이벌레",
  "분떠도리",
  "비비용",
  "레오꼬",
  "화염레오",
  "플라베베",
  "플라엣테",
  "플라제스",
  "메이클",
  "고고트",
  "판짱",
  "부란다",
  "트리미앙",
  "냐스퍼",
  "냐오닉스",
  "단칼빙",
  "쌍검킬",
  "킬가르도",
  "슈쁘",
  "프레프티르",
  "나룸퍼프",
  "나루림",
  "오케이징",
  "칼라마네로",
  "거북손손",
  "거북손데스",
  "수레기",
  "드래캄",
  "완철포",
  "블로스터",
  "목도리키텔",
  "일레도리자드",
  "티고라스",
  "견고라스",
  "아마루스",
  "아마루르가",
  "님피아",
  "루차불",
  "데덴네",
  "멜리시",
  "미끄메라",
  "미끄네일",
  "미끄래곤",
  "클레피",
  "나목령",
  "대로트",
  "호바귀",
  "펌킨인",
  "꽁어름",
  "크레베이스",
  "음뱃",
  "음번",
  "제르네아스",
  "이벨타르",
  "지가르데",
  "디안시",
  "후파",
  "볼케니온",
  "나몰빼미",
  "빼미스로우",
  "모크나이퍼",
  "냐오불",
  "냐오히트",
  "어흥염",
  "누리공",
  "키요공",
  "누리레느",
  "콕코구리",
  "크라파",
  "왕큰부리",
  "영구스",
  "형사구스",
  "턱지충이",
  "전지충이",
  "투구뿌논",
  "오기지게",
  "모단단게",
  "춤추새",
  "에블리",
  "에리본",
  "암멍이",
  "루가루암",
  "약어리",
  "시마사리",
  "더시마사리",
  "머드나기",
  "만마드",
  "물거미",
  "깨비물거미",
  "짜랑랑",
  "라란티스",
  "자마슈",
  "마셰이드",
  "야도뇽",
  "염뉴트",
  "포곰곰",
  "이븐곰",
  "달콤아",
  "달무리나",
  "달코퀸",
  "큐아링",
  "하랑우탄",
  "내던숭이",
  "꼬시레",
  "갑주무사",
  "모래꿍",
  "모래성이당",
  "해무기",
  "타입:널",
  "실버디",
  "메테노",
  "자말라",
  "폭거북스",
  "토게데마루",
  "따라큐",
  "치갈기",
  "할비롱",
  "타타륜",
  "짜랑꼬",
  "짜랑고우",
  "짜랑고우거",
  "카푸꼬꼬꼭",
  "카푸나비나",
  "카푸브루루",
  "카푸느지느",
  "코스모그",
  "코스모움",
  "솔가레오",
  "루나아라",
  "텅비드",
  "매시붕",
  "페로코체",
  "전수목",
  "철화구야",
  "종이신도",
  "악식킹",
  "네크로즈마",
  "마기아나",
  "마샤도",
  "베베놈",
  "아고용",
  "차곡차곡",
  "두파팡",
  "제라오라",
  "멜탄",
  "멜메탈",
  "흥나숭",
  "채키몽",
  "고릴타",
  "염버니",
  "래비풋",
  "에이스번",
  "울머기",
  "누겔레온",
  "인텔리레온",
  "탐리스",
  "요씽리스",
  "파라꼬",
  "파크로우",
  "아머까오",
  "두루지벌레",
  "레돔벌레",
  "이올브",
  "훔처우",
  "폭슬라이",
  "꼬모카",
  "백솜모카",
  "우르",
  "배우르",
  "깨물부기",
  "갈가부기",
  "멍파치",
  "펄스멍",
  "탄동",
  "탄차곤",
  "석탄산",
  "과사삭벌레",
  "애프룡",
  "단지래플",
  "모래뱀",
  "사다이사",
  "윽우지",
  "찌로꼬치",
  "꼬치조",
  "일레즌",
  "스트린더",
  "태우지네",
  "다태우지네",
  "때때무노",
  "케오퍼스",
  "데인차",
  "포트데스",
  "몸지브림",
  "손지브림",
  "브리무음",
  "메롱꿍",
  "쏘겨모",
  "오롱털",
  "가로막구리",
  "나이킹",
  "산호르곤",
  "창파나이트",
  "마임꽁꽁",
  "데스판",
  "마빌크",
  "마휘핑",
  "대여르",
  "찌르성게",
  "누니머기",
  "모스노우",
  "돌헨진",
  "빙큐보",
  "에써르",
  "모르페코",
  "끼리동",
  "대왕끼리동",
  "파치래곤",
  "파치르돈",
  "어래곤",
  "어치르돈",
  "두랄루돈",
  "드라꼰",
  "드래런치",
  "드래펄트",
  "자시안",
  "자마젠타",
  "무한다이노",
  "치고마",
  "우라오스",
  "자루도",
  "레지에레키",
  "레지드래고",
  "블리자포스",
  "레이스포스",
  "버드렉스",
  "신비록",
  "사마자르",
  "다투곰",
  "대쓰여너",
  "포푸니크",
  "장침바루",
  "러브로스",
  "나오하",
  "나로테",
  "마스카나",
  "뜨아거",
  "악뜨거",
  "라우드본",
  "꾸왁스",
  "아꾸왁",
  "웨이니발",
  "맛보돈",
  "퍼퓨돈",
  "타랜툴라",
  "트래피더",
  "콩알뚜기",
  "엑스레그",
  "빠모",
  "빠모트",
  "빠르모트",
  "두리쥐",
  "파밀리쥐",
  "쫀도기",
  "바우첼",
  "미니브",
  "올리뇨",
  "올리르바",
  "시비꼬",
  "베베솔트",
  "스태솔트",
  "콜로솔트",
  "카르본",
  "카디나르마",
  "파라블레이즈",
  "빈나두",
  "찌리배리",
  "찌리비",
  "찌리비크",
  "오라티프",
  "마피티프",
  "땃쭈르",
  "태깅구르",
  "그푸리",
  "공푸리",
  "들눈해",
  "육파리",
  "절벼게",
  "캡싸이",
  "스코빌런",
  "구르데",
  "베라카스",
  "하느라기",
  "클레스퍼트라",
  "어리짱",
  "벼리짱",
  "두드리짱",
  "바다그다",
  "바닥트리오",
  "떨구새",
  "맨돌핀",
  "돌핀맨",
  "부르롱",
  "부르르룸",
  "모토마",
  "꿈트렁",
  "초롱순",
  "킬라플로르",
  "망망이",
  "묘두기",
  "꼬이밍고",
  "터벅고래",
  "우락고래",
  "가비루사",
  "어써러셔",
  "싸리용",
  "저승갓숭",
  "토오",
  "키키링",
  "노고고치",
  "대도각참",
  "위대한엄니",
  "우렁찬꼬리",
  "사나운버섯",
  "날개치는머리",
  "땅을기는날개",
  "모래털가죽",
  "무쇠바퀴",
  "무쇠보따리",
  "무쇠손",
  "무쇠머리",
  "무쇠독나방",
  "무쇠가시",
  "드니차",
  "드니꽁",
  "드닐레이브",
  "모으령",
  "타부자고",
  "총지엔",
  "파오젠",
  "딩루",
  "위유이",
  "고동치는달",
  "무쇠무인",
  "코라이돈",
  "미라이돈",
  "굽이치는물결",
  "무쇠잎새",
  "과미르",
  "차데스",
  "그우린차",
  "조타구",
  "이야후",
  "기로치",
  "오거폰",
  "브리두라스",
  "과미드라",
  "꿰뚫는화염",
  "날뛰는우레",
  "무쇠암석",
  "무쇠감투",
  "테라파고스",
  "복숭악동"
];

const POKEMON = POKEMON_NAMES.map((name, index) => ({ id: index + 1, name }));
const ART_BASE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/other/official-artwork/';
const SPRITE_BASE = 'https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/';
const ANSWER_DELAY = 700;

const screens = {
  start: root.querySelector('#startScreen'),
  quiz: root.querySelector('#quizScreen'),
  result: root.querySelector('#resultScreen')
};

const countButtons = [...root.querySelectorAll('.count-btn')];
const startButton = root.querySelector('#startButton');
const homeButton = root.querySelector('#homeButton');
const soundButton = root.querySelector('#soundButton');
const retryButton = root.querySelector('#retryButton');
const changeCountButton = root.querySelector('#changeCountButton');
const battleField = root.querySelector('#battleField');
const pokemonImage = root.querySelector('#pokemonImage');
const loadingBadge = root.querySelector('#loadingBadge');
const feedbackStamp = root.querySelector('#feedbackStamp');
const sparkLayer = root.querySelector('#sparkLayer');
const messageLine = root.querySelector('#messageLine');
const answersEl = root.querySelector('#answers');
const timerNumber = root.querySelector('#timerNumber');
const timerBar = root.querySelector('#timerBar');
const progressBar = root.querySelector('#progressBar');
const questionNow = root.querySelector('#questionNow');
const questionTotal = root.querySelector('#questionTotal');
const scoreText = root.querySelector('#scoreText');
const streakText = root.querySelector('#streakText');

let selectedCount = 10;
let questions = [];
let questionIndex = 0;
let score = 0;
let streak = 0;
let bestStreak = 0;
let current = null;
let locked = true;
let timerInterval = null;
let timeoutHandle = null;
let nextHandle = null;
let questionToken = 0;
let soundOn = true;
let audioCtx = null;

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function switchScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
}

function beep(freq = 440, duration = .06, type = 'square', volume = .025) {
  if (!soundOn) return;
  try {
    audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + duration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (_) {}
}

function successSound() {
  beep(660, .07, 'square', .025);
  setTimeout(() => beep(880, .1, 'square', .022), 65);
}

function wrongSound() {
  beep(220, .1, 'sawtooth', .018);
  setTimeout(() => beep(165, .11, 'sawtooth', .015), 75);
}

function clearTimers() {
  clearInterval(timerInterval);
  clearTimeout(timeoutHandle);
  clearTimeout(nextHandle);
  timerInterval = null;
  timeoutHandle = null;
  nextHandle = null;
}

function resetTimerVisual() {
  timerBar.classList.remove('running', 'danger');
  void timerBar.offsetWidth;
  timerBar.style.transform = 'scaleX(1)';
  timerNumber.textContent = '3';
}

function buildOptions(answer) {
  const distractors = shuffle(POKEMON.filter(p => p.id !== answer.id)).slice(0, 3);
  return shuffle([answer, ...distractors]);
}

function renderAnswers(answer) {
  answersEl.innerHTML = '';
  buildOptions(answer).forEach((pokemon, index) => {
    const button = document.createElement('button');
    button.className = 'answer-btn cursor-interaction';
    button.type = 'button';
    button.textContent = pokemon.name;
    if (pokemon.name.length >= 6) button.classList.add('long-label');
    button.dataset.id = String(pokemon.id);
    button.dataset.key = String.fromCharCode(65 + index);
    button.disabled = true;
    button.addEventListener('click', () => chooseAnswer(pokemon.id));
    answersEl.appendChild(button);
  });
}

function setAnswerState(selectedId, timedOut = false) {
  [...answersEl.children].forEach(button => {
    const id = Number(button.dataset.id);
    button.disabled = true;
    if (id === current.id) button.classList.add('correct');
    else if (!timedOut && id === selectedId) button.classList.add('wrong');
    else button.classList.add('dimmed');
  });
}

function showFeedback(text, kind) {
  feedbackStamp.textContent = text;
  feedbackStamp.className = `feedback-stamp ${kind}`;
  void feedbackStamp.offsetWidth;
  feedbackStamp.classList.add('show');
}

function showSpark() {
  sparkLayer.classList.remove('show');
  void sparkLayer.offsetWidth;
  sparkLayer.classList.add('show');
  setTimeout(() => sparkLayer.classList.remove('show'), 520);
}

function startCountdown(token) {
  if (token !== questionToken || !screens.quiz.classList.contains('active')) return;
  locked = false;
  [...answersEl.children].forEach(button => { button.disabled = false; });
  loadingBadge.classList.add('hidden');
  messageLine.textContent = '이 포켓몬의 이름은?';
  messageLine.classList.remove('answer-reveal');

  resetTimerVisual();
  void timerBar.offsetWidth;
  timerBar.style.transform = '';
  timerBar.classList.add('running');

  const startedAt = performance.now();
  beep(520, .04, 'square', .018);
  timerInterval = setInterval(() => {
    const remaining = Math.max(0, 3000 - (performance.now() - startedAt));
    const display = Math.max(1, Math.ceil(remaining / 1000));
    timerNumber.textContent = String(display);
    timerBar.classList.toggle('danger', remaining <= 1000);
  }, 60);

  timeoutHandle = setTimeout(() => {
    if (token !== questionToken || locked) return;
    handleTimeout();
  }, 3000);
}

function loadQuestionImage(pokemon, token) {
  pokemonImage.classList.remove('ready');
  pokemonImage.removeAttribute('src');
  pokemonImage.alt = `${pokemon.name} 그림`;
  pokemonImage.dataset.fallback = '0';
  loadingBadge.classList.remove('hidden');
  loadingBadge.textContent = 'SEARCHING...';

  pokemonImage.onload = () => {
    if (token !== questionToken) return;
    pokemonImage.classList.add('ready');
    requestAnimationFrame(() => startCountdown(token));
  };

  pokemonImage.onerror = () => {
    if (token !== questionToken) return;
    if (pokemonImage.dataset.fallback === '0') {
      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
      return;
    }
    loadingBadge.textContent = 'RETRYING...';
    nextHandle = setTimeout(() => {
      if (token !== questionToken) return;
      pokemonImage.dataset.fallback = '0';
      pokemonImage.src = `${ART_BASE}${pokemon.id}.png?retry=${Date.now()}`;
    }, 400);
  };

  pokemonImage.src = `${ART_BASE}${pokemon.id}.png`;
}

function preloadUpcomingImages() {
  for (let i = questionIndex + 1; i <= Math.min(questionIndex + 3, questions.length - 1); i += 1) {
    const image = new Image();
    image.src = `${ART_BASE}${questions[i].id}.png`;
  }
}

function animateQuestionIn() {
  battleField.classList.remove('question-in');
  void battleField.offsetWidth;
  battleField.classList.add('question-in');
  setTimeout(() => battleField.classList.remove('question-in'), 260);
}

function showQuestion() {
  clearTimers();
  locked = true;
  feedbackStamp.className = 'feedback-stamp';
  sparkLayer.classList.remove('show');
  messageLine.textContent = '포켓몬을 불러오는 중...';
  messageLine.classList.remove('answer-reveal');

  const token = ++questionToken;
  current = questions[questionIndex];

  questionNow.textContent = String(questionIndex + 1);
  questionTotal.textContent = String(questions.length);
  progressBar.style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  scoreText.textContent = String(score);
  streakText.textContent = String(streak);

  resetTimerVisual();
  renderAnswers(current);
  preloadUpcomingImages();
  animateQuestionIn();
  loadQuestionImage(current, token);
}

function stopCountdown() {
  clearInterval(timerInterval);
  clearTimeout(timeoutHandle);
  timerInterval = null;
  timeoutHandle = null;
  timerBar.classList.remove('running');
}

function chooseAnswer(selectedId) {
  if (locked) return;
  locked = true;
  stopCountdown();

  const isCorrect = selectedId === current.id;
  if (isCorrect) {
    score += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    scoreText.textContent = String(score);
    streakText.textContent = String(streak);
    setAnswerState(selectedId, false);
    messageLine.textContent = '정답!';
    showFeedback('정답!', 'correct');
    showSpark();
    successSound();
  } else {
    streak = 0;
    streakText.textContent = '0';
    setAnswerState(selectedId, false);
    messageLine.textContent = `정답은 ${current.name}!`;
    messageLine.classList.add('answer-reveal');
    showFeedback('아쉽다!', 'wrong');
    wrongSound();
  }

  nextHandle = setTimeout(nextQuestion, ANSWER_DELAY);
}

function handleTimeout() {
  locked = true;
  stopCountdown();
  timerBar.style.transform = 'scaleX(0)';
  timerBar.classList.add('danger');
  timerNumber.textContent = '0';
  streak = 0;
  streakText.textContent = '0';
  setAnswerState(null, true);
  messageLine.textContent = `시간 끝! 정답은 ${current.name}!`;
  messageLine.classList.add('answer-reveal');
  showFeedback('시간 끝!', 'wrong');
  wrongSound();
  nextHandle = setTimeout(nextQuestion, ANSWER_DELAY);
}

function nextQuestion() {
  questionIndex += 1;
  if (questionIndex >= questions.length) {
    finishGame();
    return;
  }
  showQuestion();
}

function getResultMessage(ratio) {
  if (ratio === 1) return '완벽해! 관동지방 포켓몬 박사다!';
  if (ratio >= .8) return '대단해! 포켓몬을 정말 많이 알고 있네!';
  if (ratio >= .6) return '좋아! 조금만 더 하면 포켓몬 박사!';
  if (ratio >= .4) return '잘했어! 한 번 더 하면 기록을 올릴 수 있어!';
  return '좋아! 포켓몬을 하나씩 더 알아가 보자!';
}

function finishGame() {
  clearTimers();
  progressBar.style.width = '100%';
  const ratio = score / questions.length;
  const accuracy = Math.round(ratio * 100);
  root.querySelector('#finalScore').textContent = String(score);
  root.querySelector('#finalTotal').textContent = `/ ${questions.length}`;
  root.querySelector('#accuracyText').textContent = `${accuracy}%`;
  root.querySelector('#bestStreakText').textContent = String(bestStreak);
  root.querySelector('#resultMessage').textContent = getResultMessage(ratio);
  root.querySelector('#resultBadge').textContent = '';
  switchScreen('result');
  if (ratio >= .8) successSound();
}

function startGame() {
  clearTimers();
  beep(540, .05, 'square', .018);
  questions = shuffle(POKEMON).slice(0, Math.min(selectedCount, POKEMON.length));
  questionIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  switchScreen('quiz');
  showQuestion();
}

function goHome() {
  clearTimers();
  questionToken += 1;
  locked = true;
  switchScreen('start');
}

countButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedCount = Number(button.dataset.count);
    countButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-checked', String(selected));
    });
    beep(420, .035, 'square', .012);
  });
});

startButton.addEventListener('click', startGame);
homeButton.addEventListener('click', goHome);
retryButton.addEventListener('click', goHome);
changeCountButton.addEventListener('click', goHome);



window.addEventListener('keydown', event => {
  if (!screens.quiz.classList.contains('active') || locked) return;
  const key = event.key.toUpperCase();
  const index = ['A', 'B', 'C', 'D'].indexOf(key);
  if (index < 0) return;
  const button = answersEl.children[index];
  if (button && !button.disabled) button.click();
});

(() => {
  const timeButtons = [...root.querySelectorAll('.time-btn')];
  const subtitle = null;
  let selectedTimeSeconds = 3;

  function syncTimeButtons() {
    timeButtons.forEach(button => {
      const selected = Number(button.dataset.time) === selectedTimeSeconds;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', String(selected));
    });
    if (subtitle) {
      subtitle.innerHTML = `포켓몬이 나타나면 <strong>${selectedTimeSeconds}초 안에</strong> 이름을 골라!`;
    }
  }

  timeButtons.forEach(button => {
    button.addEventListener('click', () => {
      selectedTimeSeconds = Number(button.dataset.time) || 3;
      syncTimeButtons();
      beep(420, .035, 'square', .012);
    });
  });

  resetTimerVisual = function configuredResetTimerVisual() {
    timerBar.classList.remove('running', 'danger');
    timerBar.style.animationDuration = `${selectedTimeSeconds}s`;
    void timerBar.offsetWidth;
    timerBar.style.transform = 'scaleX(1)';
    timerNumber.textContent = String(selectedTimeSeconds);
  };

  startCountdown = function configuredStartCountdown(token) {
    if (token !== questionToken || !screens.quiz.classList.contains('active')) return;
    locked = false;
    [...answersEl.children].forEach(button => { button.disabled = false; });
    loadingBadge.classList.add('hidden');
    messageLine.textContent = '이 포켓몬의 이름은?';
    messageLine.classList.remove('answer-reveal');

    resetTimerVisual();
    void timerBar.offsetWidth;
    timerBar.style.transform = '';
    timerBar.style.animationDuration = `${selectedTimeSeconds}s`;
    timerBar.classList.add('running');

    const limitMs = selectedTimeSeconds * 1000;
    const startedAt = performance.now();
    beep(520, .04, 'square', .018);

    timerInterval = setInterval(() => {
      const remaining = Math.max(0, limitMs - (performance.now() - startedAt));
      const display = Math.max(1, Math.ceil(remaining / 1000));
      timerNumber.textContent = String(display);
      timerBar.classList.toggle('danger', remaining <= 1000);
    }, 60);

    timeoutHandle = setTimeout(() => {
      if (token !== questionToken || locked) return;
      handleTimeout();
    }, limitMs);
  };

  syncTimeButtons();
})();

(() => {
  loadQuestionImage = function decodedQuestionImage(pokemon, token) {
    pokemonImage.classList.remove('ready');
    pokemonImage.removeAttribute('src');
    pokemonImage.alt = `${pokemon.name} 그림`;
    pokemonImage.dataset.fallback = '0';
    pokemonImage.decoding = 'async';
    pokemonImage.fetchPriority = 'high';
    loadingBadge.classList.remove('hidden');
    loadingBadge.textContent = 'SEARCHING...';

    let settled = false;
    let slowTimer = null;

    const beginAfterPaint = async () => {
      if (settled || token !== questionToken) return;

      try {
        if (typeof pokemonImage.decode === 'function') await pokemonImage.decode();
      } catch (_) {
        // onload + naturalWidth below is the final validity check.
      }

      if (settled || token !== questionToken) return;
      if (!pokemonImage.complete || pokemonImage.naturalWidth <= 0) return;

      settled = true;
      clearTimeout(slowTimer);
      pokemonImage.classList.add('ready');

      // Give Safari two paint frames before the timer becomes active.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (token !== questionToken) return;
          startCountdown(token);
        });
      });
    };

    const useSpriteFallback = () => {
      if (settled || token !== questionToken) return;
      if (pokemonImage.dataset.fallback === '1') {
        loadingBadge.textContent = 'RETRYING...';
        slowTimer = setTimeout(() => {
          if (settled || token !== questionToken) return;
          pokemonImage.dataset.fallback = '0';
          pokemonImage.src = `${ART_BASE}${pokemon.id}.png?retry=${Date.now()}`;
        }, 500);
        return;
      }

      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
    };

    pokemonImage.onload = beginAfterPaint;
    pokemonImage.onerror = useSpriteFallback;

    // If full artwork is slow on mobile data, switch to the much smaller sprite.
    slowTimer = setTimeout(() => {
      if (settled || token !== questionToken || pokemonImage.dataset.fallback === '1') return;
      pokemonImage.dataset.fallback = '1';
      pokemonImage.src = `${SPRITE_BASE}${pokemon.id}.png`;
    }, 2200);

    pokemonImage.src = `${ART_BASE}${pokemon.id}.png`;
  };
})();
(() => {
  const optionSummaryText = root.querySelector('#optionSummaryText');
  function updateOptionSummary() {
    const count = root.querySelector('.count-btn.selected')?.dataset.count || '10';
    const time = root.querySelector('.time-btn.selected')?.dataset.time || '3';
    optionSummaryText.textContent = `${count}문제 · ${time}초`;
  }
  root.querySelectorAll('.count-btn, .time-btn').forEach(button => {
    button.addEventListener('click', updateOptionSummary);
  });
  getResultMessage = function allPokemonResultMessage(ratio) {
    if (ratio === 1) return '완벽해! 진짜 포켓몬 박사다!';
    if (ratio >= .8) return '대단해! 포켓몬을 정말 많이 알고 있네!';
    if (ratio >= .6) return '좋아! 조금만 더 하면 포켓몬 박사!';
    if (ratio >= .4) return '잘했어! 한 번 더 하면 기록을 올릴 수 있어!';
    return '좋아! 포켓몬을 하나씩 더 알아가 보자!';
  };
  updateOptionSummary();
})();

(() => {
  const PQ_BAR_MS = 1680;
  const PQ_TITLE_BAR_MS = 2240;
  const PQ_SCALE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51
  };

  const titleMusicButton = root.querySelector('#titleMusicButton');
  let pqQuizTimer = null;
  let pqTitleTimer = null;
  let pqVoices = new Set();
  let pqTimeoutMode = false;
  let pqQuestionSerial = 0;
  let pqAudioUnlocked = false;
  let pqTitleEnabled = false;
  let pqTitleVariant = 0;
  let pqMasterGain = null;

  function pqGetContext() {
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (!pqMasterGain) {
        pqMasterGain = audioCtx.createGain();
        pqMasterGain.gain.value = soundOn ? 1 : 0;
        pqMasterGain.connect(audioCtx.destination);
      }
      return audioCtx;
    } catch (_) {
      return null;
    }
  }

  async function pqUnlockAudio() {
    if (!soundOn) return false;
    const ctx = pqGetContext();
    if (!ctx) return false;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      pqAudioUnlocked = soundOn && ctx.state === 'running';
      return pqAudioUnlocked;
    } catch (_) {
      return false;
    }
  }

  function pqToneAt(freq, delay = 0, duration = .08, type = 'square', volume = .018, music = false, detune = 0) {
    if (!soundOn) return null;
    const ctx = pqGetContext();
    if (!ctx || ctx.state !== 'running') return null;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + Math.max(0, delay);
    const t1 = t0 + Math.max(.02, duration);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.detune.setValueAtTime(detune, t0);
    gain.gain.setValueAtTime(.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), t0 + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, t1);

    osc.connect(gain).connect(pqMasterGain);
    osc.start(t0);
    osc.stop(t1 + .02);

    pqVoices.add(osc);
    osc.addEventListener('ended', () => pqVoices.delete(osc), { once: true });
    return osc;
  }

  function pqNoise(delay = 0, duration = .04, volume = .006) {
    if (!soundOn) return;
    const ctx = pqGetContext();
    if (!ctx || ctx.state !== 'running') return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const t0 = ctx.currentTime + delay;
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(.0001, t0 + duration);
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(pqMasterGain);
    pqVoices.add(source);
    source.addEventListener('ended', () => pqVoices.delete(source), { once: true });
    source.start(t0);
    source.stop(t0 + duration + .02);
  }

  function pqStopVoices() {
    pqVoices.forEach(osc => { try { osc.stop(); } catch (_) {} });
    pqVoices.clear();
  }

  function pqStopQuizBgm() {
    if (pqQuizTimer) clearInterval(pqQuizTimer);
    pqQuizTimer = null;
  }

  function pqStopTitleBgm() {
    if (pqTitleTimer) clearInterval(pqTitleTimer);
    pqTitleTimer = null;
  }

  function pqStopAllMusic() {
    pqStopQuizBgm();
    pqStopTitleBgm();
    pqStopVoices();
    pqUpdateTitleButton();
  }

  function pqMenuTick() {
    pqToneAt(PQ_SCALE.E5, 0, .028, 'square', .010);
    pqToneAt(PQ_SCALE.A5, .018, .03, 'square', .008);
  }

  function pqConfirm() {
    pqToneAt(PQ_SCALE.C5, 0, .045, 'square', .014);
    pqToneAt(PQ_SCALE.E5, .045, .055, 'square', .015);
    pqToneAt(PQ_SCALE.G5, .095, .07, 'square', .016);
  }

  function pqStartJingle() {
    [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6].forEach((note, i) => {
      pqToneAt(note, i * .055, .085, i === 3 ? 'triangle' : 'square', .020);
    });
    pqNoise(.17, .035, .005);
  }

  function pqQuestionCue() {
    const serial = ++pqQuestionSerial;
    pqToneAt(PQ_SCALE.G4, 0, .035, 'square', .010);
    pqToneAt(PQ_SCALE.C5, .035, .04, 'square', .012);
    pqToneAt(PQ_SCALE.E5, .075, .055, 'square', .012);
    setTimeout(() => {
      if (serial !== pqQuestionSerial || !screens.quiz.classList.contains('active')) return;
      pqToneAt(PQ_SCALE.G5, 0, .035, 'square', .008);
    }, 125);
  }

  function pqTimerReady() {
    pqToneAt(PQ_SCALE.C6, 0, .035, 'square', .010);
    pqToneAt(PQ_SCALE.G5, .04, .045, 'square', .007);
  }

  function pqAnswerTap() {
    pqNoise(0, .025, .004);
    pqToneAt(PQ_SCALE.D5, 0, .035, 'square', .010);
  }

  function pqCorrect() {
    [PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.E6].forEach((note, i) => {
      pqToneAt(note, i * .055, .10, i > 1 ? 'triangle' : 'square', .023);
    });
    pqToneAt(PQ_SCALE.C5, .11, .14, 'square', .009);
    pqNoise(.16, .045, .004);
  }

  function pqWrong() {
    pqToneAt(PQ_SCALE.E4, 0, .085, 'square', .016);
    pqToneAt(PQ_SCALE.D4, .072, .09, 'square', .015);
    pqToneAt(PQ_SCALE.C4, .145, .13, 'sawtooth', .010);
  }

  function pqTimeout() {
    pqToneAt(PQ_SCALE.G4, 0, .05, 'square', .014);
    pqToneAt(PQ_SCALE.G4, .07, .05, 'square', .013);
    pqToneAt(PQ_SCALE.C4, .145, .16, 'sawtooth', .010);
    pqNoise(.14, .07, .006);
  }

  function pqResultFanfare() {
    if (!soundOn) return;
    const melody = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.G5, PQ_SCALE.C6, PQ_SCALE.E6];
    const times = [0, .08, .16, .25, .37, .45, .57];
    melody.forEach((note, i) => pqToneAt(note, times[i], i === melody.length - 1 ? .28 : .11, i >= 3 ? 'triangle' : 'square', .020));
    pqToneAt(PQ_SCALE.C4, .25, .45, 'square', .007);
    pqToneAt(PQ_SCALE.G4, .25, .45, 'square', .006);
  }

  function pqScheduleQuizBar() {
    if (!soundOn || !pqAudioUnlocked || !screens.quiz.classList.contains('active')) return;
    const step = .21;
    const lead = [PQ_SCALE.C5, PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.E5, PQ_SCALE.D5, PQ_SCALE.F5, PQ_SCALE.G5, PQ_SCALE.D5];
    const bass = [PQ_SCALE.C4, PQ_SCALE.C4, PQ_SCALE.F4, PQ_SCALE.G4];
    lead.forEach((note, i) => pqToneAt(note, i * step, .075, 'square', .0065, true, i % 2 ? -4 : 0));
    bass.forEach((note, i) => pqToneAt(note, i * step * 2, .15, 'triangle', .005, true));
  }

  function pqStartQuizBgm() {
    if (!soundOn || !pqAudioUnlocked || pqQuizTimer || !screens.quiz.classList.contains('active')) return;
    pqStopTitleBgm();
    pqStopVoices();
    pqScheduleQuizBar();
    pqQuizTimer = setInterval(pqScheduleQuizBar, PQ_BAR_MS);
  }

  function pqScheduleTitleBar() {
    if (!soundOn || !pqAudioUnlocked || !pqTitleEnabled || !screens.start.classList.contains('active')) return;
    const step = .14;
    const leadA = [
      PQ_SCALE.G5, PQ_SCALE.G5, PQ_SCALE.A5, PQ_SCALE.C6,
      PQ_SCALE.B5, PQ_SCALE.A5, PQ_SCALE.G5, PQ_SCALE.E5,
      PQ_SCALE.G5, PQ_SCALE.A5, PQ_SCALE.C6, PQ_SCALE.D6,
      PQ_SCALE.C6, PQ_SCALE.B5, PQ_SCALE.A5, PQ_SCALE.G5
    ];
    const leadB = [
      PQ_SCALE.E5, PQ_SCALE.G5, PQ_SCALE.A5, PQ_SCALE.B5,
      PQ_SCALE.C6, PQ_SCALE.B5, PQ_SCALE.A5, PQ_SCALE.G5,
      PQ_SCALE.F5, PQ_SCALE.A5, PQ_SCALE.C6, PQ_SCALE.E6,
      PQ_SCALE.D6, PQ_SCALE.C6, PQ_SCALE.B5, PQ_SCALE.G5
    ];
    const lead = pqTitleVariant % 2 === 0 ? leadA : leadB;
    const bass = pqTitleVariant % 2 === 0
      ? [PQ_SCALE.C4, PQ_SCALE.G4, PQ_SCALE.A4, PQ_SCALE.F4]
      : [PQ_SCALE.F4, PQ_SCALE.G4, PQ_SCALE.E4, PQ_SCALE.G4];

    lead.forEach((note, i) => {
      const volume = i % 4 === 0 ? .021 : .015;
      pqToneAt(note, i * step, .095, i % 4 === 3 ? 'triangle' : 'square', volume, true, i % 2 ? -3 : 2);
    });
    bass.forEach((note, i) => {
      pqToneAt(note, i * step * 4, .36, 'triangle', .011, true);
      pqToneAt(note * 2, i * step * 4 + .28, .06, 'square', .006, true);
    });
    [0, 4, 8, 12].forEach(index => pqNoise(index * step, .03, .004));
    pqTitleVariant += 1;
  }

  function pqUpdateTitleButton() {
    [[titleMusicButton, soundOn && pqTitleEnabled], [soundButton, soundOn]].forEach(([button, enabled]) => {
      if (!button) return;
      button.textContent = '♪';
      button.setAttribute('aria-pressed', String(enabled));
      button.setAttribute('aria-label', enabled ? '음악 끄기' : '음악 켜기');
      button.classList.toggle('playing', enabled);
    });
  }

  function pqStartTitleBgm() {
    if (!soundOn || !pqAudioUnlocked || !pqTitleEnabled || pqTitleTimer || !screens.start.classList.contains('active')) {
      pqUpdateTitleButton();
      return;
    }
    pqStopQuizBgm();
    pqStopVoices();
    pqScheduleTitleBar();
    pqTitleTimer = setInterval(pqScheduleTitleBar, PQ_TITLE_BAR_MS);
    pqUpdateTitleButton();
  }

  let pqAudioIntent = 0;
  async function pqToggleTitleMusic(event) {
    event?.preventDefault();
    const intent = ++pqAudioIntent;
    const fromTitle = event?.currentTarget === titleMusicButton;
    const enabled = soundOn && (!fromTitle || pqTitleEnabled);
    soundOn = !enabled;
    pqTitleEnabled = soundOn;
    pqStopAllMusic();
    const ctx = pqGetContext();
    if (ctx && pqMasterGain) {
      pqMasterGain.gain.cancelScheduledValues(ctx.currentTime);
      pqMasterGain.gain.setValueAtTime(soundOn ? 1 : 0, ctx.currentTime);
    }
    pqUpdateTitleButton();
    if (!soundOn) return;
    const unlocked = await pqUnlockAudio();
    if (!unlocked || intent !== pqAudioIntent || !soundOn) return;
    if (screens.quiz.classList.contains('active')) pqStartQuizBgm();
    else if (screens.start.classList.contains('active')) pqStartTitleBgm();
    pqUpdateTitleButton();
  }

  const pqOriginalSwitchScreen = switchScreen;
  switchScreen = function pqSwitchScreen(name) {
    pqOriginalSwitchScreen(name);
    pqStopAllMusic();
    if (name === 'quiz') setTimeout(pqStartQuizBgm, 180);
    else if (name === 'start' && pqTitleEnabled) setTimeout(pqStartTitleBgm, 100);
    else if (name === 'result') setTimeout(pqResultFanfare, 70);
  };

  const pqOriginalShowQuestion = showQuestion;
  showQuestion = function pqShowQuestion() {
    pqOriginalShowQuestion();
    setTimeout(pqQuestionCue, 25);
  };

  const pqOriginalChooseAnswer = chooseAnswer;
  chooseAnswer = function pqChooseAnswer(selectedId) {
    if (!locked) pqAnswerTap();
    pqOriginalChooseAnswer(selectedId);
  };

  const pqOriginalHandleTimeout = handleTimeout;
  handleTimeout = function pqHandleTimeout() {
    pqTimeoutMode = true;
    pqOriginalHandleTimeout();
    pqTimeoutMode = false;
  };

  beep = function pqBeep(freq = 440, duration = .06, type = 'square', volume = .025) {
    if (!soundOn) return;
    if (freq === 420 && duration <= .04) return pqMenuTick();
    if (freq === 540) return pqStartJingle();
    if (freq === 520 && duration <= .045) return pqTimerReady();
    if (freq === 520) return pqConfirm();
    pqToneAt(freq, 0, duration, type, Math.min(volume, .020));
  };

  successSound = function pqSuccessSound() {
    if (screens.result.classList.contains('active')) pqToneAt(PQ_SCALE.C6, 0, .08, 'triangle', .012);
    else pqCorrect();
  };

  wrongSound = function pqWrongSound() {
    if (pqTimeoutMode) pqTimeout();
    else pqWrong();
  };

  document.addEventListener('pointerdown', () => { pqUnlockAudio(); }, { capture: true, passive: true });
  document.addEventListener('touchstart', () => { pqUnlockAudio(); }, { capture: true, passive: true });
  document.addEventListener('keydown', () => { pqUnlockAudio(); }, { capture: true });

  if (titleMusicButton) titleMusicButton.addEventListener('click', pqToggleTitleMusic);

  soundButton.addEventListener('click', pqToggleTitleMusic);

  homeButton.addEventListener('click', () => pqStopAllMusic());
  changeCountButton.addEventListener('click', pqStopAllMusic);
  window.addEventListener('pagehide', pqStopAllMusic);

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) {
      pqStopAllMusic();
      return;
    }
    if (!soundOn || !pqAudioUnlocked) return;
    if (screens.quiz.classList.contains('active')) pqStartQuizBgm();
    else if (screens.start.classList.contains('active') && pqTitleEnabled) pqStartTitleBgm();
  });

  pqUpdateTitleButton();
})();

(() => {
  const list = root.querySelector('#reviewList');
  const count = root.querySelector('#reviewCount');
  const pageLabel = root.querySelector('#reviewPage');
  const previous = root.querySelector('#reviewPrevious');
  const next = root.querySelector('#reviewNext');
  const filters = [...root.querySelectorAll('[data-review-filter]')];
  let attempts = [], filter = 'all', page = 0;
  const pageSize = 3;
  function renderReview() {
    const filtered = attempts.filter(item => filter === 'all' || (filter === 'correct' ? item.correct : !item.correct));
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.max(0, Math.min(page, pageCount - 1));
    const correct = attempts.filter(item => item.correct).length;
    count.textContent = `정답 ${correct} · 오답 ${attempts.length - correct}`;
    pageLabel.textContent = `${page + 1} / ${pageCount}`;
    previous.disabled = page === 0;
    next.disabled = page >= pageCount - 1;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.reviewFilter === filter)));
    list.replaceChildren();
    const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'dex-review-empty';
      empty.textContent = attempts.length ? '해당하는 문제가 없어.' : '문제를 풀면 결과가 여기에 보여.';
      list.append(empty);
    }
    visible.forEach(item => {
      const row = document.createElement('article');
      row.className = 'dex-review-item' + (item.correct ? '' : ' is-wrong');
      const number = document.createElement('span');
      number.className = 'dex-review-number'; number.textContent = String(item.index + 1).padStart(2, '0');
      const image = document.createElement('img');
      image.src = SPRITE_BASE + item.id + '.png'; image.alt = ''; image.width = 44; image.height = 44;
      const info = document.createElement('div'); info.className = 'dex-review-info';
      const name = document.createElement('strong'); name.textContent = item.name;
      const answer = document.createElement('small');
      answer.textContent = item.timedOut ? '시간 초과' : item.correct ? '맞혔어!' : '내 답: ' + item.selectedName;
      info.append(name, answer);
      const status = document.createElement('span'); status.className = 'dex-review-status'; status.textContent = item.correct ? '✓ 정답' : '× 오답';
      row.append(number, image, info, status); list.append(row);
    });
  }
  function record(id, timedOut) {
    if (locked || !current || attempts.some(item => item.index === questionIndex)) return;
    const chosen = [...answersEl.children].find(button => Number(button.dataset.id) === Number(id));
    attempts.push({ index: questionIndex, id: current.id, name: current.name, correct: !timedOut && Number(id) === current.id, timedOut, selectedName: chosen?.textContent || '선택 없음' });
  }
  const baseChoose = chooseAnswer;
  chooseAnswer = function(id) { record(id, false); baseChoose(id); };
  const baseTimeout = handleTimeout;
  handleTimeout = function() { record(null, true); baseTimeout(); };
  const baseFinish = finishGame;
  finishGame = function() { filter = 'all'; page = 0; renderReview(); baseFinish(); };
  function resetReview() { attempts = []; filter = 'all'; page = 0; renderReview(); }
  startButton.addEventListener('click', resetReview, true);
  retryButton.addEventListener('click', resetReview, true);
  filters.forEach(button => button.addEventListener('click', () => { filter = button.dataset.reviewFilter; page = 0; renderReview(); }));
  previous.addEventListener('click', () => { page--; renderReview(); });
  next.addEventListener('click', () => { page++; renderReview(); });
  renderReview();
})();

(() => {
  const stage = root.querySelector('.dex-hero');
  const display = root.querySelector('.start-display');
  const slots = [...stage.querySelectorAll('.hero-slot')];
  const familiar = [1,4,7,25,39,133,152,155,158,172,175,252,255,258,280,387,390,393,447,495,498,501,570,650,653,656,722,725,728,810,813,816,906,909,912,1000];
  let drawToken = 0;
  function chooseTrio() {
    const pool = POKEMON.slice();
    const leads = pool.filter(p => familiar.includes(p.id));
    const center = shuffle(leads.length ? leads : pool)[0];
    const companions = shuffle(pool.filter(p => p.id !== center.id)).slice(0,2);
    return [companions[0],center,companions[1]];
  }
  function displayTrio() {
    const trio = chooseTrio();
    const token = ++drawToken;
    display.classList.remove('hero-boot');
    void display.offsetWidth;
    display.classList.add('hero-boot');
    slots.forEach((slot,index) => {
      const pokemon = trio[index], image = slot.querySelector('img');
      slot.classList.remove('is-entering','is-bouncing');
      slot.setAttribute('aria-label',pokemon.name+' 반응 보기');
      image.alt = pokemon.name;
      let fallback = false;
      image.onload = () => {
        if(token !== drawToken) return;
        slot.classList.remove('is-entering');
        void slot.offsetWidth;
        slot.classList.add('is-entering');
      };
      image.onerror = () => { if(!fallback && token === drawToken) { fallback=true; image.src=SPRITE_BASE+pokemon.id+'.png'; } };
      image.src = ART_BASE+pokemon.id+'.png';
    });
  }
  slots.forEach(slot => {
    slot.querySelector('img').addEventListener('animationend', () => slot.classList.remove('is-entering','is-bouncing'));
    slot.addEventListener('click', () => {
      slot.classList.remove('is-entering','is-bouncing');
      void slot.offsetWidth;
      slot.classList.add('is-bouncing');
    });
  });
  let wasActive = screens.start.classList.contains('active');
  new MutationObserver(() => {
    const active = screens.start.classList.contains('active');
    if(active && !wasActive) displayTrio();
    wasActive = active;
  }).observe(screens.start,{attributes:true,attributeFilter:['class']});
  displayTrio();
})();

})();


(() => {
  const root = document.getElementById('app');
  const scenes = [...root.querySelectorAll(':scope > .scene')];
  const settings = root.querySelector('#gameOptions');
  function syncAccessibility() {
    scenes.forEach(scene => {
      const inactive = !scene.classList.contains('active');
      scene.inert = inactive;
      scene.setAttribute('aria-hidden', String(inactive));
    });
  }
  const observer = new MutationObserver(syncAccessibility);
  scenes.forEach(scene => observer.observe(scene, { attributes: true, attributeFilter: ['class'] }));
  root.querySelector('#startButton').addEventListener('click', () => { settings.open = false; }, true);
  syncAccessibility();
})();


(() => {
  let frame = 0;
  function fitViewport() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--app-height', height + 'px');
    });
  }
  window.addEventListener('resize', fitViewport, { passive: true });
  window.addEventListener('pageshow', fitViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', fitViewport, { passive: true });
  fitViewport();
})();
