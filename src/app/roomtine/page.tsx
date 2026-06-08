"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ── Types ─────────────────────────────────────────── */
interface Routine {
  id: number;
  name: string;
  cat: string;
  icon: string;
  freq: string;
  reward: number;
  done: boolean;
}

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  cat: string;
  price: number;
  badge: string | null;
}

/* ── Constants ─────────────────────────────────────── */
const SHOP_ITEMS: ShopItem[] = [
  { id:"bed",     name:"코지 침대",     emoji:"🛏️", cat:"가구",   price:0,   badge:"owned" },
  { id:"desk",    name:"우드 책상",     emoji:"🪑", cat:"가구",   price:0,   badge:"owned" },
  { id:"sofa",    name:"리넨 소파",     emoji:"🛋️", cat:"가구",   price:80,  badge:"new"   },
  { id:"shelf",   name:"책장",          emoji:"📚", cat:"가구",   price:60,  badge:null    },
  { id:"plant",   name:"몬스테라",      emoji:"🌿", cat:"소품",   price:0,   badge:"owned" },
  { id:"candle",  name:"캔들 세트",     emoji:"🕯️", cat:"소품",   price:30,  badge:"new"   },
  { id:"poster",  name:"빈티지 포스터", emoji:"🖼️", cat:"소품",   price:40,  badge:null    },
  { id:"dumbbell",name:"아령",          emoji:"🏋️", cat:"소품",   price:50,  badge:null    },
  { id:"lamp",    name:"무드 조명",     emoji:"💡", cat:"소품",   price:45,  badge:null    },
  { id:"wallA",   name:"아이보리 벽지", emoji:"🏷️", cat:"벽/바닥",price:70,  badge:null    },
  { id:"floorA",  name:"우드 마루",     emoji:"🪵", cat:"벽/바닥",price:90,  badge:null    },
  { id:"xmas",    name:"크리스마스 트리",emoji:"🎄", cat:"시즌",   price:100, badge:"season"},
  { id:"sakura",  name:"벚꽃 가랜드",   emoji:"🌸", cat:"시즌",   price:80,  badge:"season"},
  { id:"bear",    name:"테디베어",       emoji:"🧸", cat:"소품",   price:35,  badge:"rare"  },
];

const FURNITURE_LAYOUT: Record<string, React.CSSProperties> = {
  bed:     { bottom:"28%", left:"5%",   fontSize:"clamp(36px,10vw,60px)" },
  desk:    { bottom:"28%", right:"5%",  fontSize:"clamp(28px,8vw,48px)"  },
  sofa:    { bottom:"28%", left:"28%",  fontSize:"clamp(32px,9vw,54px)"  },
  shelf:   { bottom:"28%", right:"20%", fontSize:"clamp(28px,8vw,48px)"  },
  plant:   { bottom:"28%", left:"42%",  fontSize:"clamp(24px,6vw,40px)"  },
  candle:  { bottom:"28%", right:"30%", fontSize:"clamp(18px,5vw,32px)"  },
  poster:  { bottom:"55%", left:"15%",  fontSize:"clamp(22px,6vw,36px)"  },
  dumbbell:{ bottom:"28%", left:"18%",  fontSize:"clamp(22px,6vw,36px)"  },
  lamp:    { bottom:"28%", right:"42%", fontSize:"clamp(24px,6vw,36px)"  },
  xmas:    { bottom:"28%", left:"50%",  fontSize:"clamp(32px,9vw,54px)"  },
  sakura:  { bottom:"65%", left:"30%",  fontSize:"clamp(20px,5vw,32px)"  },
  bear:    { bottom:"28%", right:"15%", fontSize:"clamp(20px,5vw,30px)"  },
};

const EMOJI_OPTIONS = ["🏃","🤸","🧘","📚","🎨","🍳","😴","🎵","💪","🌿","🐶","📝","☕","🧹","🚴","🏊"];
const CAT_LABELS: Record<string,string> = {
  "운동":"🏃 운동","수면":"😴 수면","식습관":"🥗 식습관",
  "공부":"📚 공부","마음챙김":"🧘 마음챙김","취미":"🎨 취미"
};
const BADGE_LABELS: Record<string,string> = { new:"NEW", rare:"희귀", season:"시즌", owned:"보유" };

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5  && h < 10) return { label:"🌅 아침", sky:"#FEE8CC", light:"rgba(255,220,120,0.25)" };
  if (h >= 10 && h < 17) return { label:"☀️ 낮",   sky:"#D4EEFF", light:"rgba(200,235,255,0.3)"  };
  if (h >= 17 && h < 20) return { label:"🌇 저녁", sky:"#FECDA0", light:"rgba(255,180,80,0.3)"   };
  return                         { label:"🌙 밤",   sky:"#2A2D45", light:"rgba(100,120,200,0.2)"  };
}

/* ── Component ─────────────────────────────────────── */
export default function RoomtinePage() {
  const [tab, setTab] = useState<"room"|"routines"|"shop"|"stats">("room");
  const [coins, setCoins] = useState(120);
  const [streak, setStreak] = useState(3);
  const [totalDone, setTotalDone] = useState(28);
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set(["bed","desk","plant"]));
  const [placedItems, setPlacedItems] = useState<string[]>(["bed","desk","plant"]);
  const [weeklyDone] = useState([true,true,true,false,false,false,false]);
  const [catCounts, setCatCounts] = useState<Record<string,number>>({
    "운동":8,"수면":5,"식습관":6,"공부":4,"마음챙김":3,"취미":2
  });
  const [routines, setRoutines] = useState<Routine[]>([
    { id:1, name:"아침 스트레칭", cat:"운동",    icon:"🤸", freq:"매일",  reward:10, done:false },
    { id:2, name:"물 2L 마시기",  cat:"식습관",  icon:"💧", freq:"매일",  reward:10, done:false },
    { id:3, name:"독서 30분",     cat:"공부",    icon:"📚", freq:"매일",  reward:15, done:true  },
    { id:4, name:"명상 10분",     cat:"마음챙김",icon:"🧘", freq:"매일",  reward:10, done:false },
    { id:5, name:"11시 취침",     cat:"수면",    icon:"😴", freq:"평일",  reward:10, done:false },
    { id:6, name:"스케치 연습",   cat:"취미",    icon:"✏️", freq:"주 3회",reward:15, done:false },
  ]);
  const [catFilter, setCatFilter] = useState("전체");
  const [shopFilter, setShopFilter] = useState("전체");
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [toast, setToast] = useState<string|null>(null);
  const [reward, setReward] = useState<{emoji:string;title:string;msg:string;cb?:()=>void}|null>(null);
  const [flashActive, setFlashActive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("운동");
  const [newEmoji, setNewEmoji] = useState("🏃");
  const [confettiPieces, setConfettiPieces] = useState<{id:number;style:React.CSSProperties}[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    const t = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(t);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const flashRoom = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 800);
  }, []);

  const fireConfetti = useCallback(() => {
    const colors = ["#C97B5A","#8BAF8E","#B8A9C9","#F5EFE0","#F6A623"];
    const pieces = Array.from({ length: 60 }, (_, i) => ({
      id: Date.now() + i,
      style: {
        left: `${Math.random()*100}%`,
        background: colors[Math.floor(Math.random()*colors.length)],
        borderRadius: Math.random()>0.5?"50%":"2px",
        animationDuration: `${0.8+Math.random()*1.5}s`,
        animationDelay: `${Math.random()*0.3}s`,
      } as React.CSSProperties,
    }));
    setConfettiPieces(pieces);
    setTimeout(() => setConfettiPieces([]), 2500);
  }, []);

  const showReward = useCallback((emoji: string, title: string, msg: string, cb?: () => void) => {
    setReward({ emoji, title, msg, cb });
  }, []);

  const toggleRoutine = useCallback((id: number) => {
    setRoutines(prev => {
      const r = prev.find(r => r.id === id);
      if (!r) return prev;
      if (!r.done) {
        setCoins(c => c + r.reward);
        setTotalDone(t => t + 1);
        setCatCounts(cc => ({ ...cc, [r.cat]: (cc[r.cat] || 0) + 1 }));
        showToast(`+${r.reward}🪙 획득! 오늘도 잘했어요 🏠`);
        flashRoom();
        const next = prev.map(x => x.id === id ? { ...x, done: true } : x);
        const allDone = next.every(x => x.done);
        if (allDone) {
          setTimeout(() => {
            setStreak(s => {
              const ns = s + 1;
              setCoins(c => c + 30);
              if (ns === 3) { showReward("🎊","3일 연속 달성!","보너스 코인 +30이 지급되었어요!\n랜덤 소품도 받아보세요 ✨"); fireConfetti(); }
              if (ns === 7) {
                setOwnedItems(oi => { const n = new Set(oi); n.add("sofa"); return n; });
                setPlacedItems(pi => pi.includes("sofa") ? pi : [...pi, "sofa"]);
                showReward("🛋️","7일 연속 달성!","리넨 소파를 획득했어요!\n방에 자동으로 배치됐어요 🏠"); fireConfetti();
              }
              if (ns === 30) { showReward("🌸","30일 달성!","시즌 룸 테마가\n잠금해제 되었어요! ✨"); fireConfetti(); }
              return ns;
            });
          }, 600);
        }
        // Exercise milestone
        const newExCount = (catCounts["운동"] || 0) + (r.cat === "운동" ? 1 : 0);
        if (r.cat === "운동" && newExCount === 10) {
          setTimeout(() => {
            showReward("🏋️","홈짐 세트 획득!","운동 루틴 10회 달성으로\n아령 소품을 얻었어요!", () => {
              setOwnedItems(oi => { const n = new Set(oi); n.add("dumbbell"); return n; });
              setPlacedItems(pi => pi.includes("dumbbell") ? pi : [...pi, "dumbbell"]);
            });
          }, 800);
        }
        return next;
      } else {
        setCoins(c => Math.max(0, c - r.reward));
        return prev.map(x => x.id === id ? { ...x, done: false } : x);
      }
    });
  }, [catCounts, flashRoom, fireConfetti, showReward, showToast]);

  const buyItem = useCallback((id: string) => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;
    if (ownedItems.has(id)) {
      if (placedItems.includes(id)) {
        setPlacedItems(p => p.filter(x => x !== id));
        showToast(`${item.emoji} 방에서 치웠어요`);
      } else if (FURNITURE_LAYOUT[id]) {
        setPlacedItems(p => [...p, id]);
        showToast(`${item.emoji} 방에 배치했어요! 🏠`);
        flashRoom();
      }
      return;
    }
    if (coins < item.price) { showToast(`코인이 부족해요 🪙 (${item.price - coins} 더 필요)`); return; }
    setCoins(c => c - item.price);
    setOwnedItems(oi => { const n = new Set(oi); n.add(id); return n; });
    if (FURNITURE_LAYOUT[id]) setPlacedItems(p => [...p, id]);
    flashRoom();
    showReward(item.emoji, `${item.name} 획득!`, `방에 배치되었어요 🏠\n오늘도 잘했어요!`);
    fireConfetti();
  }, [coins, ownedItems, placedItems, flashRoom, fireConfetti, showReward, showToast]);

  const addRoutine = useCallback(() => {
    if (!newName.trim()) { showToast("루틴 이름을 입력해주세요!"); return; }
    const newId = Math.max(...routines.map(r => r.id), 0) + 1;
    setRoutines(prev => [...prev, { id:newId, name:newName.trim(), cat:newCat, icon:newEmoji, freq:"매일", reward:10, done:false }]);
    setShowAddModal(false);
    setNewName("");
    showToast(`"${newName.trim()}" 루틴이 추가됐어요 🏠`);
  }, [newName, newCat, newEmoji, routines, showToast]);

  /* derived */
  const doneCnt = routines.filter(r => r.done).length;
  const progress = routines.length ? (doneCnt / routines.length) * 100 : 0;
  const filteredRoutines = catFilter === "전체" ? routines : routines.filter(r => r.cat === catFilter);
  const filteredShop = shopFilter === "전체" ? SHOP_ITEMS : SHOP_ITEMS.filter(i => i.cat === shopFilter);

  const paneColor = timeOfDay.label.includes("밤") ? "rgba(60,80,160,0.6)" : "rgba(200,230,255,0.5)";

  /* ── Render ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');
        :root{--ivory:#F5EFE0;--sage:#8BAF8E;--terra:#C97B5A;--lavender:#B8A9C9;--charcoal:#3D3530;--ivory-dark:#EAE0CC;--terra-light:#E8977A;--shadow:rgba(61,53,48,0.12);}
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{height:100%;overflow:hidden;}
        .roomtine-root{display:flex;flex-direction:column;height:100dvh;background:var(--ivory);font-family:'Inter','Apple SD Gothic Neo',sans-serif;color:var(--charcoal);overflow:hidden;max-width:480px;margin:0 auto;position:relative;}
        /* header */
        .rt-header{background:var(--charcoal);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
        .rt-logo{font-family:'DM Serif Display',serif;font-size:22px;color:var(--ivory);letter-spacing:1px;}
        .rt-logo span{color:var(--terra-light);}
        .rt-coin{background:var(--terra);color:var(--ivory);padding:6px 14px;border-radius:20px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(201,123,90,.4);}
        /* nav */
        .rt-nav{display:flex;background:var(--charcoal);border-top:1px solid rgba(255,255,255,.08);flex-shrink:0;}
        .rt-nav-btn{flex:1;padding:10px 4px 8px;background:none;border:none;color:rgba(245,239,224,.45);font-size:11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;transition:color .2s;}
        .rt-nav-btn .icon{font-size:20px;}
        .rt-nav-btn.active{color:var(--terra-light);}
        /* scrollable content */
        .rt-content{flex:1;overflow-y:auto;overflow-x:hidden;}
        /* room */
        .room-container{margin:12px 16px 12px;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px var(--shadow);}
        .room-canvas{width:100%;aspect-ratio:1/.85;position:relative;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;transition:background 2s;}
        .room-wall{position:absolute;top:0;left:0;right:0;height:72%;transition:background 1s;}
        .room-wall-l{position:absolute;top:0;left:0;width:6px;height:72%;background:rgba(0,0,0,.06);}
        .room-wall-r{position:absolute;top:0;right:0;width:6px;height:72%;background:rgba(0,0,0,.04);}
        .room-window{position:absolute;top:14%;left:50%;transform:translateX(-50%);width:26%;aspect-ratio:1/1.1;border-radius:6px 6px 0 0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3px;padding:4px;background:rgba(255,255,255,.25);border:3px solid rgba(255,255,255,.5);transition:box-shadow 2s;}
        .window-pane{border-radius:2px;transition:background 2s;}
        .room-floor{position:absolute;bottom:0;left:0;right:0;height:30%;background:linear-gradient(180deg,#C8B89A 0%,#B5A58A 100%);}
        .room-baseboard{position:absolute;bottom:29%;left:0;right:0;height:6px;background:rgba(255,255,255,.3);}
        .furniture{position:absolute;line-height:1;filter:drop-shadow(2px 4px 6px rgba(0,0,0,.2));user-select:none;animation:placeItem .5s cubic-bezier(.34,1.56,.64,1);}
        @keyframes placeItem{0%{transform:translateY(-40px) scale(0);opacity:0}100%{transform:translateY(0) scale(1);opacity:1}}
        .room-messy{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(45deg,rgba(120,80,40,.04) 0px,transparent 8px);transition:opacity 1s;}
        .room-flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle,rgba(245,239,224,.8) 0%,transparent 70%);animation:flashRoom .8s ease-out forwards;}
        @keyframes flashRoom{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
        /* streak */
        .streak-banner{margin:0 16px 12px;background:linear-gradient(135deg,var(--terra) 0%,#D4855F 100%);border-radius:16px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;color:var(--ivory);box-shadow:0 4px 16px rgba(201,123,90,.35);}
        .streak-num{font-size:26px;font-weight:700;}
        .streak-label{font-size:12px;opacity:.85;margin-top:2px;}
        .streak-dots{display:flex;gap:6px;}
        .streak-dot{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.3);}
        .streak-dot.done{background:var(--ivory);}
        /* progress */
        .progress-wrap{margin:0 16px 12px;background:white;border-radius:16px;padding:14px 16px;box-shadow:0 2px 12px var(--shadow);}
        .progress-labels{display:flex;justify-content:space-between;font-size:12px;color:rgba(61,53,48,.55);margin-bottom:8px;}
        .progress-bg{height:10px;background:var(--ivory-dark);border-radius:10px;overflow:hidden;}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--sage) 0%,#6FAF74 100%);border-radius:10px;transition:width .6s cubic-bezier(.34,1.56,.64,1);}
        /* section */
        .section-header{padding:16px 20px 10px;display:flex;align-items:baseline;justify-content:space-between;}
        .section-title{font-size:18px;font-weight:700;}
        .section-sub{font-size:12px;color:var(--terra);font-weight:600;}
        /* chips */
        .chip-scroll{display:flex;gap:8px;padding:0 20px 12px;overflow-x:auto;scrollbar-width:none;}
        .chip-scroll::-webkit-scrollbar{display:none;}
        .chip{padding:6px 14px;border-radius:20px;border:2px solid var(--ivory-dark);background:white;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .2s;color:var(--charcoal);}
        .chip.active{background:var(--terra);border-color:var(--terra);color:white;}
        /* routines */
        .routines-list{padding:0 16px;display:flex;flex-direction:column;gap:10px;}
        .routine-card{background:white;border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 12px var(--shadow);cursor:pointer;border:2px solid transparent;position:relative;overflow:hidden;transition:transform .15s;}
        .routine-card:active{transform:scale(.98);}
        .routine-card.done{border-color:var(--sage);background:linear-gradient(135deg,rgba(139,175,142,.08) 0%,white 60%);}
        .r-icon{font-size:32px;min-width:44px;text-align:center;}
        .r-info{flex:1;min-width:0;}
        .r-name{font-size:15px;font-weight:600;}
        .r-meta{font-size:12px;color:rgba(61,53,48,.55);margin-top:3px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .r-reward{font-size:11px;background:var(--ivory);padding:3px 8px;border-radius:10px;font-weight:600;color:var(--terra);}
        .check-circle{width:28px;height:28px;border-radius:50%;border:2.5px solid var(--ivory-dark);display:flex;align-items:center;justify-content:center;transition:all .3s cubic-bezier(.34,1.56,.64,1);flex-shrink:0;}
        .routine-card.done .check-circle{background:var(--sage);border-color:var(--sage);transform:scale(1.15);}
        .add-btn{margin:16px;padding:14px;background:none;border:2.5px dashed var(--ivory-dark);border-radius:16px;width:calc(100% - 32px);font-size:14px;font-weight:600;color:rgba(61,53,48,.45);cursor:pointer;transition:all .2s;}
        .add-btn:hover{border-color:var(--terra);color:var(--terra);}
        /* shop */
        .shop-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:0 16px;}
        .shop-item{background:white;border-radius:16px;padding:16px 12px;text-align:center;box-shadow:0 2px 12px var(--shadow);cursor:pointer;border:2px solid transparent;transition:all .2s;position:relative;}
        .shop-item:active{transform:scale(.97);}
        .shop-item.owned{border-color:var(--sage);background:linear-gradient(135deg,rgba(139,175,142,.06) 0%,white 100%);}
        .shop-item.featured{border-color:var(--terra);}
        .shop-emoji{font-size:44px;margin-bottom:8px;display:block;}
        .shop-name{font-size:13px;font-weight:600;}
        .shop-price{margin-top:8px;font-size:12px;font-weight:700;color:var(--terra);display:flex;align-items:center;justify-content:center;gap:4px;}
        .shop-price.free{color:var(--sage);}
        .shop-price.owned-p{color:var(--sage);}
        .shop-badge{position:absolute;top:8px;right:8px;font-size:10px;padding:2px 7px;border-radius:10px;font-weight:700;}
        .badge-new{background:var(--terra);color:white;}
        .badge-rare{background:var(--lavender);color:white;}
        .badge-season{background:linear-gradient(135deg,#f6a623,#f05a28);color:white;}
        .badge-owned{background:var(--sage);color:white;}
        /* stats */
        .stats-cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;padding:0 16px;}
        .stat-card{background:white;border-radius:16px;padding:18px 14px;box-shadow:0 2px 12px var(--shadow);text-align:center;}
        .stat-icon{font-size:28px;margin-bottom:6px;}
        .stat-value{font-size:28px;font-weight:700;color:var(--terra);font-family:'DM Serif Display',serif;}
        .stat-label{font-size:12px;color:rgba(61,53,48,.55);margin-top:2px;}
        .weekly-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;padding:16px;background:white;margin:12px 16px 0;border-radius:16px;box-shadow:0 2px 12px var(--shadow);}
        .week-day{text-align:center;}
        .week-label{font-size:10px;color:rgba(61,53,48,.45);margin-bottom:4px;}
        .week-dot{width:100%;aspect-ratio:1;border-radius:50%;background:var(--ivory-dark);display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .3s;}
        .week-dot.done{background:var(--sage);}
        .week-dot.today{box-shadow:0 0 0 2.5px var(--terra);}
        /* toast */
        .toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--charcoal);color:var(--ivory);padding:12px 20px;border-radius:30px;font-size:14px;font-weight:500;opacity:0;pointer-events:none;white-space:nowrap;z-index:999;max-width:calc(100vw - 40px);text-align:center;transition:all .35s cubic-bezier(.34,1.56,.64,1);}
        .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
        /* reward */
        .reward-overlay{position:fixed;inset:0;background:rgba(61,53,48,.7);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);transition:opacity .3s;}
        .reward-card{background:var(--ivory);border-radius:24px;padding:36px 28px;text-align:center;max-width:300px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);transform:scale(1);animation:popIn .4s cubic-bezier(.34,1.56,.64,1);}
        @keyframes popIn{from{transform:scale(.85);opacity:0}to{transform:scale(1);opacity:1}}
        .reward-emoji{font-size:64px;margin-bottom:12px;display:block;animation:bounce .6s ease infinite alternate;}
        @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}
        .reward-title{font-size:22px;font-weight:700;color:var(--charcoal);margin-bottom:8px;}
        .reward-msg{font-size:14px;color:rgba(61,53,48,.65);line-height:1.6;white-space:pre-line;}
        .reward-btn{margin-top:24px;padding:14px 36px;background:var(--terra);color:white;border:none;border-radius:30px;font-size:15px;font-weight:700;cursor:pointer;width:100%;box-shadow:0 4px 16px rgba(201,123,90,.4);}
        /* modal */
        .modal-overlay{position:fixed;inset:0;background:rgba(61,53,48,.6);display:flex;align-items:flex-end;justify-content:center;z-index:1000;backdrop-filter:blur(3px);}
        .modal-sheet{background:var(--ivory);border-radius:24px 24px 0 0;padding:24px 20px 40px;width:100%;max-width:480px;animation:slideUp .4s cubic-bezier(.32,.72,0,1);}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .modal-handle{width:40px;height:4px;background:var(--ivory-dark);border-radius:4px;margin:0 auto 20px;}
        .modal-title{font-size:18px;font-weight:700;margin-bottom:20px;}
        .form-group{margin-bottom:16px;}
        .form-label{font-size:13px;font-weight:600;color:rgba(61,53,48,.65);margin-bottom:6px;display:block;}
        .form-input,.form-select{width:100%;padding:12px 14px;border:2px solid var(--ivory-dark);border-radius:12px;font-size:15px;background:white;color:var(--charcoal);outline:none;transition:border-color .2s;font-family:inherit;}
        .form-input:focus,.form-select:focus{border-color:var(--terra);}
        .emoji-picker{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;}
        .emoji-opt{font-size:24px;text-align:center;padding:6px;border-radius:10px;cursor:pointer;border:2px solid transparent;transition:all .15s;}
        .emoji-opt.selected{border-color:var(--terra);background:rgba(201,123,90,.1);}
        .modal-btn{width:100%;padding:15px;background:var(--terra);color:white;border:none;border-radius:16px;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px;box-shadow:0 4px 16px rgba(201,123,90,.35);}
        .cancel-btn{width:100%;margin-top:10px;padding:12px;background:none;border:none;font-size:14px;color:rgba(61,53,48,.5);cursor:pointer;}
        /* confetti */
        .confetti-container{position:fixed;inset:0;pointer-events:none;z-index:998;overflow:hidden;}
        .confetti-piece{position:absolute;width:8px;height:8px;top:-10px;opacity:.9;animation:confettiFall linear forwards;}
        @keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
        /* time chip */
        .time-bar{padding:8px 20px;text-align:right;}
        .time-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:4px 10px;border-radius:12px;background:rgba(255,255,255,.5);}
        /* cat stat */
        .cat-stat-bar{background:white;border-radius:12px;padding:12px 14px;box-shadow:0 2px 8px var(--shadow);}
        .cat-stat-inner{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .cat-stat-fill{height:8px;border-radius:8px;background:linear-gradient(90deg,var(--sage),var(--terra));transition:width .6s;}
      `}</style>

      <div className="roomtine-root">
        {/* Header */}
        <header className="rt-header">
          <div className="rt-logo">ROOM<span>TINE</span></div>
          <div className="rt-coin">🪙 <span>{coins}</span></div>
        </header>

        {/* Nav */}
        <nav className="rt-nav">
          {(["room","routines","shop","stats"] as const).map(t => {
            const meta = { room:["🏠","내 방"], routines:["✅","루틴"], shop:["🛍️","상점"], stats:["📊","통계"] }[t];
            return (
              <button key={t} className={`rt-nav-btn${tab===t?" active":""}`} onClick={() => setTab(t)}>
                <span className="icon">{meta[0]}</span><span>{meta[1]}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="rt-content">

          {/* ── ROOM ── */}
          {tab === "room" && (
            <>
              <div className="time-bar">
                <span className="time-chip">{timeOfDay.label}</span>
              </div>
              <div className="room-container">
                <div className="room-canvas" style={{ background: timeOfDay.sky }}>
                  <div className="room-wall" style={{ background: `linear-gradient(180deg,${timeOfDay.sky} 0%,#EDE8DF 100%)` }} />
                  <div className="room-wall-l" /><div className="room-wall-r" />
                  <div className="room-window" style={{ boxShadow: `0 0 30px ${timeOfDay.light},inset 0 0 10px rgba(255,255,255,.2)` }}>
                    {[0,1,2,3].map(i => <div key={i} className="window-pane" style={{ background: paneColor }} />)}
                  </div>
                  <div className="room-floor" />
                  <div className="room-baseboard" />
                  {placedItems.map(id => {
                    const item = SHOP_ITEMS.find(i => i.id === id);
                    const pos = FURNITURE_LAYOUT[id];
                    if (!item || !pos) return null;
                    return <div key={id} className="furniture" style={pos}>{item.emoji}</div>;
                  })}
                  <div className="room-messy" style={{ opacity: progress < 50 ? (0.5 - progress/100) * 0.8 : 0 }} />
                  {flashActive && <div className="room-flash" />}
                </div>
              </div>

              {/* Streak */}
              <div className="streak-banner">
                <div>
                  <div className="streak-num">🔥 {streak}일</div>
                  <div className="streak-label">연속 달성 중이에요!</div>
                </div>
                <div className="streak-dots">
                  {Array.from({length:7},(_,i) => (
                    <div key={i} className={`streak-dot${i < (streak%7||7)?" done":""}`} />
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="progress-wrap">
                <div className="progress-labels">
                  <span>오늘의 루틴</span>
                  <span>{doneCnt}/{routines.length} 완료</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: progress+"%" }} />
                </div>
              </div>
              <p style={{padding:"0 16px 20px",fontSize:13,color:"rgba(61,53,48,.55)",textAlign:"center"}}>
                루틴을 완료하면 방이 꾸며져요 🏠
              </p>
            </>
          )}

          {/* ── ROUTINES ── */}
          {tab === "routines" && (
            <>
              <div className="section-header">
                <div className="section-title">오늘의 루틴</div>
                <div className="section-sub">{new Date().getMonth()+1}월 {new Date().getDate()}일</div>
              </div>
              <div className="chip-scroll">
                {["전체","운동","수면","식습관","공부","마음챙김","취미"].map(c => (
                  <button key={c} className={`chip${catFilter===c?" active":""}`} onClick={() => setCatFilter(c)}>
                    {c==="전체"?"전체":CAT_LABELS[c]}
                  </button>
                ))}
              </div>
              <div className="routines-list">
                {filteredRoutines.map(r => (
                  <div key={r.id} className={`routine-card${r.done?" done":""}`} onClick={() => toggleRoutine(r.id)}>
                    <div className="r-icon">{r.icon}</div>
                    <div className="r-info">
                      <div className="r-name">{r.name}</div>
                      <div className="r-meta">
                        <span>{CAT_LABELS[r.cat]}</span><span>·</span><span>{r.freq}</span>
                        <span className="r-reward">+{r.reward}🪙</span>
                      </div>
                    </div>
                    <div className="check-circle">
                      {r.done && <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  </div>
                ))}
              </div>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>+ 새 루틴 추가하기</button>
            </>
          )}

          {/* ── SHOP ── */}
          {tab === "shop" && (
            <>
              <div className="section-header">
                <div className="section-title">🛍️ 코지 상점</div>
                <div className="section-sub">보유: {coins} 🪙</div>
              </div>
              <div className="chip-scroll">
                {["전체","가구","소품","벽/바닥","시즌"].map(c => (
                  <button key={c} className={`chip${shopFilter===c?" active":""}`} onClick={() => setShopFilter(c)}>{c}</button>
                ))}
              </div>
              <div className="shop-grid">
                {filteredShop.map(item => {
                  const owned = ownedItems.has(item.id);
                  const canAfford = coins >= item.price;
                  return (
                    <div key={item.id} className={`shop-item${owned?" owned":""}${item.badge==="season"&&!owned?" featured":""}`} onClick={() => buyItem(item.id)}>
                      {owned
                        ? <span className="shop-badge badge-owned">보유</span>
                        : item.badge && <span className={`shop-badge badge-${item.badge}`}>{BADGE_LABELS[item.badge]}</span>
                      }
                      <span className="shop-emoji">{item.emoji}</span>
                      <div className="shop-name">{item.name}</div>
                      {owned
                        ? <div className="shop-price owned-p">✓ {placedItems.includes(item.id)?"배치됨":"배치하기"}</div>
                        : item.price === 0
                          ? <div className="shop-price free">무료</div>
                          : <div className={`shop-price${!canAfford?" ":" "}`} style={!canAfford?{opacity:.5}:{}} >🪙 {item.price}</div>
                      }
                    </div>
                  );
                })}
              </div>
              <div style={{height:20}}/>
            </>
          )}

          {/* ── STATS ── */}
          {tab === "stats" && (
            <>
              <div className="section-header"><div className="section-title">나의 기록</div></div>
              <div className="stats-cards">
                {[
                  {icon:"🔥",value:streak,label:"연속 달성일"},
                  {icon:"✅",value:totalDone,label:"총 완료 횟수"},
                  {icon:"🪙",value:coins,label:"보유 코인"},
                  {icon:"🏠",value:ownedItems.size,label:"보유 아이템"},
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:"16px 16px 8px",fontSize:14,fontWeight:600,color:"var(--charcoal)"}}>이번 주 달성 현황</div>
              <div className="weekly-grid">
                {["일","월","화","수","목","금","토"].map((d,i) => {
                  const today = new Date().getDay();
                  return (
                    <div key={d} className="week-day">
                      <div className="week-label">{d}</div>
                      <div className={`week-dot${weeklyDone[i]?" done":""}${i===today?" today":""}`}>
                        {weeklyDone[i]?"✓":""}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{padding:"16px 16px 8px",fontSize:14,fontWeight:600,color:"var(--charcoal)"}}>카테고리별 달성률</div>
              <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
                {(() => {
                  const entries = Object.entries(catCounts);
                  const max = Math.max(...entries.map(([,v])=>v),1);
                  return entries.map(([cat,count]) => (
                    <div key={cat} className="cat-stat-bar">
                      <div className="cat-stat-inner">
                        <span style={{fontSize:13,fontWeight:600}}>{CAT_LABELS[cat]}</span>
                        <span style={{fontSize:12,color:"var(--terra)",fontWeight:700}}>{count}회</span>
                      </div>
                      <div style={{height:8,background:"var(--ivory-dark)",borderRadius:8,overflow:"hidden"}}>
                        <div className="cat-stat-fill" style={{width:`${(count/max)*100}%`}}/>
                      </div>
                    </div>
                  ));
                })()}
              </div>
              <div style={{height:20}}/>
            </>
          )}
        </div>

        {/* Toast */}
        <div className={`toast${toast?" show":""}`}>{toast}</div>

        {/* Reward popup */}
        {reward && (
          <div className="reward-overlay">
            <div className="reward-card">
              <span className="reward-emoji">{reward.emoji}</span>
              <div className="reward-title">{reward.title}</div>
              <div className="reward-msg">{reward.msg}</div>
              <button className="reward-btn" onClick={() => { reward.cb?.(); setReward(null); }}>좋아요! 🏠</button>
            </div>
          </div>
        )}

        {/* Add routine modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-sheet">
              <div className="modal-handle"/>
              <div className="modal-title">새 루틴 추가</div>
              <div className="form-group">
                <label className="form-label">루틴 이름</label>
                <input className="form-input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="예: 아침 스트레칭 10분" maxLength={20}/>
              </div>
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <select className="form-select" value={newCat} onChange={e=>setNewCat(e.target.value)}>
                  {Object.keys(CAT_LABELS).map(c=><option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">아이콘 선택</label>
                <div className="emoji-picker">
                  {EMOJI_OPTIONS.map(e=>(
                    <div key={e} className={`emoji-opt${newEmoji===e?" selected":""}`} onClick={()=>setNewEmoji(e)}>{e}</div>
                  ))}
                </div>
              </div>
              <button className="modal-btn" onClick={addRoutine}>루틴 추가하기 🏠</button>
              <button className="cancel-btn" onClick={()=>setShowAddModal(false)}>취소</button>
            </div>
          </div>
        )}

        {/* Confetti */}
        <div className="confetti-container">
          {confettiPieces.map(p=><div key={p.id} className="confetti-piece" style={p.style}/>)}
        </div>
      </div>
    </>
  );
}
