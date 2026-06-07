/**
 * preview.tsx — THROWAWAY DESIGN MOCK  (delete after approval)
 * Shows the exact visual design before full implementation.
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ── Gingham: horizontal + vertical red stripe overlays ────────────────────
const GinghamFill: React.FC = () => {
  const CELL = 20;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFEAE8', borderRadius: 17, overflow: 'hidden' }]} pointerEvents="none">
      {Array.from({ length: 8 }, (_, i) => i % 2 === 0 ? (
        <View key={`h${i}`} style={{ position:'absolute', left:0, right:0, top: i*CELL, height: CELL, backgroundColor:'#CC3030', opacity:0.38 }} />
      ) : null)}
      {Array.from({ length: 22 }, (_, i) => i % 2 === 0 ? (
        <View key={`v${i}`} style={{ position:'absolute', top:0, bottom:0, left: i*CELL, width: CELL, backgroundColor:'#CC3030', opacity:0.38 }} />
      ) : null)}
    </View>
  );
};

// ── DishTray ──────────────────────────────────────────────────────────────
const DishTray: React.FC<{ children: React.ReactNode; gingham?: boolean; style?: object }> = ({ children, gingham, style }) => (
  <View style={[d.rim, style]}>
    <View style={[d.well, gingham && d.gWell]}>
      {gingham && <GinghamFill />}
      {/* inner top shadow = "pressed in" depth */}
      <LinearGradient colors={['rgba(0,0,0,0.07)','transparent']} style={d.topShadow} pointerEvents="none" />
      {children}
    </View>
  </View>
);
const d = StyleSheet.create({
  rim: {
    borderRadius: 22, padding: 3,
    backgroundColor: '#FFB0C4',
    shadowColor: '#C06878', shadowOffset:{width:0,height:5}, shadowOpacity:0.30, shadowRadius:10, elevation:7,
  },
  well: {
    borderRadius: 19, overflow:'hidden', padding: 10,
    backgroundColor: '#FFF9F4',
    borderTopWidth:2, borderLeftWidth:1.5,
    borderTopColor:'rgba(0,0,0,0.10)', borderLeftColor:'rgba(0,0,0,0.06)',
    borderBottomColor:'rgba(255,255,255,0.85)', borderRightColor:'rgba(255,255,255,0.75)',
    borderBottomWidth:1.5, borderRightWidth:1,
  },
  gWell: { backgroundColor:'#FFEAE8' },
  topShadow: { position:'absolute', top:0, left:0, right:0, height:28, borderTopLeftRadius:19, borderTopRightRadius:19 },
});

// ── Mock sticker card ─────────────────────────────────────────────────────
const MockCard: React.FC<{ emoji: string; label: string; color: string; rotate?: string }> = ({ emoji, label, color, rotate = '0deg' }) => (
  <View style={[mc.card, { backgroundColor: color, transform:[{rotate}] }]}>
    <Text style={{ fontSize: 26 }}>{emoji}</Text>
    <Text style={mc.lbl}>{label}</Text>
    <Text style={{ fontSize: 9, color:'#888' }}>★ 2</Text>
  </View>
);
const mc = StyleSheet.create({
  card: { width: 68, height: 84, borderRadius: 10, alignItems:'center', justifyContent:'center', padding:4,
    shadowColor:'#0002', shadowOffset:{width:0,height:3}, shadowOpacity:1, shadowRadius:5, elevation:4,
    borderWidth:1.5, borderColor:'rgba(255,255,255,0.7)',
  },
  lbl: { fontSize: 8, fontWeight:'700', color:'#555', marginTop:2 },
});

// ── Main Preview ──────────────────────────────────────────────────────────
export default function Preview() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#FFE4EC' }} edges={['top']}>
      {/* Quilted BG sparkles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[{t:'8%',l:'4%'},{t:'22%',r:'5%'},{t:'40%',l:'3%'},{t:'58%',r:'6%'},{t:'75%',l:'5%'},{t:'88%',r:'4%'}].map((p,i)=>(
          <Text key={i} style={{position:'absolute',top:p.t,left:p.l,right:p.r,fontSize:13,color:'#FFB0C4'}}>✦</Text>
        ))}
        <Text style={{position:'absolute',top:'18%',left:'10%',fontSize:18,opacity:0.4}}>⭐</Text>
        <Text style={{position:'absolute',top:'50%',right:'9%',fontSize:16,opacity:0.35}}>💫</Text>
        <Text style={{position:'absolute',top:'78%',left:'8%',fontSize:16,opacity:0.4}}>⭐</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={{ flexDirection:'row', alignItems:'center', paddingVertical: 10 }}>
          <Text style={{ flex:1, textAlign:'center', fontSize:20, fontWeight:'800', color:'#444' }}>🐾 Sticker Trader</Text>
          <View style={{ flexDirection:'row', gap:6 }}>
            <View style={hdr.badge}><Text style={hdr.btxt}>🔄 0</Text></View>
            <View style={hdr.badge}><Text style={hdr.btxt}>📖 8/24</Text></View>
          </View>
        </View>

        {/* AI SPEECH BUBBLE */}
        <View style={sp.bubble}>
          <Text style={sp.txt}>Hewwo! Want to trade? 🌸</Text>
        </View>

        {/* WILLINGNESS BAR */}
        <View style={{ width:'90%', alignSelf:'center', marginTop:8 }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <View style={wb.track}>
              <View style={[wb.fill, { flex:0.18 }]} />
            </View>
            <Text style={wb.pct}>0%</Text>
          </View>
          <Text style={wb.sub}>Haggle level</Text>
        </View>

        {/* AI PAW PEEK */}
        <View style={{ alignItems:'center', marginBottom:-20, zIndex:10 }}>
          <View style={paw.aiPaw}>
            <Text style={{ fontSize:24, transform:[{rotate:'180deg'}] }}>🐾</Text>
          </View>
        </View>

        {/* ZONE 1 — AI OFFER TRAY (gingham, dished) */}
        <DishTray gingham style={{ marginTop:0 }}>
          <Text style={lbl.zone}>AI Offer</Text>
          <View style={{ flexDirection:'row', justifyContent:'center', paddingVertical:4 }}>
            <MockCard emoji="🐻" label="Bear" color="#F0EFD8" />
          </View>
        </DishTray>

        {/* ZONE 2 — YOUR OFFER TRAY (cream, dished) */}
        <View style={{ alignItems:'center', marginTop:12, marginBottom:4 }}>
          <View style={lbl.pill}><Text style={lbl.pillTxt}>Your Offer</Text></View>
        </View>
        <DishTray>
          <View style={z2.dropZone}>
            <Text style={z2.hint}>Tap stickers below to offer.</Text>
          </View>
        </DishTray>

        {/* ZONE 3 — ACTION BAR */}
        <View style={z3.row}>
          <View style={[z3.btn, z3.reject]}><Text style={z3.rejectTxt}>[ ✕ ] Reject</Text></View>
          <View style={[z3.btn, z3.haggle]}><Text style={z3.haggleTxt}>[ + ] Haggle</Text></View>
          <View style={[z3.btn, z3.accept]}><Text style={z3.acceptTxt}>[🐾▶] Accept</Text></View>
        </View>

        {/* ZONE 4 — YOUR STICKERS (dished, fan overlap) */}
        <DishTray style={{ marginTop:8 }}>
          <Text style={lbl.zone}>Your Stickers</Text>
          {/* Fan of overlapping cards */}
          <View style={{ height:100, position:'relative', marginTop:6 }}>
            {[
              { emoji:'🦎', label:'Axolotl', color:'#FFD6E7', left:0, rotate:'-10deg', z:1 },
              { emoji:'🐻', label:'Bear', color:'#F0EFD8', left:42, rotate:'-5deg', z:2 },
              { emoji:'🐻', label:'Bear2', color:'#E8F0D0', left:84, rotate:'0deg', z:3 },
              { emoji:'🐻', label:'Bear3', color:'#D8E8F8', left:126, rotate:'5deg', z:4 },
              { emoji:'🐕', label:'Dog', color:'#F8E8D0', left:168, rotate:'8deg', z:5 },
              { emoji:'🦎', label:'Axo2', color:'#FFD6E7', left:210, rotate:'12deg', z:6 },
            ].map((c,i) => (
              <View key={i} style={{ position:'absolute', left:c.left, top:0, zIndex:c.z, transform:[{rotate:c.rotate}] }}>
                <MockCard emoji={c.emoji} label={c.label} color={c.color} />
              </View>
            ))}
          </View>
          {/* Player paw peek */}
          <View style={{ alignItems:'center', marginTop:4 }}>
            <View style={paw.playerPaw}><Text style={{ fontSize:22 }}>🐾</Text></View>
          </View>
        </DishTray>

      </ScrollView>
    </SafeAreaView>
  );
}

const hdr = StyleSheet.create({
  badge: { backgroundColor:'#FFF', paddingHorizontal:10, paddingVertical:5, borderRadius:20, borderWidth:1.5, borderColor:'#FFB0C4',
    shadowColor:'#DDD', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:4, elevation:2 },
  btxt: { fontSize:12, fontWeight:'700', color:'#444' },
});
const sp = StyleSheet.create({
  bubble: { alignSelf:'center', backgroundColor:'#FFF', paddingHorizontal:20, paddingVertical:8, borderRadius:20,
    shadowColor:'#DDD', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:6, elevation:3, marginTop:4 },
  txt: { fontSize:14, fontWeight:'700', color:'#555' },
});
const wb = StyleSheet.create({
  track: { flex:1, height:14, backgroundColor:'#E8E8E8', borderRadius:7, overflow:'hidden', flexDirection:'row' },
  fill: { backgroundColor:'#FF9AB2', borderRadius:7 },
  pct: { fontSize:14, fontWeight:'800', color:'#555', width:36, textAlign:'right' },
  sub: { fontSize:11, color:'#AAA', marginTop:3, textAlign:'center' },
});
const paw = StyleSheet.create({
  aiPaw: { width:44, height:44, borderRadius:22, backgroundColor:'#FFF', justifyContent:'center', alignItems:'center',
    shadowColor:'#C0C', shadowOffset:{width:0,height:3}, shadowOpacity:0.15, shadowRadius:6, elevation:3, borderWidth:2, borderColor:'#FFB0C4' },
  playerPaw: { width:40, height:40, borderRadius:20, backgroundColor:'#FFCDB2', justifyContent:'center', alignItems:'center',
    shadowColor:'#9994', shadowOffset:{width:0,height:2}, shadowOpacity:1, shadowRadius:4, elevation:3 },
});
const lbl = StyleSheet.create({
  zone: { fontSize:13, fontWeight:'700', color:'#666', textAlign:'center', marginBottom:4 },
  pill: { backgroundColor:'#FFF', paddingHorizontal:16, paddingVertical:5, borderRadius:16,
    shadowColor:'#DDD', shadowOffset:{width:0,height:2}, shadowOpacity:0.3, shadowRadius:4, elevation:2 },
  pillTxt: { fontSize:13, fontWeight:'700', color:'#555' },
});
const z2 = StyleSheet.create({
  dropZone: { borderWidth:2, borderColor:'#DDBBCC', borderStyle:'dashed', borderRadius:12, padding:14, alignItems:'center' },
  hint: { fontSize:13, color:'#BBAAAA' },
});
const z3 = StyleSheet.create({
  row: { flexDirection:'row', gap:8, marginVertical:12 },
  btn: { flex:1, paddingVertical:12, borderRadius:24, alignItems:'center', justifyContent:'center', borderWidth:2 },
  reject: { backgroundColor:'#FFF', borderColor:'#EE4444' },
  haggle: { backgroundColor:'#FFF', borderColor:'#4466EE' },
  accept: { backgroundColor:'#E8E8E8', borderColor:'#CCC' },
  rejectTxt: { fontSize:12, fontWeight:'700', color:'#CC2222' },
  haggleTxt: { fontSize:12, fontWeight:'700', color:'#3355CC' },
  acceptTxt: { fontSize:12, fontWeight:'700', color:'#888' },
});
