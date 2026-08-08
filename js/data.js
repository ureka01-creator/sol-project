// Pokémon Dice Battle - game logic / AI / audio
// v2.4.2: dice WAVs play only during actual dice animation
// Assets: ../images and ../sounds (paths in browser are relative to index.html)

const P=[
 {id:25,n:"피카츄",t:"전기",hp:60,s1:["전광석화",10,1,"아무 주사위 1개"],s2:["10만볼트",30,2,"합계 10 이상"]},
 {id:4,n:"파이리",t:"불꽃",hp:55,s1:["할퀴기",10,1,"아무 주사위 1개"],s2:["불꽃세례",25,2,"4 이상 2개"]},
 {id:7,n:"꼬부기",t:"물",hp:70,s1:["물대포",15,1,"아무 주사위 1개"],s2:["아쿠아테일",28,2,"짝수 2개"]},
 {id:1,n:"이상해씨",t:"풀",hp:70,s1:["덩굴채찍",15,1,"아무 주사위 1개"],s2:["씨폭탄",28,2,"합계 8 이상"]},
 {id:92,n:"고오스",t:"고스트",hp:50,s1:["핥기",12,1,"홀수 1개"],s2:["나이트헤드",28,2,"같은 눈 2개"]},
 {id:143,n:"잠만보",t:"노말",hp:100,s1:["몸통박치기",14,1,"아무 주사위 1개"],s2:["기가임팩트",35,3,"주사위 3개"]}
];
const LOCAL_IMAGES={
  25:"images/pikachu.png",
  4:"images/charmander.png",
  7:"images/squirtle.png",
  1:"images/bulbasaur.png",
  92:"images/gastly.png",
  143:"images/snorlax.png"
};
const img=id=>LOCAL_IMAGES[id];
