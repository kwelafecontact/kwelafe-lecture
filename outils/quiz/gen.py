import re,json,random
random.seed(7)
L=lambda f:open(f).read().split('\n')
Q=[]; MOTS={}; PAIRES=[]
def ajout(q,bonne,faux,info,theme,source,public="tous"):
    faux=[f for f in dict.fromkeys(faux) if f and f!=bonne][:3]
    if len(faux)<3: return
    Q.append(dict(q=q,r=[bonne]+faux,info=info,theme=theme,source=source,public=public))
def clip(s,n=110):
    s=s.strip()
    return s if len(s)<=n else s[:n].rsplit(' ',1)[0]+'…'
# Zarlor
z=L('OTE_Les_zarlor_iPad.txt'); ZA=[]
for i,l in enumerate(z):
    if re.match(r'^N° \d{3}$',l.strip()) and i+2<len(z):
        e,t=z[i+1].strip(),z[i+2].strip()
        if t and not t.startswith('✦') and len(t)<45: ZA.append((e,t))
ZA=list(dict(ZA).items())
for e,t in ZA: ajout(f"Que veut dire « {e} » ?",t,random.sample([x[1] for x in ZA if x[1]!=t],3),f"« {e} » : {t}.","creole","OTÉ ! Les zarlor")
MOTS['creole']=[e for e,t in ZA if len(e)<20]
# Kosa i mank paires
k=open('Kosa_i_mank_iPad_vol_1..txt').read()
for m in re.findall(r'^\?(.+)$',k,re.M):
    p=m.split('?')
    for a,b in zip(p[0::2],p[1::2]):
        if a.strip() and b.strip(): PAIRES.append((a.strip(),b.strip(),"Kosa i mank ?"))
# Plantes
PL=[]
for f,src in [('Plantes_indigenes_Reunion_Tome1_EPUB_iPad.txt','Plantes indigènes, Tome 1'),('Plantes_indigenes_Reunion_Tome2_EPUB_iPad.txt','Plantes indigènes, Tome 2'),('Guide_plantes_quotidien_EPUB_iPad.txt','Guide des plantes au quotidien')]:
    t=L(f)
    for i,l in enumerate(t):
        if i>1 and (l.startswith('Nom scientifique') or l.startswith('Autres noms')):
            nom=t[i-1].strip()
            if nom and nom[0].isupper() and len(nom.split())==2 and nom.split()[1].islower() and re.match(r'^[A-Z][a-z]+ [a-z]+$',nom): nom=t[i-2].strip()
            if not nom or len(nom)>40 or 'Partie' in nom or nom.startswith('Autres'): continue
            bloc=' '.join(t[i:i+12])
            fam=re.search(r'Famille des ([A-ZÉ][\wéèê]+)',bloc); rec=re.search(r'La reconnaître\. ([^.]+\.)',bloc)
            PL.append(dict(nom=nom,fam=fam and fam.group(1),rec=rec and rec.group(1),src=src))
PL=list({p['nom']:p for p in PL}.values()); noms=[p['nom'] for p in PL]
for p in PL:
    if p['rec'] and len(p['rec'])>45 and p['nom'].split()[-1].lower() not in p['rec'].lower():
        ajout(f"Quelle plante est décrite ici ? « {clip(p['rec'],140)} »",p['nom'],random.sample([n for n in noms if n!=p['nom']],3),f"C'est {p['nom']}.","plantes",p['src'])
    if p['fam']:
        fams=sorted({x['fam'] for x in PL if x['fam'] and x['fam']!=p['fam']})
        ajout(f"À quelle famille appartient « {p['nom']} » ?",f"Les {p['fam']}",[f"Les {x}" for x in random.sample(fams,3)],f"{p['nom']} : famille des {p['fam']}.","plantes",p['src'])
MOTS['plantes']=[n for n in noms if len(n)<22]
# Ti zherbages (enfants)
t=L('Ti_zherbages_EPUB_iPad.txt'); TZ=[]
for i,l in enumerate(t):
    m=re.match(r"^((?:Le|La|L’|Les) [^,]{2,30}), ((?:le|la|l’|les|un|une) .{4,45})$",l.strip())
    if m and t[i-1].startswith('Partie'): TZ.append((m.group(1),m.group(2),clip(t[i+1],160)))
TZ=list({x[0]:x for x in TZ}.values())
for nom,sur,desc in TZ: ajout(f"Quelle plante appelle-t-on « {sur} » ?",nom,random.sample([x[0] for x in TZ if x[0]!=nom],3),desc,"plantes","Ti zherbages","enfant")
MOTS['enfants']=[x[0] for x in TZ]
# Tisanerie
t=L('Dictionnaire_tisanerie_creole_EPUB_iPad.txt'); DI=[]
for i in range(1,len(t)-3):
    w,d=t[i].strip(),t[i+1].strip()
    if 2<len(w)<22 and not w.endswith('.') and (t[i+2].startswith('Source') or t[i+3].startswith('Source')) and len(d)>8 and not d.startswith(('Autres','Source')) and not re.match(r'^\d',w) and 'Partie' not in w and 'saviez' not in w and not t[i-1].strip().endswith(','):
        DI.append((w,d.split('. ')[0].rstrip('.')))
DI=[x for x in dict(DI).items() if len(x[1])<90]
for w,d in DI: ajout(f"Dans la tisanerie lontan, que veut dire « {w} » ?",d,random.sample([x[1] for x in DI if x[1]!=d],3),f"« {w} » : {d}.","tradition","Dictionnaire de la tisanerie créole")
# Sirandanes (enfants)
S=json.load(open('sirandanes.json')); rep=[s[2] for s in S]
for kr,fr,r in S: ajout(f"Sirandane ! « {kr} » ({fr}) Kosa i lé ?",r,random.sample([x for x in rep if x!=r],3),f"C'est {r} !","devinettes","Sirandanes ! Kosa in shoz ?","enfant")
MOTS['devinettes']=rep
# Qui mange qui (enfants)
D=json.load(open('qmq.json')); ani=[a for c in D['chaines'] for a in c[1:]]
for c in D['chaines']:
    for proie,pred in zip(c,c[1:]):
        ajout(f"Qui mange {proie} ?",pred,random.sample([a for a in ani if a!=pred and a!=proie],3),f"{pred[0].upper()+pred[1:]} mange {proie}.","animaux","Qui mange qui à La Réunion ?","enfant")
for a,b in D['mots']: PAIRES.append((a,b,"Qui mange qui à La Réunion ?"))
MOTS['animaux']=ani
VF=[dict(q=q,v=v,source="Qui mange qui à La Réunion ?") for q,v in D['vf']]
# Superstitions II : vrai/faux déjà rédigés dans le livre ? non utilisé (livre adulte/horreur)
seen=set(); QQ=[]
for x in Q:
    if x['q'] in seen: continue
    seen.add(x['q']); QQ.append(x)
PAIRES=list({a:(a,b,s) for a,b,s in PAIRES if len(a)<20 and len(b)<24}.values())
from collections import Counter
print(Counter(x['theme'] for x in QQ), len(PAIRES), {k:len(v) for k,v in MOTS.items()})
ts="// Généré automatiquement depuis le texte des livres Kwélafé (outils/quiz). Ne pas modifier à la main.\n"
ts+="export type QuestionLivre = { q: string; r: string[]; info: string; theme: string; source: string; public: \"enfant\" | \"tous\" };\n"
ts+="export const BANQUE: QuestionLivre[] = "+json.dumps(QQ,ensure_ascii=False)+";\n"
ts+="export const PAIRES: [string, string, string][] = "+json.dumps(PAIRES,ensure_ascii=False)+";\n"
ts+="export const VRAI_FAUX: { q: string; v: boolean; source: string }[] = "+json.dumps(VF,ensure_ascii=False)+";\n"
ts+="export const CHAINES: string[][] = "+json.dumps(D['chaines'],ensure_ascii=False)+";\n"
ts+="export const MOTS_A_DEVINER: Record<string, string[]> = "+json.dumps(MOTS,ensure_ascii=False)+";\n"
open('/home/claude/kwelafe-lecture/lib/quiz/banque.ts','w').write(ts)
json.dump(random.sample(QQ,14),open('echantillon.json','w'),ensure_ascii=False,indent=0)
