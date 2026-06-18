import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { redirect } from 'next/navigation'

// ─── TipTap helpers ──────────────────────────────────────────────────────────

type TextNode = { type: 'text'; text: string; marks?: { type: string }[] }
type TipNode = { type: string; attrs?: Record<string, unknown>; content?: TipNode[] | TextNode[] }
type TipDoc = { type: 'doc'; content: TipNode[] }

function parseInline(text: string): TextNode[] {
  const nodes: TextNode[] = []
  const re = /\*([^*]+)\*|_([^_]+)_/g
  let i = 0, m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > i) nodes.push({ type: 'text', text: text.slice(i, m.index) })
    nodes.push({ type: 'text', text: (m[1] ?? m[2])!, marks: [{ type: 'italic' }] })
    i = m.index + m[0].length
  }
  if (i < text.length) nodes.push({ type: 'text', text: text.slice(i) })
  return nodes.length ? nodes : [{ type: 'text', text }]
}

function proseToDoc(raw: string): TipDoc {
  const content: TipNode[] = []
  for (const block of raw.split(/\n{2,}/)) {
    const t = block.trim()
    if (!t) continue
    if (t.startsWith('### ')) { content.push({ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: t.slice(4) }] }); continue }
    if (t.startsWith('## '))  { content.push({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: t.slice(3) }] }); continue }
    if (t === '---')           { content.push({ type: 'horizontalRule' }); continue }
    content.push({ type: 'paragraph', content: parseInline(t.replace(/\n/g, ' ')) })
  }
  return { type: 'doc', content }
}

function poemToDoc(raw: string): TipDoc {
  const content: TipNode[] = raw.split('\n').map(line => {
    const t = line.trim()
    return t ? { type: 'paragraph', content: [{ type: 'text', text: t }] }
             : { type: 'paragraph', content: [] }
  })
  return { type: 'doc', content }
}

// ─── Story data ───────────────────────────────────────────────────────────────

const STORIES: {
  title: string; slug: string; description: string
  publishedAt: string; poem: boolean; type?: 'story' | 'novel'; content: string
}[] = [
  // ── 1. Hot Rock ─────────────────────────────────────────────────────────────
  {
    title: 'Hot Rock',
    slug: 'hot-rock',
    description: 'I was just a dusty-kneed boy when the stranger rode into town.',
    publishedAt: '2026-04-14T08:00:00Z',
    poem: false,
    content: `I was just a dusty-kneed boy when the stranger rode into town.

It was high noon when he came.

The sun hung overhead like a judge's gavel. He sat tall in that saddle, the vagabond they whispered about in the saloons after the third whiskey.

Now, we'd all heard of him. Every soul in this dried-up town passed 'em around like bad money. How he'd dueled Billy Boy's gang near the goldmine up in the hills, four men in a row, and how he'd thrown rock, paper, and scissors against each one until all four was layin' dead in the dirt with their eyes still open, 'cause they'd tried to rob his gold claim. Four in a row. Hell, the odds of that. So we got convinced that the stranger weren't no normal man. Some said he'd made a deal with the devil himself, traded his soul for a hand that couldn't lose.

Then there was the ordeal with Judge Weatherby. Old Judge Weatherby, a sweet, honest man. They said the stranger had dueled Police Chief Talbot to death first, left him sprawled out on Main Street with his badge still pinned to his chest. When Judge Weatherby tried to prosecute the stranger before God and country in that big courthouse over in Silverton, well, God had other plans, I reckon. The judge threw rock. The stranger threw paper. And just like that, a good man — a man who'd be so sweet to his wife and three girls — dropped dead right there in the courthouse in his oversized judge outfit.

The stranger sure looked nothin' like I'd imagined. He weren't handsome — his face was weathered like old saddle left out in the sun too long, his eyes hard as creek stones. Wrinkles ran down all the way from his eye to his jaw, white against his sun-darkened skin. His hands were big, scarred up from hard livin'.

But there was somethin' about him that made the whole town hold its breath. Somethin' in the way he moved, slow and deliberate, like a mountain lion that knows it's the only predator in the valley.

He didn't storm through town. No sir, he just settled in like regular folks. Got his hair cut at Peterson's barbershop — Peterson's hands shakin' so bad he nearly nicked the stranger's ear. Tipped his hat to the ladies on the boardwalk, even gave a penny to little Sally Hutchins when she dropped her doll in the street.

The young maidens in town got all aflutter with excitement, whisperin' behind their sunhats and gigglin' like geese. "Have you seen…" they'd say. "the outlaw?" Mary-Beth Cooper, the banker's daughter who thought she was too good for the likes of us, she took to wearin' her best dress every day and walkin' past his hotel three, four times a day, pretendin' she had business at the general store.

Me and the other boys — Tommy Watkins, Little Pete, and the Henderson twins — we'd spy on the stranger from around corners, hidin' behind rain barrels and peekin' through saloon windows, tryin' to catch a glimpse of the devil's own duelist. We wanted to see him throw down, wanted to see if the stories were true.

But it was the waitin' that got to everyone. Waitin' for somethin' to happen. Waitin' for the storm to break. The whole town felt like a held breath, like the moment before thunder cracks.

One-Eye Hogan was the first who couldn't stand it.

Now, Hogan ran this town. He was the mayor, the gang leader, and the chief of police all rolled into one mean package. Lost his left eye in a duel when he was nineteen, some say from tying against a Comanche warrior, others say to a crooked card dealer in Abilene, but Hogan never told the story straight. He wore a cow leather patch over it that made him look meaner than a rattlesnake in a dry summer.

He had four wives. There was Clara, the oldest, a hard woman with a mouth like a bear trap, Hogan had won her from the old lawman in these parts. Then Martha, who used to be sweet before Hogan took the shine off her. Anna, a tiny slip of a thing who jumped at loud noises. And finally Rose, the youngest, barely fifteen, who Hogan had won in a poker game from her daddy. I swear all four of 'em took to peekin' out their windows whenever the stranger walked by, their faces pressed against the glass like they was starvin'.

Hogan's blood boil over. He called in the intern at his municipal office.

Now, that intern was my buddy, my best friend since we was both knee-high to a grasshopper. Joelle Pritchard was a skinny red-haired kid — fifteen years old but looked maybe thirteen, soakin' wet — with freckles so large and so many they looked like someone had thrown mud at his face and it stuck. His daddy had died in the mines when Joelle was just five, crushed in a cave-in, and his mama had died of the consumption two winters back. Joelle was alone in the world 'cept for me and the boys.

Hogan was his boss down at the civic center, paid him barely enough to keep his skinny bones from falling apart. When Hogan told Joelle to duel the outlaw, Joelle turned white as a fresh-bleached sheet. His hands started shakin' so bad I could hear his knuckles crackin' from where I stood.

"Lord. Mr. Hogan, sir," Joelle said, his voice barely above a whisper, "I… I ain't never dueled nobody — "

"You sayin' no to me, boy?" Hogan's voice went low and dangerous.

"No sir, I just… I'm scared, Mr. Hogan. I'm powerfully scared."

Hogan's one good eye fixed on Joelle. Then his face changed, got almost friendly: "Tell you what, boy. You do this for me, and I'll give you gold. Real gold. Enough to get yourself married, maybe even buy a little plot of land."

Joelle's eyes got wide. See, he'd been sweet on Emma-Lou Bradshaw since we was all in schoolhouse together. Emma-Lou worked at her daddy's restaurant, had hair the color of corn silk and a smile that could melt butter. But Emma-Lou's daddy wouldn't let Joelle court her proper, said Joelle didn't have prospects, didn't have nothin' to offer a girl like Emma-Lou.

"You mean it, Mr. Hogan? Real gold?"

"Real as the sun in the sky. If you don't want it, I shall go see if the other boys — "

That done it. "I'll do it," Joelle said.

I found him behind the old barn, where nobody could see. The sun was hangin' low, castin' long shadows across the dirt. Joelle was standin' there alone, his right hand held out in front of him, shakin' like a leaf.

My stomach went cold. "Joelle, don't — "

But he was already movin'. Slow and careful, he made a fist. Rock. He held it there for a moment, his whole body tense, then opened his palm flat. Paper. Then he made scissors with his fingers.

I held my breath the whole time, watchin' him like he might drop dead right there. My heart was poundin' so hard I could hear it in my ears.

"See?" Joelle said, his voice shakin'. "Nothin' happened. Only dangerous when you throw against someone."

But his face was pale as milk, and sweat was drippin' down his temples even though the evening was cool. He made the shapes again — rock, paper, scissors — and I flinched each time, expectin' somethin' terrible to happen.

"You shouldn't be doin' this," I whispered. "Even alone. It ain't… it ain't safe."

Finally, he stopped. His hands dropped to his sides, and he let out a long, shaky breath.

We stood there in silence for a long moment. Then Joelle turned.

Sittin' on the edge of the water trough outside the livery stable, his hands still shakin': "If I catch him off guard. Maybe… maybe he's just a man. Ain't no other way to make it in life for the likes of me," he said quiet-like.

He gave me his pocket watch that night, the one that had been his daddy's: "I want you to have it."

The next afternoon, Joelle crept into the stranger's hotel room at the Silver Spur. The old floorboards creaked somethin' awful in that place, but Joelle was light on his feet, always had been. He waited under the bed, pressed against the floor, his heart poundin' so loud he was sure the whole hotel could hear it.

He listened to the sounds comin' from the room — the stranger returned with a woman. The bedsprings creakin', love-makin' sounds, a woman's laugh.

When they fell asleep, Joelle made his move. His hands were sweatin' so bad he had to wipe 'em on his trousers three times before he could get out from under the bed. It creaked — Lord, it creaked so loud Joelle nearly ran right then — but the stranger didn't stir.

In the darkness of that room, lit only by a sliver of moonlight comin' through the window, Joelle could see the stranger and his woman lyin' in the bed. She was the barber's girl. Simple-minded, plain, with a rat-like face, too old to have beauty, sleeping in her man's arms like a small dog. The man's chest rose and fell, slow and steady. His hands lay in fists on top of the blanket, relaxed in sleep. Rock.

Slow, so slow it hurt, Joelle opened his own palm into paper. Every muscle in his arm screamed at him to run, to get out, to save himself.

His hand trembled as it moved toward the stranger's fist. Inch by inch. The air felt thick as molasses. Time stretched out, each second lastin' forever.

Joelle's fingers hovered above the stranger's knuckles. So close now. So close he could feel the warmth comin' off the man's skin. Just one more inch and —

Just as his palm was about to touch the stranger's fist, the stranger's eyes snapped open.

Like an animal's eyes catchin' lamplight. In the same instant, the stranger's fist opened into scissors.

Joelle felt it before he understood it. Scissors beat Paper. His mouth opened to scream, but nothin' came out except a small, choked gasp. His eyes went wide.

He dropped. Dead before he hit the floor.

The next mornin', the stranger carried Joelle's body out to the town square. I watched from across the street, standin' next to Little Pete and Tommy, and my throat was so tight I couldn't swallow.

The stranger was gentle with Joelle, cradled him. He laid my friend down on the wooden boardwalk, straightened his arms, closed his eyes proper-like.

Then the stranger turned to Abel Johansen, the coffin maker, and said in a voice that carried across the whole square: "Bury him well. A good box, somethin' with brass handles. Don't stint on the buryin'."

He even paid Abel right there, countin' out coins from his own pocket. Silver dollars, five of 'em. More than Joelle would've earned in three months at the civic center.

That's when Hogan and his gang came out. They'd been watchin' from the sheriff's office, waitin' to see what would happen. Hogan's boys spread out behind him — six men, all of 'em hard cases with meanness in their eyes.

They stood there in that town square, Hogan and the stranger, starin' each other down. The air got so thick. Nobody moved. Nobody breathed.

See, there was history between them two. Old history, the kind that festers like an infected wound.

The old-timers in town remembered when Hogan and the stranger were just boys, my age, runnin' wild together in these very streets. Back then, the stranger had a different name. Back then, the stranger was altogether different. He was a coward, they said, a boy who'd never dared to duel anyone, who'd hide behind Hogan when fights broke out, who'd run when things got dangerous.

See, most folks in this world never throw rock, paper, scissors. It's how you end up six feet under.

But Hogan, even as a boy, was different. Hogan was brave. Hogan was bold. And when he was sixteen years old, he'd challenged the local lawman to a duel.

Now, Lawman Jeremiah Pike was a legend in this territory. He'd been the law in this town for near twenty years, and in all that time, he'd never lost a duel. Not one. He'd dueled bank robbers and cattle rustlers, claim jumpers and card cheats, and every single one of 'em was buried up on Boot Hill. Pike was more than just good at dueling, he was blessed, folks said. Blessed by God Himself to uphold the law.

Pike'd helped build the church with his own two hands and never missed a Sunday service. The priest, Father Benedict, would go on and on about what a righteous man Pike was, how surely the Lord would protect him from all evil.

Hogan put his life on the line. More than that — he borrowed money from half the town, promised 'em double if he won, and told the stranger to take every cent and bet it all on Hogan.

The stranger did it. He believed in Hogan. The boy carried bags of coins to the bank, near every dollar their friends had, and bet it all on Hogan.

The whole town turned out for that duel. They stood in the town square on a Tuesday afternoon, Lawman Pike and young Hogan, and the air was so thick with tension you could taste it like copper on your tongue.

Father Benedict said a prayer. Asked the Lord to let justice prevail, to protect the righteous and strike down the wicked.

The banker stepped forward, ready to call the count. But before he could speak, young Hogan looked Lawman Pike dead in the eye and said, clear as day, "I'm gonna throw rock."

The crowd went silent. Nobody had ever heard of such a thing.

Pike's eyes narrowed. He studied the boy's face, searchin' for the trick, the deception.

Pike's jaw tightened. He'd been duelin' for twenty years, and he weren't about to be fooled by some boy's games. No, Hogan was lyin'. Had to be.

"On three," the banker called out.

"One… two… three!"

Lawman Pike threw scissors. Hogan threw rock.

Pike's face went white. He looked down at his hands like they'd betrayed him. He looked up at Hogan, opened his mouth to say somethin', and then he dropped dead right there in front of God and everybody.

The town went silent. Then it erupted. A small group of boys was cheerin' 'cause they'd bet on Hogan. Most folks was weepin' 'cause they'd lost Pike. Father Benedict fell to his knees, cryin' out to heaven, askin' why God would allow such a thing.

But Hogan just stood there with a smile on his face like he'd swallowed the sun. He'd won the duel, the money. By the laws of this land, Pike's farm became his. Pike's livestock became his. Hell, even Pike's wife became his.

Hogan was so happy countin' his winnin's before the bank even paid out. But when he went to collect his money, when he went to find the stranger who'd placed all them bets… the stranger was gone. Disappeared like smoke in the wind. And with him went the money — near every cent the town had.

Ever since that day, Hogan had run this town. He'd become the law, become the power, become the man. And the town had been dirt poor, barely scrapin' by, all 'cause the stranger took all of its wealth.

So now, when they stood there in that town square starin' each other down over Joelle's dead body, everyone knew what was comin'. Everyone knew a reckoning was at hand.

The stranger's voice cut through the silence like a blade. "You killed him."

"Skrew you," Hogan said, his one good eye narrowed to a slit.

"Duel," the stranger said, loudly. "Monday." He gestured to Joelle's body. "Like real men."

Hogan's face turned red, then purple. "You callin' me out? You laid the boy down. A killer, a drifter… a thief."

Hogan said through gritted teeth. "Five days. High noon. Here in this square. And when I kill you, I'm takin' everything you got, includin' that whore you brought with you."

The stranger's face didn't change. He nodded.

Those five days crawled by like wounded animals. The whole town buzzed with it, talked about nothin' else. Work stopped. Chores went undone. All anybody could think about was the duel.

The bank opened bettin' on both sides. The town was split right down the middle. Some believed the stranger's tale, that he'd never lost a duel, that he couldn't be beat. Others believed in Hogan, that he would win and save the town from poverty.

I didn't bet. Went to Joelle's funeral on the second day. We buried him up on Boot Hill next to his mama and daddy. Emma-Lou was there, cryin' into a handkerchief, and I gave her Joelle's pocket watch: "He wanted you to have it."

She held it against her chest: "Why? Why he had to — "

I thought about it.

"Dunno," I said, "It's a man's romance. I suppose."

In the barbershop, Peterson's hands were steadier now. For a long while, neither man spoke. Just the sound of the blade and Peterson's breathin'.

Finally, Peterson cleared his throat. "What's it like?" he said. "To duel. To take a man's life. To have your own on the line."

The stranger was quiet for so long Peterson thought he wouldn't answer. So he kept shavin', the razor movin' across the stranger's cheek. Then the stranger spoke, his voice low and rough.

"It's nothin' you'd want to find out."

Peterson nodded, didn't press. He wiped the razor on a cloth, moved to the other side of the stranger's face. The silence stretched out again.

Then the stranger spoke again.

"After all this rolls over, I'll take Janny to a good place." He paused. "You took good care of her, all these years. You are a good father. To me too."

Peterson's hand froze mid-stroke. The razor trembled against the stranger's jaw, just a little. His eyes blinked hard, turnin' his face away.

The stranger didn't say nothin' more. Just sat there while Peterson finished the shave, the old barber's hands gentle as he wiped away the last of the soap. When it was done, Peterson stood back, looked at the stranger's face like he was memorizin' it.

The stranger stood, laid some coins on the counter — more than the shave was worth. He touched Peterson's shoulder, just once, then walked out into the afternoon sun.

I watched Peterson standin' there alone in his shop, one hand pressed against his eyes, his shoulders shakin' with silence, with weight.

The days passed. Thursday. Friday. Saturday. The stranger stayed in his hotel room with the woman named Janny, barely came out 'cept to eat.

Hogan practiced. He had his men set up in the back room of the sheriff's office, and he'd throw rock, paper, scissors against the wall for hours, sweatin' and cursin' and drinkin' whiskey to calm his nerves.

Finally, Monday came.

The day of the duel.

I woke up before dawn, couldn't sleep no more. The whole town was awake, seemed like. Folks were already gatherin' in the square by the time the sun came up, claimin' spots, settin' up chairs, passin' around flasks of whiskey even though it was still mornin'.

I'd never seen the square so packed. It was the biggest turnout for a duel in the town's history. Had to be seventy people there, maybe more. Folks had come from neighboring towns, traveled hours just to see this. The air was electric, cracklin' with anticipation and fear.

Hogan arrived early with his gang, the lawmakers, the bankers. He kept wipin' his palms on his trousers, kept adjustin' his eye patch. His four wives stood off to the side, all of 'em silent for once, watchin' their husband.

The stranger strolled in right on time, like it was nothin' but another Monday noon. He walked into the square with his hat pulled low, his duster coat flappin' in the breeze, calm as still water.

Next to him walked the woman. Up close, she was even a bit ugly. Her eyes were dark, almost black. She smiled at the crowd like they was all her friends, like this was a church social and not a duel to the death. She held the stranger's hand, and he held hers gentle-like, like she was made of glass and might break if he squeezed too hard. He touched her hair, didn't say his goodbyes.

The duelists stood across from each other in the center of the square. A circle had been drawn in the dirt, and they took their places on opposite sides. The crowd pressed in close, makin' the circle tighter.

Banker Hutchins Jr. stepped forward to officiate. He was a round little man with a bald head and a nervous disposition. His hands shook as he raised them.

"Gentlemen," he said, his voice crackin'. "You both know the rules. On three, you throw. May… may the better man win."

The stranger and Hogan stared at each other. The whole world seemed to hold its breath.

Just before the count, Hogan's mouth twisted into a cruel smile. "Paper," he said loud enough for everyone to hear, "I'm throwing paper."

The crowd murmured. Some folks remembered that old duel, remembered how Hogan had spoken true and won. Was he doin' it again? Or was this the real trick — makin' the stranger think he'd tell the truth twice?

The stranger's face didn't change. Didn't show a flicker of doubt or fear or calculation. He just stared at Hogan.

"First throw," the mayor said. "One… two… three!"

Both men threw. The crowd gasped, pushed forward to see. It was a tie. Rock against rock.

The banker's face went white. "T-tie," he stammered.

Nobody had ever tied with the stranger before.

We all watched, horrified and fascinated, as the price was paid.

The stranger's woman — that simple-minded Janny — she made a sound. Not a scream, not a cry, but somethin' animal and confused. Her body started to change, started to twist and shrink. Her arms shortened. Her face pushed forward into a snout. Her dress tore as her body reshaped itself. In maybe ten seconds, where a woman had stood, there was now a pig. A simple barnyard pig, pink and squealing, confused and frightened, tryin' to run but not knowin' where to go.

The crowd gasped. Some of the women screamed. I felt my stomach turn over.

But that weren't all. Hogan made a sound too, a howl of pain that cut through the air like a knife. Blood poured down his pants, dark and red, stainin' the dirt beneath his feet. His manhood was gone, just… gone, torn away by forces we couldn't see, taken by God as payment for the tie.

He fell to his knees, shakin' with pain and fear and shock. His one good eye was wide, his mouth open in a silent scream. His boys rushed forward but he waved 'em away, too proud to show weakness.

The stranger, he hadn't moved. Hadn't flinched. He walked over to the pig, slow and careful, and knelt down in the dirt. The pig looked up at him, and he kissed it gently on the snout, right between its eyes.

Doc Hendricks rushed forward to help Hogan. As he worked, Doc Hendricks leaned in close, his voice urgent and fierce. "Hogan. You beat him now, you beat that bastard who stole our money all them years ago, this town's got a chance again."

Hogan's face was gray, sweat pourin' down his forehead, but he pulled himself back to his feet with his boys' help.

"Ain't… ain't done yet," Hogan gasped. "Ain't finished."

They returned to their positions. The crowd had grown quiet now, the excitement drained away, replaced by somethin' darker. This weren't entertainment no more. This was somethin' else. Somethin' terrible.

"Second throw," the banker said, his voice barely audible.

Hogan opened his mouth, ready to use his trick again, ready to tell the stranger what he'd throw. But somethin' stopped him. For the first time since the duel began, I saw it — real fear in his one remainin' eye. His hands were shakin', and not just from the pain.

He looked up at the sky, his voice breakin'. "Lord God in Heaven, if You're listenin'… please…" His words trailed off into a whisper.

Then he turned to his wives, standin' there at the edge of the crowd. Clara, Martha, Anna, and young Rose. "I love you," he said, his voice thick. "I love you." His eyes found his boys in the crowd — three sons from different wives. "You meant everythin'. Thank you for being in my life."

He turned to face the town, his voice stronger now. "All of you. Thank you."

The crowd was silent. Then Hogan turned back to face the stranger. They nodded at each other in a moment of calmness.

"One… two… three!"

Both men threw. Rock against rock. Another tie.

For a heartbeat, nothin' happened. Then Hogan's remainin' eye burst like a crushed grape. Blood and fluid poured down his face as he screamed — a sound so terrible it didn't seem human. He fell to the ground, writhin' and rollin' in the dirt, both hands clapped over his ruined face, screamin' and screamin' until his voice went raw.

The stranger stood still as stone. His right hand was missin' the index finger — just gone, clean as if it had never been there. Blood dripped steady from the wound, patterin' in the dust. But he didn't make a sound. Just stood there, wrapped his hand in his bandana, and waited.

The town folks rushed to Hogan. They pulled him up, holdin' him steady as he swayed blind and broken. Doc Hendricks tried to wrap somethin' around Hogan's face, tried to stop the bleedin' from where his eye had been.

Hogan's mouth found his oldest son's ear. "Stop this," he whispered, desperate. "Please, boy, stop this. I can't… I can't see nothin'. I can't go on — "

But before his son could speak, his man Bull McCready whispered to Hogan: "He lost his finger. The fucker lost his finger. He can't throw scissors no more. He can't make scissors without that finger."

The crowd pressed in, their faces eager and desperate. They pulled Hogan to his feet, steadied him, turned him toward where the stranger stood. Both eyes gone, blood soakin' through the bandages on his face. His hands reached out, tryin' to feel where he was, shakin' like leaves in a storm.

"I can't," Hogan said, but his voice was too weak. Nobody heard him. Or maybe they heard.

They set him up right. Even his son helped. Turned him in the direction of the stranger.

The stranger stood up slowly from the ground.

"Final throw," the banker said, his voice hollow. "One… two… three!"

Hogan threw paper. His hand was flat, fingers spread wide. The stranger couldn't make scissors no more. Paper would tie with paper, or beat rock. He couldn't lose.

The stranger made scissors anyway. Not the way you're supposed to, with index and middle finger. No, he used his middle and ring finger, the blood still drippin' from where his index finger used to be. It looked wrong.

But it did count.

Scissors cut paper.

It happened so fast. One moment Hogan was standin' there, his face full of terror behind the blood-soaked bandages. The next moment he was fallin'. His body hit the ground with a thud that echoed across the square, and he didn't move. Didn't twitch. Didn't breathe.

One-Eye Hogan was dead.

The town erupted in chaos. Some people cheered because they'd won money. Others wailed because they'd lost everything. Doc Hendricks fell to his knees beside Hogan's body, his face gray as ash. The banker stood frozen on his platform, his ledger slippin' from his fingers.

Some of the miners who'd bet on Hogan started shoutin'. "It weren't fair! The fucker cheated! You can't make scissors without an index finger! It don't count!"

Hogan's boys — Bull McCready and the Simmons brothers and Snake-Eye Pete — they looked at the stranger like they might try somethin'. But the stranger just looked at 'em. They stopped where they stood.

The stranger took nothin' from Hogan's body. Didn't take his money or his badge. He just walked over to the pig, picked it up gentle-like, cradled it in his arms like it was a baby. The pig didn't squeal or fight. Just settled against his chest, makin' soft snuffling sounds.

He carried the pig to his horse and settled it on the saddle in front of him. Then he turned to face the crowd one last time before riding off.

Father Benedict pushed through the crowd, his face pale, his hands shakin' as he made the sign of the cross over Hogan's body. "May God have mercy on his soul," he whispered, but his voice had no conviction in it.

I found him in the saloon before he drifted.

"Is it true?" I asked. "About the money?"

The stranger was quiet for a long moment. He took a drink, set his glass down slow.

"That night, after Hogan beat Lawman Pike, I collected all the winnin's from the bank. More money than I'd ever seen. And I brought it to Hogan, just like we'd agreed."

He paused.

"See, we had a plan. Pike, for all his righteousness and Sunday church-goin', he'd been crooked as a dog's hind leg. Been takin' from the townspeople for years — crooked taxes, fixed fines. We knew where he kept it, knew he'd bet it all that day. We was gonna give it back to the people."

He looked down at his scarred hands, at where his index finger used to be.

"Hogan took it all for himself. Every last cent. Threatened to kill me. So I ran."

He finished his beer, wiped his mouth.

"Guess I won't duel again with a hand like this."

He stood, cradled the pig in his arms, and walked out into the bright afternoon sun. I followed, watched as he mounted his horse with the pig settled gently in front of him.

The stranger turned his horse toward the horizon. The sun was settin', paintin' the sky the color of blood and gold. He looked like a shadow cuttin' across all that light, him and the pig together, ridin' off into that dying sun.

I never saw him again.`,
  },

  // ── 2. Mine ──────────────────────────────────────────────────────────────────
  {
    title: 'Mine',
    slug: 'mine',
    description: 'After a year of living in the room on top of a book cafe, finally, I ran out of money.',
    publishedAt: '2026-04-14T10:00:00Z',
    poem: true,
    content: `After a year of living in the room on top of a book cafe, finally, I ran out of money

The publishing deal they promised me was going nowhere

The publishers demanded more money each week

At the same time, after a decade of back and forth

My parents finally cut me off

My flatmate, a red-faced construction worker (the only kind we had in that building)

told me about this mine not far off shore after coming home drunk one night

"They don't check shit documents I'm telling you bro that's how it is" He said

I took the guy's wallet and his phone when he was asleep

Caught the first bus to Zhoushan and left for the ocean

The place wasn't a hustle to find. It was the only one around

They said the mine doesn't produce much

Anyways, the government kept sending funding there because it's a part of a greater government program

When I asked for a job

the manager at the mine asked me if I carry any cash to bribe him

He promised me an easier and better-paid position

This manager was from Henan but he spoke the dialect of the locals

My job was to operate this mechanical claw to carry boxes from one spot to another on the platform

That was it.

12 hours of this

With just a 2 hours break after dinner before mandatory bedtime.

After dinner, I avoided the crowd

They were a bunch of local workers who spoke only the Zhoushan port dialect

Anyways, I couldn't fit in here

I would go on these long walks until I feel like it might be wise to sleep

At times, it appeared to me that the platform was as big as a city

It had its own bars, restaurants, tennis courts, and casinos just for the thousands of single men working here

An old man with a hooked nose told me he hadn't been to the shore for 18 months at a time

"Not much I missed back there." He explained

"Everything is here.

Everything you can possibly want."

Three weeks in, I already got a tan

Some light-skinned workers had burnt skin peeling off their back

We all wore the same orange safety helmets

Even though we were otherwise nearly naked

in the intense heat under direct sunlight

We had to keep the helmets on at all times

If a manager catch you without a helmet

You'd get a warning

Though I had no way of knowing what a warning could do

I didn't miss home at all

I liked the physical labour

The pain of it

When my body was occupied

My mind was set loose

I woke up, spent all the energy from every corner of this body, this machine

Then hit the bed

The bed sheet started to stink of machine oil and sweat

Most men on the platform had such a smell

A repelling, metallic smell

Soon enough, I got used to the smell

Soon enough, I got used to everything

I even started to speak their dialect

Trimmed my hair short and kept my moustaches the way the other workers did

I chugged the canned food and instant ramen I used to despise down my throat

They slid into my belly and dissolved into my stomach

Became a part of who I was

I woke up on a red, man-made, metallic island in the middle of the Pacific Ocean every morning

I got paid bi-weekly.

I did a calculation:

I would need to work here 7380 days straight to afford an apartment in uptown Shanghai

That's 20.2 years

By the time I'm 45, my parents would start to respect me

I would drive a car, paid in full

Next to me, a well-educated Shanghainese woman that went to hair salon and pilate classes regularly

In the backseat, 2 children, a boy and a girl

The boy would play piano

I would be moved to tears every time he played

The piano teacher, a snobby swan-like middle-aged woman would praise him:

"This little one is a pure genius."

To which I would reply: "Like father, like son" while delivering a satisfactory smirk

Somedays, after work, my body would stop responding

My legs would give out from fatigue

I would sit alone at the edge of the platform

And stare at the sea

Except for the beams of red light on the platform

All around me was darkness

Heavy, boundless darkness

An entire world lurked beneath my foot

Water several times the size of all the continents combined

Several billion people live on these continents

Swerving around like ants

Some of them like collecting watches

Some of them were even happy

A new ecosystem lay beneath me

With new sets of rules, lifestyles

All it takes would be just one leap

It was freezing at night here on the platform

My body would start to shake if I was out for too long

I walked back into the grey concrete hallway to my room

My toilet seat

My toothbrush

My bunk bed

My roommate grunted as I slipped into my sheets

The shaking was the worst part

Subtly, waves after waves crushed onto the base of the platform

The shaking never stopped

One day, a fight broke out on the west deck,

A young man with a skinny neck got caught stealing cigarettes from a manager

The elder fellow who caught the young man was trying to tie the young man to a cargo cart

The young man flipped over and cut off the man's ear with a pocketknife

This soon turned into a messy twenty people brawl

I watched from above

From the operating room of the crane

In the air, on my own, in a concealed metal box

I started to laugh

Clapped my hands

And began to tear up

From now on,

This was it

there was nowhere for me to go to from here

After the first two months, I was hit with a heart-torching load of loneliness

A detachment from the person who I assumed to be me

On the platform, I became something else

Deep down

there was a sadness inside every one of the workers here

This was not a language barrier, nor a cultural barrier

They smiled a lot, and all fully functional

A psychologist might even look at them and say they were healthy

under their tanned skin, cracked lips, bacteria infected skin

There

lurked a mark of rejection

Maybe I didn't reject the society

The society rejected me,

The society rejected us

That was why we were all here, in the middle of nothingness

Sons of the ocean

In the morning, in the communal shower

I saw my face, dark, lean, solemn

Identical to any other faces around me

My skin started to sag on my body

I didn't recognize any of this

I moved my arm around to check the reflection in the mirror was, indeed, mine

I walked close to the mirror

And stared at my face

I had never noticed the pores on my cheeks

I could see them now

It was a Friday afternoon when I saw the thing our mine pushed out

Through the opening of the coal mixer machine

a dark liquid started to overflow

I climbed down to the base of my crane

No one else was paying attention to this

The managers were halfway across the platform

I was the only one on the operating platform

I walked next to the opening and peeked down

Something pale and milky emerged from the black coal

It reflected brightly from the direct midday sun

My sweat dripped from my neck into the coal mix

It was then I realized what was inside the coal mix

I bend down, unclipped my helmet and put my hand into the opening

Using every bit of strength left in me,

I grabbed the hand and dragged out the body

In my arm, laid a man I could only describe as flawless

A flawless specimen of human

With a face familiar to mine

I dragged me out of the coal mixer

The flawless me, entirely naked like a newborn

His body was cold, dead

But soon enough, lying on the red, metallic platform, boiling with heat, he started to move

First a finger, then the wrists

Then the eyes

my eyes

Silently, he got up in one graceful move

He put on each item of my clothes while I undress

When I got entirely naked, we switched places

he made an inviting gesture, pointing at the opening of the coal mixer

The coal mixer spun slowly, but surely

a seagull flapped its wings across the sky

I jumped in

At first, all I saw were jellyfishes

Tiny transparent single-celled ballons

floating all around me, contracting and expanding

Emerged in the ocean

I was numb

In a blissful way

I didn't know how much time had passed in this state

Gently I was pushed to a shore

After what felt like a million years

In a half-asleep, half-awake slumber at the bottom of the world

Carried up by waves

Dragged onto the muddy beach covered by seaweed and algae

The villager boys that found me

carried my naked body to their cabin

The kids screamed, pointing at my hairy balls

The sun was shining blindingly

I squinted through my eyelids

The smell of the kitchen was sharp and overwhelming

I realized I hadn't heard a sound or seen a light in ages

Earth spat me out

I looked into a mirror the first chance I got

My body's aching sensations were correct

Where my face used to be was now replaced by a saggy, sad mask

Wrinkles and folds exploded on every corner of this face

I practiced to smile

At night, I sneaked for the door and ran off, taking the villagers' wallets and a baggy blue T-shirt

I got on a cab, then a boat

I was back on the mining platform in no time

When I saw the dark and familiar man with the orange helmet

I walked up to him

In silence, we undressed and put on each other's clothes

He was aged too, looking no younger than fifty

Where the flawless pale skin used to be was painted over with a harsh and charcoaled tan

He was the oldest worker here

For twenty years he never took a day off

Slowly, one step after another, we walked up to the mine mixer

It looked just like decades ago when we first switched places

The mine mixer was still spinning very slowly

He looked around

Making sure no one else was around,

He smiled at me

Then dived into the mixer

In a year, I bought two apartments near Jing'An district in Shanghai and a decent Japanese car

Through a friend of a new friend, I married a 35 years old kindergarten teacher

Her husband had died in a car accident a few years back

When she smiled, she had one single dimple on her left cheek

The wedding was hosted in a reputable hotel venue in Pudong

There was barely anyone from my side of the family

I never called my parents because I suspect they probably passed away of old age when I was away

I told my mother-in-law that I had been in the Netherlands for the past twenty or so years

That I was from Shanghai, yes, but I went to school in Australia,

That my parents worked in the Chinese embassy there

That they died of cancer one after another

I had made a fortune in the Aussie banking business

We had our first child in the second year of our marriage

It was a boy

I named him 'Tai-yang' meaning 'the sun'

We led a quiet life, my wife and I

I told her I've got enough money for us to live like this in Shanghai for the rest of our life

I put some money aside to raise our boy well

Other than that, I lived simply

Ate home-made food and enjoyed no luxury

In my leisure time I dance and listen to comedy specials

At times, I still think about the other me, what sort of life he embarked on the mining platform for twentyish years

But soon enough, I stopped caring

I watered my plants and coloured my walls

On Sunday afternoons I would go to a book cafe and read`,
  },

  // ── 3. Autumn Leaves ─────────────────────────────────────────────────────────
  {
    title: 'Autumn Leaves',
    slug: 'autumn-leaves',
    description: 'A samurai returns home after twenty-three years of war to find a domain divided — and two sons at war with each other.',
    publishedAt: '2026-04-16T08:00:00Z',
    poem: false,
    content: `## Part One: The Return

### I

The road to Mizuno domain had grown narrower in my absence. Twenty-three years of war had carved lines into my face deeper than any blade, yet it was this simple path through the valley — once wide enough for two ox-carts — that told me how long I had truly been gone. Bamboo pressed in from both sides now, whispering secrets I no longer understood.

My horse, old Kage, picked his way carefully over roots that had claimed the road. We were both creatures of campaigns now, suspicious of peaceful ground. In Korea, in the bitter sieges along the coast, in the endless clan wars that followed, we had learned that quiet roads often preceded ambush. But this was home. Or had been.

The first glimpse of the village came as the sun touched the western mountains. Smoke rose from more rooftops than I remembered, spreading beyond the old boundaries into what had been rice fields. The castle — my castle, though I had scarcely lived in it — sat unchanged on its hill, a gray tooth against the reddening sky. At least stone endures.

A farmer on the road's edge looked up from his bundled rice stalks. His face, weathered as bark, showed no recognition. Why should it? The boy who had ridden away to serve the Tokugawa had been eighteen, black-haired, burning with dreams of glory. The man who returned was forty-one, gray as ash, carrying glory's weight like stones in his chest.

"The castle," I said to him. "Is Lord Mizuno in residence?"

He squinted at me, this travel-worn samurai on a tired horse. "Lord Mizuno has been dead these past two winters, sir. His sons hold the domain now."

His sons. My sons. The words sat strangely in my mouth, like food from a foreign land. Ichiro would be twenty-two now. Jiro, twenty. Men grown, without their father's shadow to shape them.

"I see," I said, though I saw nothing clearly anymore. "Thank you."

The farmer bowed and returned to his work. I urged Kage forward, toward the castle where my sons waited — if waiting was what one could call it when they did not know I lived.

### II

The guards at the gate were young, wearing armor that had never seen battle. They held their spears with the casual grip of men who had only ever faced training posts. One stepped forward, his hand raised.

"State your business with the Mizuno clan."

I could have laughed, but my throat had forgotten how. Instead, I dismounted slowly, my bones protesting like old hinges. "I am Mizuno Shojiro," I said. "I have come home."

The guard frowned. "Lord Shojiro died at Sekigahara."

"No," I said. "He only wished he had."

There was commotion then, runners sent, voices raised within the walls. I stood in the gatehouse shadow, studying the courtyard beyond. The stones were the same, worn smooth by generations of feet. But the cherry tree my grandmother had planted was gone, replaced by a functional well. The small shrine to Hachiman had been moved, or removed entirely. Changes small as knife cuts, but cuts nonetheless.

When Ichiro appeared, I knew him by his walk — my father's walk, that slight forward lean as if perpetually heading into wind. But his face belonged to his mother, those sharp cheekbones that had once cut through my young heart like a blade through silk. She had died birthing Jiro. Another war I had not been present for.

"Father?" The word came out cracked, uncertain.

I bowed, formally, as one samurai to another. "Ichiro."

He did not bow back. Instead, he stared, his eyes tracking the scars visible above my collar, the way my left hand hung slightly crooked from a break that had healed badly in the field. "We held funeral rites for you. Twice."

"Then I am twice blessed," I said.

"You're supposed to be dead." This was Jiro, emerging from behind his brother. Where Ichiro was sharp angles, Jiro was soft curves — my mother's grandson more than mine. But his eyes held something harder than Ichiro's, a merchant's calculating gaze.

"I supposed that too, many times," I said. "Yet here I stand."

The brothers exchanged glances, a entire conversation in a moment's look. I recognized the language of siblings who had learned to communicate around adults, though the adult they had learned to navigate around had not been me.

"Come," Ichiro said finally. "You must be tired."

The word was inadequate. I was tired the way mountains are old, the way rivers are patient. But I followed my sons into the castle that bore our name, wondering if stones could learn to recognize strangers.

### III

The great hall had been divided. Where once a single space had stretched, severe and beautiful in its emptiness, now stood screens and partitions, creating smaller rooms within rooms. Practical, perhaps, but it broke the harmony, like a poem interrupted mid-verse.

We sat on cushions that were too soft, drinking tea from cups I didn't recognize. The family mon was there, the three water wheels of the Mizuno, but rendered in a style that spoke of recent craftsmanship. Everything old had been made new, except me.

"Tell us," Ichiro said, setting down his cup with precision, "where have you been?"

Where had I been? In mud that swallowed horses whole. In castles that burned with their defenders inside. In fields where rice grew over forgotten bones. How does one explain twenty-three years of war to sons who know only this quiet valley?

"Serving," I said simply. "First the Tokugawa, then whoever held my bond after each defeat, each victory. A masterless horse passed from rider to rider."

"The Tokugawa won," Jiro said, as if I might not know. "The peace edicts have been signed. The country is unified."

"Yes," I agreed. "I was there for the unifying. It was messier than the edicts suggest."

Silence stretched between us like a bowstring. I could hear servants moving in the corridors, the whisper of feet on tatami. When had our family acquired so many servants? We had been a modest house when I left, our domain barely large enough to support a hundred soldiers.

"Father left the domain in good order," Ichiro said, and I noticed he said 'Father' as if speaking of another man. "But the wars created opportunities. Merchants needed protection. Trade routes required guards. The Mizuno domain has prospered."

"Under whose leadership?" I asked.

Another glance between brothers. "We lead together," Jiro said, but his tone suggested otherwise.

"Together," I repeated, tasting the lie in it like copper in water.

Ichiro's jaw tightened — a gesture I recognized as my own. "There have been challenges. The Hasegawa to our east grow bold. They test our borders, claim fishing rights in our streams. And within the domain… there are disagreements about the future."

"What disagreements?"

"Whether to hold to the old ways," Ichiro said, "or embrace the new." He looked at his brother. "Some believe commerce is the path forward. That the age of the sword has ended."

"And others?" I asked, though I could guess.

"Others believe honor cannot be sold in the marketplace," Ichiro said. "That a samurai who becomes a merchant becomes nothing at all."

Jiro's face darkened like sky before storm. "Better a wealthy nothing than a proud corpse."

"Our ancestors — " Ichiro began.

"Our ancestors didn't face these times," Jiro cut him off, then seemed to remember my presence. "Forgive me, Father. These are old arguments."

Old arguments, yet they were younger than my absence. I had left sons who were barely walking, and found men who had built entire philosophies in opposition to each other. The war between them was quiet, fought with words and glances, but war nonetheless.

### IV

My chambers were exactly as I had left them, which was more disturbing than if they had been changed entirely. The same low writing desk. The same view of the mountain's shoulder. The same place where Yukiko had sat to brush her hair, counting the strokes aloud in her soft voice. Even my spare swords rested in their rack, though the silk wrapping had been replaced — multiple times, by the look of it.

I sat on the sleeping mat, not yet ready to lie down despite my exhaustion. Through the thin walls, I could hear my sons arguing, their voices rising and falling like tide. Not about me — I was merely the stone dropped into their pond, sending ripples through patterns already established. They argued about loans and interest, about merchant guilds and tax collection, about things that would have baffled the boy who had ridden away to war.

A servant brought dinner on a tray lacquered so highly I could see my reflection in it. The face that looked back was a stranger's — hollow cheeks, eyes that had seen too much, hair more white than black despite my attempts to oil it properly. I ate without tasting, mechanically, as one does in the field when food is fuel and nothing more.

Later, unable to sleep, I walked the castle corridors. My feet remembered every board that creaked, every turn that led to childhood hiding places. But the castle was full of new additions — rooms built onto rooms, corridors that branched where once they had run straight. I found myself lost in my own home, finally discovering a door that led to the western tower.

The climb was harder than it should have been. My left knee, shattered by a horse's fall five winters past, protested each step. But from the tower's top, I could see the entire domain spread beneath moonlight. It was larger than I remembered, spreading into valleys that had belonged to other families. Prosperity, my sons had said. Growth. But I knew the cost of expansion, had seen it in a hundred conquered territories. Every new field demanded protection. Every protection created resentment. Every resentment waited for weakness.

In the distance, lights burned in what could only be a new town, built where forests had stood. My father would have been proud, perhaps. He had always said the Mizuno were destined for greater things.

But standing there, wind cutting through my traveling clothes, I felt only the weight of distance — not miles, but years. The war had ended, they said. Japan was at peace. Yet I had brought war home with me, carried it like disease in my bones. And below, my sons were already at war with each other, a quiet war of ideology and ambition that would prove harder to end than any battlefield conflict.

I descended the tower slowly, favoring my weak knee. Tomorrow, I would need to understand what my domain had become.

## Part Two: The Fracture

### V

The domain's books told a story of transformation. I spent three days in the records room, reading through years of careful notation in various hands — my father's sharp characters giving way to Ichiro's precise ones, interrupted occasionally by Jiro's looser script. The numbers marched across the pages like soldiers in formation, each entry a small victory or defeat in the battle for survival.

What I found disturbed me more than any battlefield horror. The Mizuno domain had indeed prospered, but at a cost written in more than ink. Loans had been taken from merchant houses in Edo. Rights to forest timber had been sold for generations forward. Samurai stipends had been cut, then cut again, replaced with promises of future payment that grew less likely with each season.

"You disapprove." Jiro stood in the doorway, watching me with those calculating eyes.

"I seek to understand," I said, not looking up from the ledger.

He entered uninvited, sitting across from me with the casual grace of a man comfortable with proximity to power. "Understanding requires context, Father. When grandfather died, we had sixty samurai in our service. Now we have thirty. The others sought employment elsewhere when we couldn't pay their rice stipends."

"And whose decision was it to forfeit their loyalty for merchant gold?"

"Mine," he said without hesitation. "Ichiro would have had us starve with honor. I chose survival with compromise."

I set down the brush I'd been using to make notes. "And what of your brother's opinion?"

"My brother believes in a world that no longer exists," Jiro said. "He trains with the remaining samurai every morning, preparing for wars that will never come. He composes poetry about honor while I negotiate with merchants to keep our people fed."

"You sound bitter."

"I sound practical. The Tokugawa peace isn't temporary, Father. This is the new world. Swords are becoming decorations. The real power lies in controlling trade routes, not in battlefield glory."

He was probably right. In my travels, I had seen the signs — castles converted to administrative centers, samurai becoming bureaucrats, the merchant class rising like flood water. But rightness and wisdom were not always the same thing.

"And the Hasegawa?" I asked. "Are they also converting their swords to abacus beads?"

Jiro's confidence flickered. "The Hasegawa are… traditional. Lord Hasegawa Tadamori still believes in the old ways. He's been recruiting ronin, building his forces."

"While you've been dismissing ours."

"While I've been adapting to reality," Jiro corrected, but there was less certainty in his voice now.

That evening, I watched Ichiro train with the remaining samurai in the courtyard. His form was excellent — textbook perfect, each movement flowing into the next like water over stones. But it was the perfection of one who had learned from scrolls and peaceful practice, not from necessity. He had never faced a man who truly meant to kill him.

The samurai he trained were mixed — some old enough to remember real combat, others young and eager for glory they would likely never taste. They watched Ichiro with respect but not devotion. A lord who had never been tested could inspire only so much loyalty.

"Your technique is beautiful," I called out when they finished.

Ichiro turned, sweat gleaming on his face. "Would you honor us with instruction, Father?"

It was a formal request, properly made. I could have refused without insult. Instead, I found myself walking onto the training ground, accepting a practice sword from a young samurai whose name I didn't know.

"Attack me," I said to Ichiro.

He hesitated. "Father — "

"Attack me."

He came at me with that perfect form, each strike telegraphed by textbook preparation. I let him complete three passes, then on the fourth, I moved inside his guard with an economy of motion learned in darker schools than any dojo. My wooden blade stopped just short of his throat.

"Again," I said, stepping back.

This time he came faster, trying to overwhelm with speed. I deflected his strikes with minimal movement, using his momentum against him, ending with his arm locked and my blade at his kidney.

"Again."

Anger crept into his movements now — good. Anger was honest, at least. But it made him wilder, easier to read. I disarmed him with a simple wrist twist that any veteran would have seen coming.

"Your form is perfect," I said, loud enough for all to hear. "But perfection is predictable. In war, predictability is death."

"Then teach us," one of the older samurai said. "Teach us to be unpredictable."

I looked at these men, these boys, who thought war was something that could be taught in a courtyard. "War isn't just technique," I said. "It's hunger that makes you weak. It's friends dying while you live. It's choosing between two kinds of dishonor and picking the one you can sleep with. Are you certain you want to learn that?"

Silence answered me. Then Ichiro stepped forward, pride wounded but determination clear. "If the Hasegawa come, we need to be ready."

"If the Hasegawa come," I said, "you'll need more than sword work."

### VI

The meeting with Hasegawa Tadamori was arranged for neutral ground — a temple halfway between our domains. I rode with a small escort: Ichiro, two senior samurai, and, surprisingly, Jiro, who had insisted his presence was necessary despite Ichiro's objections.

The temple sat among cedars older than memory, their trunks so vast that six men couldn't circle them with joined hands. It was meant to inspire peace, reflection. Instead, it reminded me of how small human conflicts were against the measure of trees.

Hasegawa Tadamori waited in the main hall with his own escort. He was younger than I'd expected, perhaps thirty-five, with the kind of harsh beauty that spoke of northern blood. His eyes were sharp as winter stars, missing nothing. When he saw me, something shifted in his expression — recognition, though we'd never met.

"Mizuno Shojiro," he said, bowing precisely. "The Ghost."

The Ghost. I'd heard the name in my travels but hadn't known it had reached this far. It referred to a specific moment — a futile charge I'd led to cover my lord's retreat, a charge everyone believed had ended in my death. That I'd survived, been captured, then served my captors, made me something between legend and cautionary tale.

"Lord Hasegawa," I returned the bow. "I understand there are disputes to discuss."

We sat on opposite sides of a low table, our sons flanking us like chess pieces. Tea was served by nervous monks who withdrew quickly, sensing the tension that followed warriors like shadows.

"Your domain has expanded considerably," Hasegawa began, his tone neutral as morning mist. "The villages of Ishida and Yamamoto, for instance. They were independent when you… departed."

"They sought our protection," Ichiro said. "We provided it."

"Protection," Hasegawa repeated, tasting the word. "An interesting term for economic coercion."

"No one was coerced," Jiro interjected. "We offered better terms than independence could provide."

"Purchased with borrowed money," Hasegawa cut him off. "Your merchants' tricks don't change the nature of conquest, they merely disguise it."

I watched this exchange, noting how Hasegawa's hand rested on his sword hilt — not threatening, but remembering. Here was a man who believed in the old clarity: strength determined borders, honor determined conduct, and conflicts were settled with steel, not contracts.

"What do you want?" I asked directly.

Hasegawa's gaze fixed on me. "What we had. Clear boundaries. The fishing rights to the Kuro River, which has been contested since your father's death. An understanding between warriors, not merchants."

"And if we disagree on where those boundaries lie?" I asked.

"Then we settle it as samurai," he said simply. "Your sons against mine. Or…" he paused, studying me with those winter eyes, "father against father."

The hall fell silent except for the distant sound of monks chanting. Ichiro's face had gone rigid with anticipated honor. Jiro looked calculating. But Hasegawa watched only me, one old soldier recognizing another.

"You would risk war over fishing rights?" I asked.

"I would risk anything to preserve what we are," he replied. "The merchant houses grow fat while samurai forget their purpose. Your domain exemplifies this decay — warriors becoming tradesman, honor sold for coin. If that infection spreads to my lands, my ancestors' ghosts would never forgive me."

"Pretty words," Jiro said, his patience finally breaking. "But your domain is poor. Your samurai farm their own fields because you can't pay them."

Hasegawa's son, who had remained silent until now, started forward. His father stopped him with a gesture.

"Poverty with purpose is preferable to wealth without soul," Hasegawa said. "But you wouldn't understand that, merchant-son."

The insult was calculated, precise. Ichiro's hand moved to his sword. I stopped him with my own gesture.

"Three days," I said. "Give me three days to review the old agreements, the maps, the claims. Then we'll send word of our decision."

Hasegawa rose, his movement fluid despite armor. "Three days, Ghost. But know this — I have two hundred swords pledged to my banner. Ronin who remember what it means to be samurai. Your thirty merchants with katanas won't stand against them."

He left with his escort, their footsteps fading into cedar shadows. My sons immediately turned to each other, voices rising in argument before we'd even left the temple. I didn't listen. I was thinking about Hasegawa's eyes, the certainty in them. He would fight. He wanted to fight. And part of me, the part that had never really left the battlefield, understood why.

### VII

That night, I dreamed of Korea. Not the battles — those had become familiar nightmares, old friends almost. This was different. I dreamed of a village we'd taken, where an old man had stood in his doorway watching us march through. He hadn't fled, hadn't fought, hadn't begged. He'd simply watched with eyes that said: *You will leave, but this is my home forever.*

I woke to find Ichiro kneeling beside my sleeping mat, his face urgent in the pre-dawn darkness.

"Father, you must come. There's been an incident."

I dressed quickly, old habits making my fingers swift despite their stiffness. Ichiro led me through the castle to a lower room where Jiro waited with several others around something covered in white cloth. When they pulled it back, I saw a young man's face, perhaps seventeen, with the Hasegawa mon on his clothing. His throat had been cut, professionally.

"He was found at the border shrine," Jiro said. "A messenger, we think."

"You think?" I examined the body, noting defensive wounds on the hands. "What was the message?"

"There was none. That is the message." This from Matsuda, the senior samurai. "Hasegawa sends a messenger who never arrives. He'll blame us for the murder."

"Did we murder him?" I asked, looking at each face in turn.

Silence answered, but not the guilty kind. The confused kind, which was worse.

"Double the border patrols," I ordered. "But pull them back from the actual border by two hundred yards. I want no accidents, no excuses for escalation."

"Father," Ichiro said, "if we appear weak — "

"We appear disciplined," I corrected. "There's a difference. Jiro, I need a complete accounting of our actual military supplies. Ichiro, gather the samurai leaders. I need to know which men will actually fight if called."

They dispersed to their tasks, leaving me alone with the dead messenger. I covered his face again, gently. Someone's son, carrying words that might have prevented bloodshed. Now his death would likely cause it.

The accounting, when it came, was sobering. We had rice for perhaps a two-month siege. Our arrow supplies were adequate but our spears were old, some shafts cracked. Most critically, while we had thirty samurai, only twenty were truly combat-ready. The others were either too old or too green.

That evening, Jiro came to my chambers carrying sake and two cups.

"I know you found the fabric," he said.

I said nothing.

"I didn't kill him," Jiro continued. "But I was there. I was meeting with one of Hasegawa's retainers — a man who might have been convinced to provide information for the right price. The messenger interrupted us. There was a fight. The retainer killed him to protect our secret negotiation, then fled."

"And you let the body be found at our shrine."

"I panicked," he admitted. "I was trying to prevent a war through bribery, and instead I may have caused one."

I poured another round of sake. "Your brother doesn't know?"

"Ichiro sees only what confirms his beliefs. To him, this is Hasegawa's provocation, proof that the old ways of direct conflict are inevitable."

"And what do you believe?"

Jiro stared into his cup. "I believe I've made everything worse by trying to make it better. Just as you did by leaving, and by returning."

The words stung because they held truth. My absence had forced my sons to become men without guidance, developing in opposition to each other. My return had disrupted whatever balance they'd achieved.

"What would you have me do?" I asked.

"What you've always done," Jiro said, standing to leave. "Survive. And teach us to do the same."

## Part Three: The Teaching

### VIII

The attack came three days after the rain stopped, at dawn, from three directions simultaneously. Hasegawa had planned well, using the muddy conditions to mask his troops' movement until they were almost upon us. The first warning was a fire arrow in the eastern watchtower's roof.

I was already dressed and armed — old habits die hard — and reached the walls as the first wave struck. They came with ladders and determination, exactly as I'd expected. What I hadn't expected was to see both my sons already there, standing together for once, swords drawn.

"The east gate is holding," Ichiro reported, his perfect form finally facing its test.

"My merchant contacts in the town are organizing the civilians," Jiro added. "They're evacuating to the keep."

No time for surprise at their cooperation. "Ichiro, take half the samurai and reinforce the east. Jiro, coordinate the archers — concentrate fire on their ladder teams. Go!"

They obeyed without argument, another surprise. Then I was too busy to be surprised by anything.

Combat, when you haven't faced it for months, returns like a forgotten language. My body remembered before my mind did — the weight of armor, the balance of the blade, the terrible clarity that comes when everything except survival falls away. I moved along the walls, appearing wherever the defense wavered, and for a brief time I was not an aging father but the Ghost again.

A young Hasegawa samurai made it over the wall near me, full of fire and certainty. I killed him with an economy of motion that felt like putting down a rabbit — necessary, simple, sad. His eyes, as he fell, held the same surprise I'd seen in a hundred dying faces. Death was always a surprise, no matter how prepared one thought oneself.

The first attack was repelled, then a second. But I could see what my sons couldn't — we were losing by winning. Each victory cost us men we couldn't replace, while Hasegawa could afford these probing attacks. He was teaching himself our weaknesses, and we were showing him willingly.

During a lull, I found Matsuda binding a wound on his arm. "How many have we lost?"

"Four dead, seven wounded too badly to fight," he reported. "We can't sustain this."

"No," I agreed. "We can't."

That's when I saw him — Hasegawa Tadamori himself, sitting on his horse just beyond arrow range, watching like a man studying a game board. Our eyes met across the distance, and he nodded slightly, acknowledging something.

A herald approached under a white banner that same dawn.

"Lord Hasegawa Tadamori requests a parley," he announced. "He proposes single combat to settle all disputes. Himself against Mizuno Shojiro, if the Ghost still has stomach for true battle."

My sons erupted in protests, but I raised my hand for silence. This was inevitable — I had seen it in Hasegawa's eyes at the temple.

"When?" I asked the herald.

"Tomorrow. Dawn. The meadow between our forces."

"Terms?"

"Victory decides all — borders, fishing rights, the future relationship between our domains. The loser's family retains their holdings but acknowledges the winner's judgment in all disputes."

It was generous, more generous than conquest would be. Hasegawa wanted a clean ending, a story worth telling.

"Accepted," I said.

After the herald left, my sons confronted me together, their rivalry momentarily forgotten.

"You can't," Ichiro said. "You're — " He stopped, unable to say old, weak, worn.

"I'm what I've always been," I said. "A survivor. But sometimes survival means knowing when not to survive."

"That makes no sense," Jiro protested.

"Doesn't it?" I looked at them both, these sons I had failed by absence. "If I win, Hasegawa's vision dies with him, and his sons grow up to seek vengeance. If I lose, you're forced to work together against a common threat. Either way, the war ends."

That night, I prepared carefully. I sharpened my sword, though sharpness would matter less than timing. I wrote letters to be sent after — one to each son, one to be read together. Then I sat in the garden where my grandmother's cherry tree had once stood, and I tried to find the words for what I needed to say.

### IX

Dawn came gray and cold, mist rising from the wet earth like the spirits of all the men who had died for less important causes. I dressed simply — hakama and kimono, no armor. My sword at my side felt heavier than it had in years, or perhaps I was finally feeling its true weight.

Both armies had gathered at the meadow's edges, forming a rough circle. The grass was still wet with dew that would be burned away by the time this ended. I saw my sons standing together, Ichiro's hand resting on Jiro's shoulder — when had that begun?

Hasegawa waited in the center, similarly unarmored. He had chosen to make this a duel of skill, not equipment. As I approached, I noticed the maple trees at the meadow's edge were just beginning to turn, the first hints of gold among the green. Autumn arriving early, like everything else that year.

"Mizuno Shojiro," Hasegawa said formally, bowing.

I returned the bow, equally formal. "Hasegawa Tadamori."

"I'm honored," he said, and meant it. "To test myself against a true survivor of the great war — this is worth more than any domain."

"Is it?" I asked. "Your sons might disagree if you don't return to them."

His smile was sharp as winter. "Then I must ensure I return."

We drew our swords together, the sound cutting through morning mist like thunder. He was good — better than good. His technique was flawless, his spirit burning with the certainty of righteousness. Twenty years ago, I might have met him strength for strength, fire for fire. But I was no longer that man.

Instead, I fought like water — flowing around his attacks, offering no solid resistance, using his own force against him. It frustrated him, I could see it in the tightening of his jaw, the way his strikes became marginally wilder.

"Fight properly," he hissed as our blades locked.

"I am," I replied.

We separated, circling. I could feel the crowd's restlessness. They too wanted something beautiful, something worthy of songs. Instead, they were watching two fathers dance around the truth that one of them had to die for nothing to change.

Then I saw it — my opportunity. Hasegawa committed to a powerful overhead strike, picture-perfect in its execution. Instead of dodging, I stepped inside his range, accepting the blade's descent while positioning my own.

Time slowed, as it does in the moments that matter. I could have killed him then — my sword was perfectly placed for a fatal thrust. He knew it too, his eyes widening with the realization. But instead, I did something else. I dropped my sword.

His blade, already descending, couldn't be stopped. But with my sword gone, I could use both hands to redirect his strike, guiding it to where I wanted it. The blade entered my left side, sliding between ribs with the peculiar cold that deep wounds bring.

We stood frozen for a moment, his sword in my body, my hands on his wrists. "Now," I said quietly, only for him, "you must choose. Pull the blade out, and I die quickly. Leave it, and we have time to speak. Choose."

He left it, though his hands trembled. Around us, chaos erupted — shouts, movement, my sons rushing forward. I raised one hand, stopping them.

"Stay back," I commanded. "This isn't finished."

I looked at Hasegawa, this man who believed in the old ways, in the clarity of strength and honor. "You've won," I said, loud enough for all to hear. "By the terms agreed, you decide our domains' futures. What is your judgment?"

He understood what I had done. "Why?" he asked.

I turned, carefully, the sword still in me, to face our gathered armies. My sons stood at the front, Ichiro openly weeping, Jiro's face stone.

"I name Hasegawa Tadamori victor," I announced. "His judgment stands."

"My judgment," Hasegawa said, his voice cracking, "is that our domains should unite through marriage. My eldest daughter to whichever Mizuno son the family chooses. Our disputes internal matters to be settled by negotiation, not blood."

It was wise, far wiser than conquest. I nodded, then looked at my sons. "You must choose together," I said. "Not which of you marries, but how to move forward as brothers. The domain needs both of you. Teach each other."

My legs were becoming unreliable. Hasegawa moved to support me, this enemy who was no longer an enemy. "The sword?" he asked.

"Leave it," I said. "It's holding things in place for now."

### X

They carried me to the maple trees at the meadow's edge. Someone had spread a blanket there. The morning sun was finally burning through the mist, and I could see the leaves above, red and gold against a brightening sky.

My sons knelt on either side of me. Hasegawa stood back, giving us privacy, but I could see him instructing his own sons, perhaps explaining what had happened, what it meant.

"Father," Ichiro said, "we can fetch a physician — "

"No," I said. The cold was spreading faster now, and there was a peculiar lightness to it, almost pleasant. "This is chosen. Let it be."

"You planned this," Jiro said. It wasn't an accusation, just understanding.

"I planned to end the war," I admitted. "The method came to me in the moment. But yes, I knew one of us wouldn't walk away. Better the one who had already lived his life."

"You barely lived at all," Ichiro protested. "Twenty-three years of war, then this — "

"I lived enough," I interrupted gently. "I survived when I shouldn't have, saw things no one should see, did things that will never be in any song. But I also saw you both standing together this morning. That was worth it."

The pain was fading now, replaced by a strange warmth. Above us, wind moved through the maples, and leaves began to fall, spiraling down like prayers written in gold.

"The domain," Jiro began.

"Will survive," I finished. "You'll make it survive, together. Ichiro, your brother's compromises aren't betrayals — they're adaptations. Learn from him. Jiro, your brother's principles aren't foolishness — they're anchors. Without them, we drift into becoming nothing more than what we own."

More people were gathering now, both armies forming a rough circle at a respectful distance. Witnesses to an ending.

"Father," Ichiro said, "what should we tell people? About you, about this?"

I thought about it, watching the leaves fall. One landed on my chest, perfect in its imperfection, edges already curling. "Tell them the truth," I said finally.

Hasegawa approached then, his own sons behind him. He knelt formally, a lord acknowledging another lord. "Your name will be remembered with honor, Mizuno Shojiro."

The sun was fully up now, warming my face. I could hear birds beginning their day, ignorant of human dramas. It was a good sound, a living sound.

"Together," I said to my sons, though the word came out whispered. "Promise me. Together."

They each took one of my hands, and I felt them join their free hands across me. "We promise, Father," they said in unison, and for the first time, I believed them.

The maple leaves continued to fall, catching the light like coins tossed by generous gods. I watched them spiral, and I thought about my grandmother's cherry tree, about the beauty of things that bloom briefly and fall at their proper time.

## Epilogue

*Written in Jiro's hand*

Father died as the sun reached its zenith, surrounded by falling leaves that seemed to pause in their descent as he breathed his last. Hasegawa Tadamori himself helped us carry him home, our former enemy now bound to us by something stronger than any treaty.

We burned him in the old way, on a pyre of cedar and maple wood, his sword — the one he had dropped rather than use — placed across his chest. The smoke rose straight in the still air, as if his spirit knew exactly where it was going.

Ichiro spoke the funeral oration. I managed the logistics, the feeding of guests, the protocols of grief. We were still ourselves, but we were ourselves together.

*Written in Ichiro's hand*

The marriage was arranged for spring. Hasegawa's daughter, Yukiko — named, we learned, for our mother — would marry me. But it was understood that Jiro would manage the unified domain's finances, while I commanded its military. Two hands, one body, as Father might have said if he were given to metaphor.

We found his letters that night, after the funeral. One to each of us, one to be read together. Mine spoke of pride in my principles, but warned against rigidity. "Steel that cannot bend will break," he wrote. "Your mother knew this. Learn it too."

*Written in Jiro's hand*

My letter was this: "You understand survival," Father wrote, "but surviving isn't enough. We must survive for something, toward something. Your brother knows what that something is, even if he can't always articulate it. Listen to him, especially when you disagree."

The joint letter was simplest: "The domain is yours, as it should have been from the beginning. I was merely an interruption, a ghost who needed to learn how to die properly. Take care of each other. Take care of our people. Remember that honor and pragmatism are not enemies — they are partners in an eternal dance. One leads, then the other, but both must move together or the dance fails."

*Found among Shojiro's personal effects, written the night before the duel*

I have been thinking about water.

In Korea, I watched a stream find its way down a mountain. When it met a boulder, it didn't stop — it went around, over, under, finding the path that required least resistance while never ceasing its movement toward the sea. When it met other streams, they joined without fighting, becoming stronger together.

I have been stone too long, standing against currents I couldn't stop, being worn down grain by grain. My sons are different waters — one clear and quick, the other deep and steady. Apart, they would carve separate channels, weakening the land between. Together, they might become a river.

Tomorrow, I stop being stone. Tomorrow, I become the rain that shows them they are not opposite streams but the same water, temporarily divided, meant to flow as one.

The leaves are turning early this year. By the time they fall, I will have joined them in that descent that looks like ending but is really transformation — from branch to earth, from one form of life to another, from father to memory to lesson to the soil from which new things grow.

The rain has stopped. Through my window, I can see stars between clouds, eternal and indifferent. Between them and earth, leaves are preparing to fall, each one a small surrender that makes spring possible.

I am ready to fall well.`,
  },

  // ── 4. Shrimp Colony ──────────────────────────────────────────────────────────
  {
    title: 'Shrimp Colony',
    slug: 'shrimp-colony',
    description: 'Ann told me to buy shrimps on my way home.',
    publishedAt: '2026-04-16T10:00:00Z',
    poem: true,
    content: `Ann told me to buy shrimps on my way home

I filled the tank with a dozen amano shrimps

Adjusted the PH value of the water, the temperature, the water filter

Baby shrimps jerked around in the tank as if they were doing a secretive dance

Within the first week

Transparent stomachs started to carry transparent eggs

By the end of the month

My tank was filled with crystal shrimps

The algae died out, the two remaining goldfishes floated to the surface, the sea snail evaporated, leaving behind her shell

All there left in my aquarium were shrimps

Ann stared at the shrimps through the tank: cute little creatures

You don't think it's getting a bit out of hand? I touched her hair

Ann tapped on the glass: let them.

Ann cheated on me with a man with crossed eyes

Chu was a reputable accountant, she told me over the phone

That summer I went to the Philippines

My family had took many vacations there

They've got the blunt sun and the soft beaches

But I couldn't forget the way the accountant's eyes crossed

The scent of Ann's skin next to her neck

I met a folk singer in Tagaytay

She got a sweet smile and scales-like tattoos going all the way from her tailbone to the top of her spine

On Tuesdays, she would be off work and we would go surfing

The waves were warm when they embraced me

Sand dripped down my hair

One day I met her parents in their driftwood cabin by the cliff

They also had identical great smiles like they had always been happy

For a moment, I thought I might just always be happy

But when I saw the tattoo along her spine against the faint light of the bonfire that night

I remembered

I taxied to the airport and took the next available flight out of the islands

I called the folk singer to tell her that I had some emergency work back home

that I will be back in Philippines in her arms in no time

Outside the plane window

The city seemed small

The people weightless, aimless,

Jerking around straw-sized streets like tiny bubbles in a water bottle

When I finally got to the door of my apartment

Water flowed out beneath the door frame

As I opened the door

Slowly, I was engulfed by a warm stream of ionised water

A civilization of amano shrimps surrounded me

Thousands, millions of them

Chitchatting, poking my feet

Then my leg, waist

Eventually head

Gradually, we floated down the stairs with the ocean coming out of my apartment

Out of the front gate

Onto the streets

The city was flooded with ionised water

The streetlights leaking electric blasts

The cars honking, sailing, flipping from side to side

The people screaming in terror, trying to hold on to their doorframes and mattresses

The helicopters beamed down headlights

to the new ocean above the city scape

To search for anyone alive

Smiling, I swam down the block

on the moonlit surface of the new ocean

I was free and nimble

As I swam over an animal the size of a skyscraper

I heard a whisper echoing through the waves

"Thank you", from beneath me, he said in a voice only shrimps had

In the water,

frantically, but with elegance

I started to dance`,
  },

  // ── 5. The Library that Eats ──────────────────────────────────────────────────
  {
    title: 'The Library that Eats',
    slug: 'the-library-that-eats',
    description: 'If you don\'t return a book on time, the library comes to collect it from you.',
    publishedAt: '2026-04-17T00:00:00Z',
    poem: false,
    content: `"There's this library in my neighborhood" my sister told me while we were doing dishes. "If you don't return a book on time, the library comes to collect it from you. It doesn't matter where you are. It will find you and take back what's its."

"What do you mean take back?" I asked.

"Well, if the book becomes part of you — that is, if you've read it too long, learned too much from it — then the library has to take you too. Swallows you whole."

"All the college kids go there to study. It's quiet and has good wifi and those big tables where you can spread out all your stuff. The librarian is nice, she'll help you find even comic books to borrow. Once in a while though, someone would forget to return a book. We'd be sitting there studying for finals or whatever, and suddenly the whole building would start to shake. The person would look around confused at first, then they'd remember about their overdue magazine. They'd try to run but the doors would already be closing around them. We'd watch as the library pulled them in, then we'd go back to our homework. Once in a while we'd think about them. My study partner got taken last semester, and we'd tell ourselves, well, they should have been more responsible. Can't be us. And we'd keep on chitchatting."

The next week I needed to research something for work. So I walked over to the library on Fifth Street. It was just like she described. Big wooden doors, tall windows, that musty book smell. The librarian was middle-aged with kind eyes. She helped me find what I needed. As I was leaving she handed me a small card.

"Just a reminder about our return policy" she said. "We're very strict about due dates here. But I'm sure you'll remember."

I took out three books that day. A cookbook, a biography about Jack the Ripper, and a memoir of Steve Jobs. The due date was stamped clearly: two weeks.

I put the books on my kitchen counter where I'd see them every morning. But you know how it is. Work got busy, I had that wedding of uncle Carl to go to. I flipped through them. Learned about Steve Job's eccentric work routine. Then the book gathered dust. Becoming part of the decoration.

On the fifteenth day I woke up and my apartment felt different. Smaller somehow. Like the walls had moved closer during the night. I could hear something in the distance. A sound like heavy wooden doors opening and closing. Opening and closing. Getting closer.

When I looked out my window, I could see it coming down the street. The library. Walking on what looked like roots or maybe very long, thin legs. The building moved slowly but steadily. Stepping carefully over cars, around trees. Heading straight for my apartment building.

I grabbed the books and ran outside. But it was too late. The library had already arrived. Its front doors were open. Wide like a mouth. Inside I could see all the people who'd been eaten. Sitting quietly at long tables. Reading. Forever reading. Learning. Developing. But would never be able to use what they read. They looked up at me and waved.

"Don't worry" the librarian's voice came from somewhere inside the building. "You'll like it here. We have everything you could ever want here. And you'll never have to worry about paying car loans or leases in the future."

As the doors closed around me, I thought about my sister. How she did warn me enough. But then again I told myself, well, at least I would never divorce and get 50% of the stuff taken from me. So I found an empty seat at one of the tables, opened a book, and began to read.`,
  },

  // ── 6. Frog Orchestra ────────────────────────────────────────────────────────
  {
    title: 'Frog Orchestra',
    slug: 'frog-orchestra',
    description: 'Two thin lines on a strip.',
    publishedAt: '2026-04-20T00:00:00Z',
    poem: true,
    content: `Two thin lines on a strip,

I was pregnant

I went in my bathtub and jerked off

My penis swung softly between my legs

water smashed my head from the showerhead

The sun was rolling down

For dinner, Jane and I went to this sushi place on Yonge

Jane ordered a finger, I, a jar of caviar

"Can you get me the manager please."

I said to the waitress in the grizzly bear costume

Her eyes grew weary

Raw, circular eyes

The manager zigzagged to our table

"Are these your own eggs?"

I pointed at the jar of caviar

Sometime near midnight I sat alone in the living room

Jane was asleep in her tank

The soccer game played on my wall

I vaped until I coughed violently

A transparent egg landed on my palm

Nothing will ever be the same again

My belly got bigger by the days

I switched into bigger wetsuits

I started sweating milk

Pink, salty milk dripping down my body

In Mississauga, I rang the doorbell of her cabin

I walked in the living room through a long, red hallway with videos of us hanged on the wall

An eight feet tall bullfrog sat on top of a grey refrigerator

She groaned when she saw me

She was chewing a goat ear

I told her how I felt:

I love you

I love you so much

Baby

I love you

I can't live without you

Baby, Sometimes I felt so lonely when I am all alone

Felt like I was going to die

I crawl into a ball on my bed

My spine turns blue

I just need someone to talk to

I just want to get it out of my stomach

I can't possibly do this on my own

You understand

She never called me back.

My belly continued to swell up

I stopped going in for work at all

I told Jane I was a horrible father

If I had a chance, I'd do it all over again

Razor Pete ate my salary,

I found its nails on my desk when I got back to my office

"Pete is at another branch now."

Said the man without a face

I told him:

Pete is a pathetic pathological liar,

if he could do this to me, he will do this to the company as well

I flew to Norway when my belly was big as a pillow

I unzipped my wetsuit and jumped into the swimming pool

"I don't want to see you ever again." Carl told me at the bottom of the pool

The water was so blue

I asked him what he would name his siblings

Carl said he was busy

He paddled away

Ripples

My water broke when I was in the hostel next to the big mountain that was a turtle

The 50-something hikers said I should take it easy

That I should take a breezer

I locked the door

slowly laid myself down in the bathtub

The floor smelled like detergents

Then almost immediately

The hole slid open

A river of eggs floated out of my body

Purple, transparent eggs with small tadpoles wiggling in them

Before they filled up the tub, the eggs had already started singing:

Daddy, daddy, daddy, daddy`,
  },

  // ── 7. The Boy and the Sea ────────────────────────────────────────────────────
  {
    title: 'The Boy and the Sea',
    slug: 'the-boy-and-the-sea',
    description: 'A fisherman\'s boy falls under the spell of a creature from the deep.',
    publishedAt: '2026-06-18T00:00:00Z',
    poem: false,
    type: 'novel' as const,
    content: `## 1

The first men who saw the woman thought she was silk from a merchant ship.

They saw the silk was moving against the current like a fish reflecting the morning sun. When they pulled their nets closer and the dawn light broke fully across the water, they saw it was a drowned woman, and she was more beautiful than any woman they had ever seen.

She was naked, floating face-up in the water, long black hair spread around her like ink. Her skin was pale, and her lips were red as if she had just eaten pomegranate seeds.

The fishermen, who were from the small village of Shíyú, muttered prayers to Buddha. She was heavy, heavier than any woman should be, as if her bones were made of reef. It took three men to lift her into the boat, and even then, the vessel sat lower in the water than it should have.

When they laid her on the deck, they noticed her skin was cold — cold of places where sunlight never reached.

"Throw it back in," said Old Hu, who had fished these waters for forty years. His hands were scarred from a lifetime of rope and net, and his left eye was clouded white from an infection he'd gotten two decades ago. "No good ever comes from things found free."

The youngest among them, a boy named Jang, who had been betrothed just two months ago, had already wrapped the drowned woman in his cotton jacket.

There were five of them in the boat. Ship-owner Old Hu, and his apprentices: Jang, the Hu Brothers who were always arguing about whose turn it was to mend the nets, and Tortoise, who was a simple-minded young lad that could haul nets that would break another man's back.

Jang had been promised in marriage in the spring to Miss Wang. Wang the rice merchant had four daughters and needed to settle them, and Old Hu owned two boats and a good stretch of drying racks. The betrothal had been finalized, the bride price paid.

"Even in death something can be so beautiful," said the younger Hu brother, his monkey-like face split in a grin that showed too many teeth. His usual witty composure had cracked, replaced by hunger. He couldn't stop staring, his eyes tracing the curve of her neck, the perfect symmetry of her face, the way her wet hair clung to her pale shoulders like calligraphy on silk.

"She's not dead," muttered the older Hu brother to himself, whose own wife had run off with a salt merchant three years ago, leaving him with two children and a bitterness.

Tortoise's simple face froze in astonishment. He had not been with a woman, barely seen a woman's skin before. He reached out one thick finger to touch her, then pulled back.

Jang's eyes on that carcoaled face were fixed on her face — that impossible face that seemed to shift slightly in the changing light, revealing new angles of perfection with each passing moment. Her lips were parted just slightly, and even unconscious there was something about her expression that suggested secrets, mysteries, promises of things no village woman could ever offer.

"Out of courtesy," the older Hu brother cleared his throat, forced his eyes away, "To the town?"

Old Hu didn't make a sound at first. The old man had seen everything the sea could offer — storms that swallowed boats whole, fish that glowed in the dark — stood transfixed.

He couldn't quite move his eyes away from the shocking whiteness of the woman's skin, luminous as pearl, as if emitting its own light in the grey dawn. Her other-worldly features on that youthful face held him captive — high cheekbones that could cut glass, a nose so perfectly formed, eyes that even closed seemed to contain depths no man could fathom. Not a single sign of aging, not a blemish, not even a freckle marred that pretty thing.

"Bossman?" the younger Hu brother pressed. "What you say?"

The old fisherman's weathered hand tightened on the rail of the boat. For a moment, something flickered across his scarred face. His mouth opened, then closed. His fingers drummed once against the wood.

"Aye," he said finally, his voice rough as stone.

When they brought the woman from shore to town, half the village was already waiting. News traveled fast in Shíyú — there were only sixty families, clustered in houses built from wood weathered grey by salt wind, with roofs of curved tile that had been fired in the kilns two villages over.

The houses were small and efficient, built close together for warmth in winter, with narrow spaces between them where children played and dogs scavenged. The main street, if you could call it that, was packed dirt that turned to mud when it rained, lined with the few businesses that kept the village alive: Wang's rice shop, Qian's net-repair workshop, Old Widow Zhou's medicine stall, and the teahouse run by the three Hu sisters.

The women came out first, wiping their hands on aprons, leaving behind morning rice half-cooked and laundry half-scrubbed. Old Hu's wife Auntie Hu, who had delivered every baby in the village for the past thirty years, pushed through the crowd. She was a broad woman with arms like tree trunks and a face that had seen too much to be surprised by anything.

She examined the drowned woman on the beach, touching her wrist, pulling back an eyelid, placing her ear against the woman's gut. The crowd pressed closer — housewives and grandmothers, young girls who should have been helping their mothers, the village children who were supposed to be collecting firewood but had abandoned their baskets to see what the excitement was about. Even the Lu family's grandfather, who was eighty-three and hadn't left his bed in two years, had been carried out by his grandsons so he could witness the spectacle.

"Not quite dead," Auntie Hu announced finally, straightening up with a grunt, "Not quite alive either. Her pulse is slow as winter tide. Skin's wrong too — feels like the inside of an oyster shell."

"So will she live?" asked Little Mei, the youngest of the Hu sisters, who was braver than her older siblings and had pushed to the front of the crowd.

"Water demon," said the Elder Lu, who had pushed through the crowd with his walking stick, his grandson Tu Tu supporting his other elbow. Elder Lu was the only one who could read texts. "There are such creatures in the Collected Tales of Mountains and seas. Come from the deep."

"Demon?" scoffed Wang the Rice Merchant. He wore a silk jacket even on ordinary days. His hands were soft. "Superstition. It's but a prostitute thrown overboard. Perhaps a concubine that displeased her man. It happens all the time in the big cities."

Before he could finish, Jang, just eighteen years of age, had already lifted her in his arms. She was still heavy, impossibly heavy, but he carried her.

"Taking her to the temple," Jang announced. "The Buddha saves lives."

His betrothed, Miss Wang was at the back of the crowd. Her face was pretty in an ordinary way, with the typical round cheeks and small features of merchant-class daughters.

"Dried Fish," she said, her voice carrying clearly over the crowd. "Put that thing down and come home. I need you to move the water barrels."

"Later," he said, not looking at her.

Miss Wang's face went very still.

Jang carried the woman to the temple, which sat on a small hill overlooking the harbor. It was a modest structure, but well-maintained, with fresh incense burning daily and red banners that were replaced only every New Year.

Jang laid the woman before the statue of Buddha, carved from camphor wood and painted in fading colors, which looked down at the scene with his traditional serene expression. Jang kowtowed three times, pressing his forehead to the stone floor until it hurt, and pleaded to the Buddha.

The women brought food. The men brought curiosity to see something truly beautiful for once. The children tried to sneak in to see the drowned woman, and the old monk of the temple spent most of his time shooing them away while muttering prayers under his breath.

Old Hu came in the evening after dinner and sat beside Jang.

"Need you on the boat, boy." the old man said.

"Aye."

"What you doing?" Old Hu's voice was gentle, almost paternal, but there was steel underneath.

"Taking a bet."

Old Hu let out a long breath through his nose. He shifted his weight, his old bones creaking, and looked down at the drowned woman on the floor. Her chest was rising and falling now, and even in the dim light her skin seemed to glow faintly, like phosphorescence in deep water. "Good lad, you were. Fast learner. Had the hands for it."

Old Hu placed one hand on the boy's shoulder. Those hands were scarred over from decades of sunburn and net-wielding, the skin thick as leather, the knuckles swollen with old breaks that had healed crooked. The hand was heavy.

"I was your age," His good eye grew distant, looking at something only he could see. "I didn't read, but the other boys told me, out there in the Eastern sea, lies an island of folks with bearded faces who like to eat fishes raw. There, a capital on the sea, a capital like Hangzhou, but even bigger. There, the Emperor's tongue was still used. There, men from the continent — men like me — could still make an honest, good living."

He paused, hand trembling slightly on Jang's shoulder, whether from age or emotion the boy couldn't tell. "I wanted to sail... never come back. I went down to the docks every morning to look at the ships."

"Days turn into weeks, weeks turn into years. There was always something. My father got sick, needed me on the boat. Then he died, and the boat was mine, and then the debts were mine. Then came a girl — your age. I was, maybe younger — and she looked at me like I was worth something. Then came the wedding, kids, more mouths, thus more fishing."

The boy looked up at the old man.

Old Hu was like a father to him. His own dad disappeared on a stormy night along with his small fishing boat on the open sea.

Jang had been six when it happened. Old Hu found the boy on the beach the next morning, staring at the empty horizon. The old man had said nothing, just sat beside him until the sun went down. Then he took the boy home, taught him things, raised him up in the trade.

"I never sailed," Old Hu said. "So I don't know. Maybe you'll."

## 2

On the second day, the boy's betrothed came.

Miss Wang was carrying a bundle — clothes, shoes. She set it down beside him.

"I'm going back," she said quietly, "to daddy."

Jang looked up at her: "Once she wakes, I'll come back."

Then they embraced. Next to him, she felt like a little girl, though she was only a year younger than him.

The boy held his betrothed tightly, and for a moment he buried his face in her hair. It smelled like the rice shop — like grain and wood smoke and the jasmine oil her mother made her wear on special occasions.

Miss Wang's hands came up to rest against his back, and he could feel the calluses on her palms. Her fingers found the familiar spot between his shoulder blades where he always got tense after a long day on the boat, and she pressed there gently, the way she'd done many times. It was a small gesture. It spoke of something.

"Eat," she said softly. "You're thin."

"Always thin," he said.

"Thinner than usual, then. Dried Fish is getting drier."

Old joke between them, stupid joke.

They pulled apart slightly, and Miss Wang reached up to brush something from his cheek. Her hand lingered there for a moment. She had nice hands, he'd always thought. Capable hands. Hands that could make fish soup and fried shrimp and blood clam with soy sauce. Hands that would have touched him every day for the rest of their lives, in a thousand small, unremarkable ways.

"Brought you something," Miss Wang reached into her sleeve. She pulled out a small bundle wrapped in cloth. Inside was a rice ball, still warm, wrapped around a piece of salted eel.

She unwrapped it and held it up to his mouth, and without thinking, Jang took a bite. It was just as he remembered it.

"I was thinking," she said, still holding the rice ball, feeding him another bite when he'd swallowed the first, "about the house. The one you were building for us. I went by yesterday. The frame is good. Strong. You did good work on it."

She paused, then continued more quietly. "I was going to plant jasmine outside the door. My mother said it brings good fortune to a marriage. The vines would grow up the posts, and in summer, the whole house would smell sweet."

Jang was quiet.

"And I was thinking we could ask Widow Zhou about her chickens. She has too many, and she said she'd give us six hens and a rooster for some rice. We could build a coop in the back. Fresh eggs in the mornings."

After he finished eating, she left.

He stayed still.

## 3

On the third morning, the drowned woman sat up.

Her black hair cascading down her back like a waterfall of ink.

The first thing she did was to look at the boy for a long while. And in that look, something reached inside him and touched places he'd never known existed.

"Wow," she said, not quite the proper tone of the city, but the tone common among the fishermen of these shores.

"Your name?" he asked.

She paused, tilting her head slightly. It was as if she was remembering something from very long ago. "Hai Yue. Moon of the Sea."

When her gaze met his again, one corner of her mouth quirked up in amusement.

"Which ship did you fall from? During a storm?" Jang asked. His hand had somehow found hers. Her hand was smaller than his, delicate, but the skin had that strange texture — smooth, cool, slippery.

"I did not fall. I came on purpose. It was time."

"Time?"

She didn't say anything, allowing the boy's hand to be there.

"Where are you from?" The boy added.

"Down there," she said. Her voice dropped lower, more intimate. "A village there, just like yours, but built from the ribs of whales and roofed with turtle shells. The walls are lined with pearls, and the gardens are kelp forests where fish fly like birds."

As she spoke, Jang imagined it.

She moved closer still, until her forehead rested against his, until they were breathing the same air.

He hadn't had a woman. He felt like he was drowning, in a way.

"They are going to kill you." The boy lied.

"Kill?" The girl asked.

"Right. You are not of this world."

"What do you reckon that we do, boy?"

"We have to go before the others know you are awake."

"But just who would we be running away from?" She asked.

But the boy did not say.

They fled through the village, the boy and the drowned woman, as people were just beginning to wake, past the half-finished house he was building for his wedding, past the boats and drying racks that smelled of fish and salt and his entire childhood.

They sneaked past Merchant Wang's shop, where smoke was just beginning to rise from the cooking fire, where Miss Wang was helping her mother prepare eggs.

They ran until they reached the forest path that led into the mountains.

The boy knew these trails — he and his childhood friends had explored every inch of this coast, finding secret coves and hidden beaches, places where adults never went.

There was one place in particular, a small valley where a freshwater stream tumbled down from the mountains to meet the sea, creating a sheltered cove surrounded by steep cliffs.

It took them a day to reach it, walking through dense forest, climbing over rocks, following half-remembered paths. Hai Yue moved with grace over the rough terrain, never complaining. She looked at the boy with a look of admiration. Or so it was what appeared to him.

When they finally reached the valley, Jang felt a surge of triumph.

It was exactly as he remembered — a small crescent of sandy beach, a clear stream, trees heavy with fruit, and the constant music of waves. The cliffs on three sides meant no one could approach except by sea or by the difficult mountain path they had just traveled.

"Home." he said.

Hai Yue stepped forward onto the sand, her bare feet leaving shallow impressions that the waves immediately began to erase.

She looked around slowly with the curiosity of a little girl, taking in the crescent beach, the waterfall tumbling down the cliff, the dense forest climbing the mountainside, the three surrounding cliffs that made the cove feel like a cupped hand.

Her mouth softened, and she breathed in deeply, tasting the air — salt and pine and the mineral-rich stream mixed with seawater.

Jang, too, felt something expand in his chest, a warmth that had nothing to do with the sun.

"We can be happy here," Jang exclaimed. "Help me find good bamboo for the frame. I will build us a palace."

Hai Yue laughed, a sound of waves hitting on rocks.

## 4

Jang threw himself into building their home with a drive he had never felt.

He cut bamboo from the thick groves that grew along the stream, selecting each stalk with care — not too young and green, not too old and brittle, aged to that perfect golden color. He cut young trees from the forest edge, saplings with straight trunks that he could strip and shape into support beams. With vines and split bamboo, he wove them into walls.

It took him days just to finish the walls, bit by bit, working until his hands were raw, until his shoulders ached so badly he could barely lift his arms.

But he didn't stop, didn't rest.

At night, they would lie together on the pile of dry grass, and Hai Yue would listen as Jang talked. His disappointments, past, dreams, feelings. She listened like a little girl curious and fascinated by any words he muttered.

Two weeks passed. The boy planted a garden in the rich black soil near the stream, virgin earth that yielded sweet potatoes and bok choy and long beans.

He had learned this from Auntie Hu. He built bamboo irrigation channels, splitting the hollow stalks lengthwise and fitting them together, creating a network of waterways that sang with the constant music of flowing water, carrying the stream's bounty to every corner of his garden.

He would sometimes walk along them in the early morning, watching the water catch the sunlight, feeling the pride of a man who had shaped the land to his will.

He fashioned fishing nets and caught fish from the cove. The place began to look like a real homestead, prosperous and self-sufficient.

He built a storage shed for dried fish and vegetables, constructed a proper cooking area with a stone hearth and a chimney that drew the smoke up and away instead of filling the hut. He made furniture, even carved a washing basin from a fallen log, hollowing it out over the course of a week until it was smooth and watertight, perfect for holding fresh water from the stream.

In the evenings, he would sit on the beach and play music on a flute he'd carved from bamboo, or release simple melodies by blowing across seashells of different sizes. Hai Yue would dance for him on these evenings, and it was the most beautiful thing Jang had ever seen.

She moved as if she had no bones, as if her body were made of water that could take any shape it pleased. Her arms flowed like seaweed in a current, her legs bent and turned in curious ways.

She wore only that simple wrap of cloth around her body. And she never danced to the music exactly — rather, she danced around it, through it, as if she and the music were having a conversation, as if his flute was asking questions and her body was answering them.

Sometimes she would move fast, spinning and leaping with a joy that seemed almost childlike. Other times, she would move so slowly it was hypnotic, each gesture taking long seconds to complete, her arms rising through the air like kelp rising through water, and Jang would forget to breathe, forget to play, just watching her with his mouth open and hands frozen on the flute.

One evening, after he'd stopped playing, Hai Yue walked over to him with an expression he'd rarely seen on her face, extending a hand to him.

"I don't know how..." He said.

She pulled him to his feet before he could continue.

"Don't think. Do."

She began to sway, and Jang tried to follow. Clumsily, his feet tangled.

She began to hum — a melody he'd never heard before, wordless and haunting, rising and falling like the tide itself. And as she hummed, she guided him through movements like a conversation between their bodies.

When he started to stiffen up again, overthinking, she would squeeze his hand gently. When he found the rhythm, she would spin slightly, adding complexity without breaking the flow.

They danced until Jang forgot to be self-conscious.

The moon rose higher, painting everything in silver. As they walked back to the hut, Jang felt a warmth in his chest that had nothing to do with exertion.

Other evenings, when the tide was right and the moon was bright, they would swim together naked. Hai Yue would lead him out past the breakers, into the calmer water where the moonlight turned everything silver and black.

Sometimes she would duck under the surface and disappear, only to pop up behind him and splash water in his face, laughing at his startled face.

Or she would float on her back, her hair spreading around her like black silk on the water, and point out constellations, telling him their names in her language — words that sounded like waves and wind and things he had no reference for.

They would race from one end of the cove to the other. And she always won, but she would circle back to swim beside him, matching his pace, encouraging him when he got tired.

Once, she taught him to float without moving, to just trust the salt water to hold him up, and they lay there side by side, bobbing gently with the swells, looking up at the stars in silence.

"The ocean is kind tonight," she said, her voice soft, "they'd be missing you in the village."

When his arms grew tired and he had to head back to shore, she would follow. They would walk out of the water together, dripping and laughing, and collapse on the warm sand, letting the night air dry their skin while they caught their breath.

And lying beside her on the sand, their bodies touching, the sea breeze cooling their skin, Jang felt a contentment he hadn't known was possible.

"What are you thinking?" he asked softly.

The moon was high, casting their intertwined shadows on the beach.

Hai Yue was quiet for a long moment, staring up at the stars. When she spoke, her voice was different — smaller, more vulnerable than he'd ever heard it. "About stopping."

He didn't know what she meant.

She buried her face in his neck, and he felt wetness on his skin.

"Promise me," she whispered. "Promise me that when things get hard, when we change, you won't…"

He held her tight.

She was his first. Her body was soft, her skin slippery like a fish. Her body bending and flowing, wrapping around him like water.

Afterward, he would lie in her arms, his head resting on her chest, feeling her heartbeat, steady as waves.

He would feel whole, as if all the missing pieces had suddenly clicked into place.

"Tell me… your home," he would murmur against her skin. "The village beneath the sea."

Hai Yue would be silent for a long moment, her fingers running through his hair in slow, soothing strokes.

She was never quick to speak, never rushed to fill silence.

"Cold." she said finally, her voice barely above a whisper.

"Got a family?"

Her voice shook: "Nothing lasts."

He just held her, and she held him.

They lay together in the hut they built, listening to the waves and mosquitoes and the night birds and the sound of each other breathing.

## 5

He would wake every morning with her beside him.

They'd rise with the dawn. Jang checked the nets and tended the irrigation channels. Hai Yue started the fire, cooked rice.

In the garden, they worked side by side — him pulling weeds, her harvesting. She had a sense for growing things.

Midday, she'd mend clothes and weave nets while he worked on the boat.

Afternoons, he'd cut bamboo or haul water while she smoked fish over the fire. Sometimes she'd make soup in the pot — chopping ginger and wild herbs with careful precision, adding dried fish and whatever vegetables they'd gathered, stirring slowly while the broth simmered and filled the hut with steam and fragrance.

She learned fast — how to gut fish without wasting meat, how to predict rain by watching the birds, how long to boil bones to extract every bit of flavor for the broth.

They took turns cooking.

After dinner, he'd carve tools while she wove baskets from beach grass.

Before sleep, they'd walk the perimeter together.

"We built something today," he'd say.

Three weeks into their idyllic existence, on a night when the moon was full and huge, hanging over the ocean like a silver plate, Jang woke to a sound.

At first he thought it was the waves. But something about the rhythm was wrong, too regular, too deliberate, like a heartbeat.

Then he heard it again. A rhythmic pounding. Something striking the door of their hut, three slow beats, then silence, then three more beats, like something asking permission to enter.

Jang sat up, his skin prickling with a cold that had nothing to do with the night air.

Even the insects had stopped their chirping. The entire valley seemed to be holding its breath, waiting.

Beside him, Hai Yue was awake too, her eyes reflecting the moonlight streaming through the cracks in the bamboo walls, but there was something different in her expression — a kind of alertness, like an animal that has caught a familiar scent on the wind.

She sat up, her head tilted slightly to one side, listening to something Jang couldn't hear, some frequency that existed below or above perception.

He sat up: "You heard?"

She nodded.

The pounding came again, harder. The door shook on its bamboo hinges.

Jang grabbed the chopping knife from the table and moved toward the door. "Anyone there?" he called out, deepening his voice.

The only response was a strange noise, like a fish moving its cheeks.

Jang looked back at Hai Yue.

He opened the door.

The creature standing in the moonlight was eight feet tall.

It stood hunched and twisted. It had the basic shape of a man — two legs, two arms, a torso, a head — but that's where the resemblance ended.

Its body was covered in grey-green scales, each one the size of Jang's palm, studded with barnacles that had grown in clusters across its shoulders and chest, some of them still alive and opening their tiny mouths to filter the air as if searching for water.

Long strands of kelp trailed from its head and arms, dark brown and glistening with slime, moving slightly in the night breeze as if the creature carried its own small ocean with it.

Its head was elongated, the skull stretched backward into an unnatural shape, more fish than man, with a mouth that split its face nearly to where human ears would be. When it opened that mouth, Jang could see rows of human teeth, layer upon layer of them like a shark's. Its hands were webbed between every finger.

The creature's chest rose and fell with labored breathing. Its eyes — those were the worst part — its eyes were that of humans.

It opened its mouth, but nothing came out, resonating in a frequency that Jang did not hear.

Jang didn't think. Instinct took over. He lunged forward with the kitchen knife and drove it into the creature's chest, right where a human's heart would be.

The blade sank deep, meeting resistance from the thick, scaled hide before punching through. Hot liquid, not quite blood, spurted over his hand.

The creature staggered back, black blood pouring from the wound. It reached for Jang with its claws.

Before it died, the fishman looked confused. As if it couldn't comprehend what just happened and why he did this.

Jang pulled the knife out — it came with a wet sucking sound — and stabbed again, this time higher, near where the throat met the chest. And again, lower, feeling for organs he couldn't see.

He had done this before. Fishermen gut fishes.

The creature made sounds, syllables that might have been speech if its throat had been shaped differently.

It tried to back away from him, stumbling, and Jang continued. Finally, the creature collapsed in the sand outside his hut.

The smell was overwhelming — fish and rot, like fruit left too long in the sun.

Jang stood there, gasping, covered in the creature's filth. His hands were shaking so badly he could barely hold the knife.

The fisherman had killed thousands of fish. This was different.

He looked down at the body, really looked at it for the first time. In death, it seemed smaller, more pathetic.

The barnacles that had made it seem so monstrous were just barnacles. Things that grew on rocks and ship hulls.

Hai Yue came out the hut and looked at the body.

She paused for a long moment, then sighed, turned to Jang. In an almost hopeless tone: "The sea..."

She started shaking: "want me back."

Jang felt cold dread settle in his stomach.

From the back, he held her tight. Trying to remain in composure: "No one will take you from me."

He said with the voice of a man.

When they went back inside, Hai Yue washed away the fish blood from his skin in silence.

Before the sun, Jang dragged the fish-man's body down the hill and put it back into the sea.

He looked long and hard at the sea. There was no bird at sunrise. No waves.

It was at this moment, standing in the pre-dawn darkness with dried blood on his hands, that Jang understood something fundamental had shifted. Things would never be the same again.

## 6

The next full moon, Jang woke in the depths of night.

The sound came from the eastern wall, where Jang had left a gap between the bamboo slats for ventilation — sea breezes through during hot afternoons, cooling their home.

First came a single tentacle through the gap. It moved with horrible intelligence.

Then came another tentacle, squeezing through the gap like water finding its way through stone.

Through the gaps in the wall, he could see the creature's body — a massive, bulbous sack of flesh covered in pink-colored skin. And beneath that grotesque ball of a body were two human legs, pale and muscular with leg hair.

The creature was trying to force its entire body through the wall, more tentacles were coming through now — six, eight, ten.

Jang slashed at the nearest tentacle with the knife he always kept close, and the blade bit deep, releasing a spray of black ichor.

The tentacle recoiled but didn't release him, and two more wrapped around his chest, beginning to squeeze. He could hear his ribs creaking, feel something starting to give way.

He slashed again and again. His vision began to tunnel, and finally one of the tentacles around his neck loosened enough for him to draw a desperate breath.

The fight lasted perhaps five minutes, though it felt like hours.

The creature's bulbous body was wedged in the opening, too large to fit through but too committed to retreat, and Jang saw his opportunity. He drove the knife deep into the soft flesh of the body itself, right where the tentacles connected to the central mass, and twisted.

The creature made a high-pitched curse, almost like a human sentence. The creature's body began to deflate like a bladder losing air and the human legs twitched once, twice, then went still.

Jang gathered what remained of the creature and carried them down to the water.

He turned and saw Hai Yue standing on the beach. She was wearing the simple robe he had sewn for her from a sailcloth.

"You're hurt," she said when he reached the shore.

"I'll live," Jang said, touching his throat where the suckers had left circular bruises, like a necklace of purple coins.

They spent the next day repairing the wall, making the bamboo walls thicker, stronger.

They were building a fortress now.

## 7

Two weeks later, a storm rolled in from the east.

Jang had been checking his fishing nets on the beach when the first drops hit. They were huge, warm drops that exploded on impact, and within seconds the sky opened up completely. The rain came down so hard it felt like being beaten, and the wind picked up with terrifying speed, bending the trees nearly horizontal.

On the sea, a small fishing boat, spinning in the massive waves like a toy. And clinging to the hull, barely visible through the sheets of rain and sea spray, was a small figure. A child.

Jang knew that boat. He'd seen it a hundred times in the village harbor.

Jang ran into the water, diving under the first massive breaker. The ocean was chaos, pulling him in a dozen directions at once. He surfaced, gasping, and swam hard toward the distant figure.

The waves were the kind that could break boats. He could see the boy more clearly now — a small boy with a round face and terrified eyes. His name was Tu Tu, the grandson of Elder Lu. Each time Jang thought he was making progress, a wave would push him sideways or back.

A wave crashed over his head, driving Jang deep under the water. Then everything went dark.

When consciousness returned, Jang realized something was pulling him through the water with incredible force.

He caught a glimpse of Hai Yue beside him. She got Tu Tu. Got the boy's thin arm just as he was going under. She got them to the beach. Through the rain and his blurred vision, he could see Hai Yue kneeling over Tu Tu's small body, and the boy wasn't moving. He was completely still, his skin a terrible grey-blue color, his eyes rolled back, his mouth slack.

"No," Jang gasped, crawling over on his hands and knees. "No, no, no —"

They rolled Tu Tu onto his side, and Hai Yue struck him hard between the shoulder blades — once, twice, three times. Water dribbled from the boy's mouth.

Together, they turned Tu Tu onto his back. Jang placed his hands on the small chest — so small, the ribs fragile as bird bones under his palms — and pressed. Counted.

The rain kept falling. The storm kept raging.

Water came up. Suddenly, violently, Tu Tu convulsed and vomited seawater all over himself, coughing and choking and gasping. His eyes flew open.

Then the boy started crying.

"You're safe," Hai Yue said immediately, gathering him into her arms. "You're safe now. You're safe."

They brought Tu Tu to the hut. Hai Yue built up the fire immediately, stripping off Tu Tu's soaked clothes with the efficient tenderness of a mother, wrapping him in their warmest blanket.

The storm lasted three days. The rain came in waves, sometimes lessening to a drizzle before returning with renewed fury.

Hai Yue cooked for Tu Tu. She made congee, slow-cooked, perfect for his raw throat. She caught crabs and made soup. She even made little rice balls with pickled vegetables inside, shaping them with her hands, making them small enough for a child's mouth. She worked over the fire like she'd been cooking her whole life. She cleaned his cuts. She checked them every morning and night, watching for infection, changing the bandages.

Tu Tu would wake screaming, thrashing in the blankets in fever and delirium, and Hai Yue would gather him up, rock him like a baby, sing songs in that strange language of hers. She would hold him for hours until he fell back asleep. She told him stories during the day when he was restless and frightened of the storm outside. Stories about islands far in the eastern seas.

One afternoon, when Tu Tu was napping, Jang found Hai Yue sitting by the fire, her hand resting on her barely-visible belly, staring at nothing.

"You're good with him," Jang said softly.

She smiled without looking at him.

"You'll be a good mother," Jang said. "To our kid."

"A mother's love..." Hai Yue's voice was thick with emotion. "It's different from any other love." she paused, "His mother needs to know he's alive."

Jang reached the village just after midnight. He and Tu Tu made their way to the Lu family's house — a small one near the harbor with a fishing boat pulled up in the yard.

Every light in the house was burning. Through the windows, Jang could see figures moving inside — people were awake, waiting. The whole family gathered, probably, waiting.

"Go," he said quietly.

But Tu Tu didn't move. He stood there in the dark street, looking between Jang and the lit windows of his home.

"I don't want to go back," Tu Tu said suddenly. "Can I stay with you? With you and auntie."

"You're kind people," the boy continued, "My parents... they're always working, always worried about food, always tired. They don't... I wish they were like you. Warm like you. Free like you. I wish I could stay and be part of..."

Jang crouched down to Tu Tu's level, put his hands on the boy's shoulders.

"Can I come to see you?"

"One day," Jang said. "We are going to leave this place with our kid. Sail east, to places where anything is possible."

Tu Tu pulled back, his eyes wide. "Really?"

"When that day comes, we're gonna need a good hand on deck."

Tu Tu went inside. Jang stepped back into the shadows just as the door opened and a woman's silhouette appeared against the light. There was a moment of stillness, and then she held him tight.

Jang walked through the village instead of going straight back. It was past midnight. The streets were empty.

Old Hu's house was dark. In the yard were the nets, half-repaired. Tomorrow they would be finished. The next day there would be more nets.

The teahouse was closed. Through the window he could see the tables, clean and waiting.

Wang's shop looked prosperous. New paint. The steps repaired.

At the edge of the village was the house Jang had started. Someone had finished the frame. The roof was mostly done. The walls were going up. He touched the doorframe. Some of the bamboo was his. The rest belonged to another man.

## 8

Jang began building a boat.

Not a fishing boat but something that could cross open water. Something for four people — Hai Yue, himself, their child, and Tu Tu. He sketched in the sand with a stick, calculated dimensions, imagined the hull cutting through waves.

He salvaged wood from the forest. Strong hardwoods that would resist rot. Lighter pines for the upper structure. He tested each piece for strength.

He expanded the hut for the baby. He tore down one wall and rebuilt it three feet out. A small room for the nursery. He lined the walls with soft grass woven tight. He built a cradle from driftwood and palm fronds. It took five days to get the balance right so it would rock without tipping. He sanded every surface smooth.

Hai Yue's belly grew large. In the evenings he would place his hand on it. He felt movements inside.

"I'll teach you to fish," he said. "I'll show you how to read the water. How to cast a net. The secret paths in the mountains. Where the fruit grows. Where the springs are. We'll play music on the beach. You'll grow up free. You can become anything. The world is yours."

Sometimes Hai Yue would watch him talk to her belly. She would say nothing. Her hand would rest on top of his.

Every full moon a creature came from the sea.

Sometimes they walked upright on two legs like men. Sometimes they were more fish than man, with elongated bodies that moved serpentine through the shallows. Some were huge and slow, lumbering from the water like moving hills, their skin thick as leather, like whales. It took many stab wounds to bring them down. Others were smaller but faster, darting and weaving with intelligence that was almost human. These made him think. Made him adapt.

He killed them all.

Month after month, as the full moon rose and the tide came in high and heavy, something would emerge from the depths.

He developed tactics, turning their home into a fortress and a trap. He planted sharpened bamboo stakes in the sand around the hut, angled upward at forty-five degrees. He kept oil burning in clay lamps near the entrance, ready to be thrown and create walls of fire. He built a second exit in the back of the hut, hidden behind a woven mat, so that if something came through the front door he could circle around.

He made weapons — not just the kitchen knife, but spears from bamboo, a club studded with sharp shells, even a crude bow and arrows, though he was a terrible shot and abandoned that approach after the third creature dodged his arrows with ease.

His body grew harder, no longer skinny, more muscled from the constant fighting and the hard work of maintaining their homestead. His arms developed the kind of strength that came from survival, from splitting bamboo and hauling nets and driving a knife through scales.

His hands were perpetually scarred, the palms thick with calluses, the knuckles often split and bleeding from punching scales and barnacled skin. His chest and back were a map of near-misses — white scars from claws that had almost gutted him, puckered marks from teeth that had almost found his throat, burn marks from the acidic blood of a creature that had been part jellyfish.

He moved differently now. Always alert. Always ready. Even during the day when he worked in the garden or repaired the hut, part of his attention stayed on the ocean, watching for the disturbance in the water that meant something was coming. He slept lightly. The smallest sound woke him and his hand would reach for the knife before his mind registered what he'd heard.

Hai Yue would run her fingers along the new scars sometimes, tracing the lines of muscle that had not been there when they first arrived.

"You're becoming something else," she said.

## 9

Five months into their life together, Jang went to wash his face in the stream and caught sight of his reflection in a still pool.

The face that stared back at him was not his own. Or rather, it was his face, but changed. He stood there for a long time, staring at the stranger wearing his face.

That afternoon, while Hai Yue slept in the hut, her body curled in that boneless way she had, Jang walked away.

He took the fast pathway through the mountains that he and the Hu brothers had found as boys. It cut the journey from a full day to three hours.

He reached the ridge as the sun descended. He stood hidden among the rocks and pines and watched the village.

The fishing boats were returning. Seven of them in a line perfected over generations. The nets came up heavy. The men's voices carried on the wind, talking about the catch, about whose net had the biggest fish, about whether Old Hu could really predict the tides by the ache in his left knee.

Old Hu was there. Unmistakable by the way he moved. He was teaching Tortoise something, his hands shaping the air the way they always did. Tortoise listened with absolute attention. Jang felt something that might have been jealousy. Tortoise was learning the things Old Hu would have taught him.

The Hu brothers were arguing. Their voices rose in mock anger over something trivial. But there was rhythm to it. Comfort. Two men who had spent every day of their lives together.

On the beach children were playing the same games Jang had played. Racing along the waterline. Jumping the incoming waves. Building cities in the sand that the tide would destroy. Tu Tu's sister was trying to catch crabs with her bare hands. Her grandmother sat nearby watching.

The village square was alive with the evening market. Piles of vegetables. Bok choy and long beans and bitter melon. The fat white radishes that Wang's wife made into pickles. Baskets of eggs and dried mushrooms. The tea seller with his portable stove. The Hu sisters served customers at their teahouse with efficient grace. Moving between tables like dancers. Never forgetting who ordered what. Little Mei was serving young men from the port. On her finger was a new ring that caught the golden hour light. When she laughed it was not the laugh of a girl, it was now that of a woman.

Wang the Rice Merchant was in front of his shop as he always was at this hour. Watching the market. Fresh paint on the sign. The quality of the rice displayed in neat pyramids. Wang's wife was beside him counting coins with the quick fingers of a woman who knew the value of every copper. Their nephew was sweeping the front of the shop with a bored expression.

And then Jang saw her. Miss Wang. She emerged from the door above the rice shop.

She was thinner than he remembered. The softness was gone. Replaced by the lean strength of a woman who worked. Her hair was pulled back in a simple style. No ornamentation. But she was smiling. Smiling as she talked to her father. Smiling as she adjusted her market basket. Smiling as Elder Shen's wife stopped her to ask about something.

And Miss Wang's response was easy to read even from this distance. A shake of the head. A shrug. Jang's absence was just a fact now. Like the weather, the tides.

Jang watched as she moved through the market. Stopping to examine vegetables. To chat with the Hu sisters. To help an elderly woman carry a basket of fish.

The village went about its evening rituals with the precision of a well-rehearsed play. The old monk was sweeping the temple steps with methodical attention. Creating small clouds of dust that caught the golden light and floated for a moment before settling back to earth.

Elder Lu sat outside his house. Smoking his long pipe and watching the world go by with detachment. Tu Tu was practicing calligraphy at a table beside him. His tongue poking out in concentration as he tried to make the characters match the model his grandfather had given him.

Smoke rose from cooking fires all across the village. Jang could smell it even from this distance. The rice steaming. The fish frying in oil with ginger and scallions. The vegetables being stir-fried in well-seasoned woks. Someone was making soup. He could smell the richness of pork bones that had simmered all afternoon.

The sounds of the village reached him in waves. Children's laughter and dogs barking and the steady thump-thump-thump of someone pounding laundry on rocks by the stream. The rhythmic scrape of tools being sharpened for tomorrow's work. And underneath it all the ever-present sound of the sea. Breathing in and out. In and out.

Someone was singing. A woman's voice high and clear. One of the old work songs about mending nets or planting rice. One of those songs that had been sung for so many generations that no one remembered who had first started it.

It was all so ordinary. So beautifully achingly ordinary. And now watching it from outside Jang saw it for what it truly was. A tapestry. Each thread connected to every other thread. Each person part of a whole that was larger, older and more enduring than the individual.

The sun was getting lower now. The village was preparing for night. Vendors packing up their unsold goods. Children being called home for dinner. The boats being secured. Lanterns were being lit. Casting pools of warm light that would guide people home. The whole village was settling into itself. Tucking itself in for the night.

Jang turned away. Every moment made the pain sharper.

He ran back up the mountain path. Stumbling over roots and rocks. He made it back to the valley as the first stars appeared. Hai Yue was awake. Sitting by the fire. She looked up. Her eyes reflecting the flames.

"Where'd you go?" she asked. Her voice casual.

"Fishing," Jang lied. "In the deep waters past the point."

"Did you catch something?"

"Nothing worth keeping." He said.

That night after Hai Yue fell asleep, Jang lay awake staring at the ceiling he had built.

The knife was within reach. He had kept it sharp. It would be easy to drive it into her throat while she slept.

He thought about becoming an apprentice somewhere far away. In a city where no one knew him. Learning an honest trade. Building a small life. In a way, he had known all along about her, about what they were, about what this was. Deep in his mind, he'd got all the answers he already needed.

He reached for the knife. His fingers closing around the handle.

But all he could do was lie awake in the darkness.

The knife stayed in his hand until dawn. When Hai Yue stirred beside him he quickly put it away.

## 10

They sat on the beach watching the tide come in.

"After the baby," Jang said, glancing at her enormous belly, then back to the horizon. "We leave."

Hai Yue turned to him: "Where?"

"Tell me about those islands again."

"East, across the great ocean lies an island, many weeks sailing. They have built great cities of wood and paper, temples with curved roofs that point to the sky. The warriors there carry swords sharp enough to cut through bamboo stocks. They write in characters of the Continent too, yet speak it a different way. And in their city stood a mountain that breathes fire and snow at once." She said. "People of the rising sun, they call themselves. The water around their islands are rich, with so many fish it never runs out."

Jang could picture it — the four of them arriving at those shores. "And beyond that?"

"Further still," Hai Yue continued, "There are islands scattered across the ocean like stars across the sky. Some have people with dark skin and flowers in their hair, who build boats that can travel for months without touching land. They navigate by the stars and the waves, reading the ocean like your people read books. They have no winter, only endless summer, and the water is so warm and clear you can see fish swimming fifty feet below."

"Ha." Jang said softly.

"Something yet beyond that, something few from the old world have seen. Another continent, vast and strange. The people there have red skin and black hair. Cities of stone in mountains that touch the clouds. They have gold. So much gold they use it for decoration, for dishes, for ornaments. They would trade a cup of gold for a cup of grain and think nothing of it."

She leaned closer, her voice dropping to a whisper as if sharing a great secret. "And if we travel far enough across that new continent, there is a narrow land — a strip of earth so thin you can walk from one ocean to another in just days. The people there say it's cursed, filled with jungle so thick the sun never reaches the ground, filled with jungle beasts and sickness. But on the other side..." Her eyes gleamed. "On the other side is another sea, a sea so large the land was tiny in comparison. Land where people have hair the color of straw or copper or even fire itself. And they smell. They smell of sourness, old meat and sweat, for they don't bathe. They think water is dangerous, that it opens the pores to disease, so they wear the same clothes for months until the fabric is stiff."

Jang made a face.

Hai Yue continued, warming to her description. "Don't let their strangeness fool you. Their kings and queens rule vast empires, commanding armies of men hiding in metal shells who ride great horses bred for war."

Her voice grew more animated. "Their women paint their faces white as death and bind their bodies in tight cloth until they can barely breathe. Their men kneeling before the women to pledge devotion, warriors fighting each other to death for their favors."

"Madness," Jang said, smiling.

"It is mad. All the world is mad, once we leave to see it." She leaned her forehead against his. "And our child would grow up knowing no bounds. Our child would speak ten languages, taste food from a hundred kingdoms, swim in every ocean. Wouldn't that be something?"

The vision seized him. They made love there on the beach as the sun set, her belly huge between them, the child moving inside her. Her hot skin against his warm flesh, the sound of waves, the boat parked in its home harbour.

Afterward, they lay together on the sand, and Hai Yue spoke of more wonders: cities built on water, mountains that touched the sky, creatures he'd never imagined.

## 11

The things that came from the sea grew stronger and stranger.

At six months, a massive thing emerged that had the body of a mantis shrimp — armored plates overlapping like roof tiles — the size of a large horse, with two enormous club-like appendages where its arms should have been. The creature moved with the clubs cocked and ready to strike with the force that could split open rocks.

Jang had caught mantis shrimp before with Old Hu. So when the creature lunged at him, Jang watched for the telltale coiling of its segmented body and threw himself sideways. The clubs cratered the sand where he'd been standing, the shockwave rattling through his feet.

The creature was committed now, its clubs buried in sand, taking a moment to reset its spring-loaded appendages. Jang came around behind it — where its armor had gaps for movement — and drove his spear between the plates. Red blood sprayed.

Jang stayed in its blind spot, stabbing into the gaps between armor. It was like fighting a puzzle. Finally, the creature collapsed.

At seven months, they came in the grey light before dawn — not one or two creatures, but hundreds of them, emerging from the surf in a mass that made the beach look like it was alive and moving.

Blood clams. Jang recognized them instantly, the same species fishermen harvested for food, with their dark red flesh and ridged shells. But these were wrong. They were too large, each one the size of both his fists together, and they moved with purpose that shellfish shouldn't possess, propelling themselves across the sand with horrifying speed.

They came in a wave, hundreds of them, their shells clicking together like teeth chattering, leaving trails of red fluid in the sand that looked like blood. Jang had only under a minute to grab his spear before they reached him.

The first ones attached to his ankles. He felt the shells clamp down, their ridged edges biting through his skin, and then came the pain — sharp as they began to feed. He kicked frantically, smashing several with his spear, but for every one he destroyed, three more took its place.

They swarmed up his legs, dozens of them, their shells opening just enough to extend their soft bodies, latching onto his flesh with strength. Each one that attached began to chew, to rasp away at his skin with tongues covered in tiny teeth.

Jang screamed and fell to his knees, trying to tear them off, but their grip was incredible. His fingers bled as he pried at their shells, and the moment he removed one, another would attach. They were climbing higher now, covering his thighs, reaching for his torso, each one a small mouth chewing, chewing, chewing.

The pain was beyond anything he'd experienced. A thousand small agonies spread across his body, each clam taking its tiny piece of him. He could feel his blood running down his legs, mixing with the red fluid the clams secreted.

He crushed them with his hands, smashed them with rocks, stabbed them with his spear, but there were too many. They were pulling him down with their collective weight, and he couldn't get up, couldn't stand. His vision was starting to blur from blood loss.

More clams reached his chest, his arms, his neck. One attached to his shoulder and he felt it begin its terrible work, scraping away skin, muscle, going deeper. He was going to die.

Then she arrived. She had the cooking pot in her hands and she threw it across the mass of clams on Jang's lower body.

The clams shrieked and released their grip. Hai Yue grabbed more pots, more boiling water, and poured it systematically over Jang's body, cooking the clams alive, making them release him one by one.

She worked with terrible efficiency, tearing the remaining clams off him with her bare hands, not caring as the shells cut her palms, crushing them against rocks, throwing them back toward the ocean.

Back in the hut, Jang collapsed. His entire body was covered in circular wounds where the clams had been.

He was not going to make it this time.

For three days, he had fever. Hai Yue brought him water and made him drink. She changed his bandages twice a day. The wounds on his legs were the worst. Red and swollen. She cleaned them with seawater that made him cry out.

On the fourth day the fever broke. He could sit up. She fed him broth she'd made from fish bones.

By the second week he could stand. She helped him walk to the stream and back. His legs shook. The circular wounds were healing slowly.

"You need to move," she said. "Or the muscles stiffen."

She was right. Each day he walked a little farther. First just to the stream. Then to the garden. Then down to the beach. His legs ached but he kept walking.

She made him eat. Fish and rice and vegetables from the garden. She said he needed strength. He was thinner now. The ribs showing through his skin. But the muscle was still there underneath.

In the second week he tried to work. He checked the irrigation channels. Fixed a broken one. Weeded the garden for an hour before his legs gave out. Hai Yue found him sitting in the dirt.

"Slow," she said.

And then he cried.

Each day he did more. By the third week he was back on the boat. Sanding. Fitting pieces. His hands still worked fine. It was just the legs that were weak.

Hai Yue worked beside him those weeks. She did his share of the heavy work without complaint.

One morning in the fourth week he woke and the pain was mostly gone. Just a dull ache when he walked. The scars were white now. He stood and walked to the stream without limping.

Hai Yue was already up. Making breakfast. She looked at him and nodded.

"Almost," she said.

That day he went back to his full work. The garden and the nets and the boat. His legs held. By evening he was exhausted but it was the good exhaustion of work. Not the exhaustion of fighting his own body.

That night they ate together by the fire. Her belly was much larger now, almost the size of a ripe watermelon, slightly pink and translucent. The child moving inside like breathing veins.

The construction of the boat had progress. He spent days selecting each piece, testing it for strength, rejecting anything with the slightest weakness. Every morning he would work on it, the frame slowly taking shape on the beach.

Hai Yue would watch from the doorway of the hut, one hand on her swollen belly, and sometimes Jang would see something like sadness in her face.

"When the baby comes," he would say, running his hand along the smooth curve of the hull, "We finish this. Seaworthy."

Then he would continue sanding wood, lashing joints. When he worked on it, he could believe in the simple, tangible reality of wood and rope.

"Almost," he said.

## 12

Days before, the fish he caught had clouded eyes that seemed to track him even after death. The water itself felt thicker, more viscous.

Hai Yue stared at the ocean for hours, unmoving. When he spoke to her, she didn't respond immediately, as if listening to something far away that he couldn't hear. Her belly moved as if something thick was sliding behind it.

The water level was much higher now. He noticed.

The night before they came, he dreamed. Long and senseless dreams where one ended and the other immediately began. He had been younger here, him and Tortoise, paddling out to a still water zone in the ocean with plenty of fish. Schools of fishes swam beneath the boys. The water was strangely still. In fact, the water did not move at all. Out of nowhere, a force, a force so strong and primal, pulled the boat whole down, down, more down, another time, into the water. It filled his throat. He tried to swim. He tried everything. But nothing helped. The depth, the darkness awaited him openly.

He woke to find Hai Yue cooking soup. She smiled. He didn't.

Rain hammered the roof, and lightning split the sky every few seconds, turning night into day in violent flashes. Thunder shook the bamboo walls, and the wind howled like something alive and hungry.

"It's time," she said, her voice barely audible over the storm.

Jang had prepared for this. He had clean clothes, fresh water, and a sharp knife to cut the cord. He had made Hai Yue a soft bed of moss and palm fronds in the corner of the hut.

Hai Yue's belly began to move, rippling like water, the skin stretching and contracting.

Then it opened, opening like a mouth, revealing the interior.

And from inside her, eggs emerged.

One, two, few, then tens of eggs. They came out one after another, sliding from her body with wet, sucking sounds, each one the size of a melon, translucent and veined with purple lines that pulsed like blood vessels.

Inside each egg, shadows moved — things with too many limbs, too many faces, too many fins.

Hai Yue gathered them as they came, her hands cradling each one, placing them carefully around the fire pit. The eggs were warm to the touch, radiating heat, and they rocked slightly as the creatures inside shifted position. And they kept coming, kept sliding out of that opening in her belly.

She moved among the eggs, touching each one, humming that wordless song, and the eggs responded, their movements becoming synchronized.

Jang stood frozen, unable to speak.

The torch was still shaking in his hand, casting wild shadows across the walls he had forged, the furniture he had crafted, the home he had built.

Lightning flashed outside, illuminating the eggs in stark white light, and for a moment Jang could see the things inside them.

Hai Yue finally looked at him, waiting, as if asking a question.

He looked at Hai Yue, really looking at her for the first time. She was humming to them, touching each one with tenderness.

Her smile looked ugly: "You're a good man, Jang."

Then came the sound at the door. Three slow, deliberate knocks, audible over the storm.

## 13

"Don't," she said quietly. Her hand reached to stop him, but stopped in mid air. She caught herself.

Jang was already moving toward the door, knife in hand.

He looked at her, his mouth open then closed, the words swallowed, then opened the door.

Lightning illuminated the creature on the beach in stark detail.

Massive, easily ten feet tall, with the thick, powerful body of a seal. Its skin was mottled grey and black, slick with rain and seawater. But where a seal's head should have been was a leathery face with man's eyes and seal's whiskers sprouting from the cheeks. In one of those terrible hands, it gripped a sword — a man-made sword.

The creature's eyes fixed on Hai Yue standing in the doorway of the hut. When it spoke, its voice was deep and resonant: "Careful, Mom."

Then, slowly the creature turned to look at Jang, and in the next flash of lightning, Jang saw its face clearly — it wore an expression of rage. Then darkness again, and the creature's roar — part bark, part human scream — cut through even the thunder.

Jang pretended not to understand.

"Stay inside." He smiled at Hai Yue. Gracefully, Jang bowed to her deeply. In the story she told him, this was how the men in steel armors in the strange continent did. And walked into the storm, closing the door gently behind him.

He breathed in the wetness in the air with a long, deep breath, letting rain wet his long hair.

It was time. He opened his eyes.

The rain was so heavy he could barely see. The beach had become a nightmare landscape of black sand and white foam, the ocean churning with violence. Lightning turned everything into a strobe — flash of light, darkness, flash of light, darkness — making the sight feel disconnected, like watching a series of horrifying paintings come to life.

He charged forward towards the giant thing on the beach, drove his spear powerfully toward the creature's chest, but it moved with terrifying speed, rolling sideways and swinging its sword back at Jang.

The blow caught Jang in the ribs, slicing superficially in his belly, lifting him off his feet and hurling him across the beach. Jang hit the sand hard, rain immediately filling his mouth and nose, the wind knocked out of him.

The creature was on him before he could recover, appearing out of the darkness suddenly. Its weight was crushing, impossibly heavy, pressing him into the mud. Its claws raked across his shoulder, tearing through skin and muscle, and Jang screamed. The sound lost in thunder.

Jang stabbed upward with the knife he kept in his belt, catching the thing in the throat just as the creature's ancient sword came down towards his chest.

In one bold move, Jang knocked away the sword in the seal-man's hand and sliced into the beast's throat. The sword flew left a few meters onto the sand. Black blood sprayed, mixing with the rain, but the creature barely seemed to notice. It reared back and brought its flipper down on Jang's chest like a club, and Jang felt something crack.

Lightning flashed, and in that moment Jang saw the creature's human eyes looking at him with hate. Then darkness, and teeth closing on his shoulder, tearing.

Jang rolled away, gasping, got to his knees in the mud. The rain was washing his blood away as fast as it flowed, turning the beach into a soup of red and black.

The creature circled him, visible only in lightning flashes — here, gone, there, gone — moving in unexpected ways.

Jang quickly forced himself to his feet, swaying, blood running down his chest from the claw marks. Lightning showed him the creature charging, and this time Jang dove aside, bringing his spear across its flank as it passed. The spear bit deep, opening a long gash that poured more black blood onto the sand.

The creature roared. It spun with impossible speed for something so large. Its flipper caught Jang across the face, and he felt his jaw crack, tasted blood mixing with rainwater, went down hard.

Get up. He got to his hands and knees, spitting blood and rainwater. Lightning showed the creature towering over him, raising both flippers for a finishing blow, its face twisted in triumph.

Jang lunged forward instead of back, driving his shoulder into the creature's bulk. They rolled across the sand, rain and blood and mud mixing. Jang stabbed wildly, hitting flesh and bone, and the creature's teeth found his arm, clamping down, grinding, eating.

Jang screamed but didn't let go of the knife, kept stabbing in the darkness, guided by touch. When lightning flashed, he saw his own arm disappearing into the creature's mouth, saw his hand still gripping the knife buried in its side, saw black blood everywhere.

Another blow sent him flying. He hit the ground and rolled, fetching up against something hard — the bamboo stakes.

Jang got to his feet. Standing on his right leg, his left leg useless, torn. A big chunk of his right arm was missing. Blood poured from a dozen wounds, washed away by rain, replaced by fresh blood. The creature was bleeding too badly, its movements slowing.

In the next flash of lightning, he saw it charging one more time, and Jang didn't try to dodge. In the darkness between flashes, he stepped forward to meet it on faith alone against its massive body bearing down on him. He felt its claws sink into his sides, felt teeth close on his shoulder, felt his own blood hot against his skin even in the cold rain.

They hit the stakes together — he'd judged the distance between two stakes — and the sharpened bamboo punched through the creature's body with a wet sound he felt through his own chest. Lightning revealed the creature's human eyes going wide with pain, impaled on multiple stakes, black blood pouring down the bamboo like oil.

Jang heard it die. A long, rattling exhale that sounded too human, too sad.

Jang collapsed beside it in the mud. He'd won his last stand.

He tried to get up. But he could only lie there in the mud, rain hammering his broken body.

He heard footsteps approaching through the mud. Hai Yue's warm hand touched his face, and he managed to smile.

She was carrying him through the storm, back toward the hut. Finally, he let his consciousness go.

## 14

The heat hit him all at once.

Jang's eyes flew open in agony. He was in the bathtub, the water already scalding his torn flesh, and Hai Yue was there, holding him down with hands that were impossibly strong.

His mouth screamed. He tasted the soup base. Herbs, mushroom, bok choy.

His hands gripped the edges of the tub and tried to pull himself up, muscles straining, but she pushed him back under. The scorching water closed over his face. His skin was already half-cooked blistering.

The pain was unlike anything he had ever experienced. Every nerve ending screaming simultaneously, his skin beginning to separate from muscle, muscle beginning to break down.

He thrashed wildly, desperately. Whenever he surfaced, she'd push him back under with firm hands.

"Bye, Jang." She said while adding more vegetables to the tub.

It had ended here.

In the end, he saw his village. He saw his father teaching him to tie knots on a boat sunk a long time ago.

Patient hands guiding his smaller ones. He must be, what, five years old then. The rope was thick and rough against his palms. His father's hands covered his own — weathered, scarred, warm.

"Over, under, through," his father said.

The rope moved through his father's fingers. The knot appeared, perfect, tight.

"You."

Jang tried. His small hands fumbled with the hemp. It tangled, came out wrong. He tried again. Wrong again. His palms hurt from the rough fiber.

His father's hand covered his once more. "Again. Over, under, through."

The hand guided him through the pattern. Over the standing end. Under the loop. Through the gap.

Jang had never asked the sea for anything. Not for luck, not for calm water, not for safe return. Every morning before the light came, he came to the water's edge and stood there without asking.

The rope slid against rope, hemp fibers catching and gripping. His father's callused fingers pressed his smaller ones into the right positions.

## 15

The water demon, her face so beautiful you'd pause a moment to just take in the sight. She stood over the tub, stirring occasionally with a long wooden paddle, keeping the meat from sticking to the bottom, maintaining the heat at just the right temperature.

When the meat was cooked through, tender enough to pull apart easily, she began to feed her children. She used her hands to tear off pieces, dividing it equally among the mewling young, making sure even the smallest got their share. They ate with desperate hunger. She worked through the night, feeding them, humming that wordless song of the deep water. By dawn, the tub was empty except for bones.

Hai Yue carried the leftover to the water. The bones were light. She waded out to her waist and let them go.

She stood in the sea for a long time. It was a beautiful morning. The storm had passed. The sky was clear. The waves were gentle.

Around her, the children swam in the cove. Testing their bodies. Learning. Some were more human. Some more fish.

She wondered what he would have thought. Seeing them.

He had become a true father.

She walked to the hut. Inside, everything was as he had made it. The carved bowls. The sleeping mat. The cradle in the corner, sanded smooth. She touched the cradle's edge. She thought about the other woman. The one in the village.

The waves rolled in. The waves rolled out.

The sun climbed higher. The children called out to her in the water. She walked to the shore. The hut burned behind her, and the boat. The children swam in circles, waiting.

Perhaps each man changed her. A little. In ways she could not name.

She waded into the water. Turned back just once to look at the valley.

The hut was fully engulfed now. Orange flames against blue sky.

Soon there would be nothing left.`,
  },

  // ── 8. Flower ─────────────────────────────────────────────────────────────────
  {
    title: 'Flower',
    slug: 'flower',
    description: 'In which a man won the heart of his love, had he not been eaten by a flower.',
    publishedAt: '2026-05-06T00:00:00Z',
    poem: false,
    content: `## 1

Hinata's father raised Hinata to be a successful archer. He would have been a professional archer himself, had he not been killed during a duel against a one-legged doctor in Semboku.

Hinata grew up in a house full of women. Women came in all shapes and forms. There were fat women, thick women, skinny women, little women, and women as big as sumo rustlers. Young Hinata never managed to figure out where all these women had come from. They spoke different dialects and looked completely dissimilar from one another. It was as if these women had multiplied secretly in the dark corners of the kitchen and the depths of Hinata's father's immense country house, much like tadpoles emerging from eggs.

Even after Hinata's father had been killed in a duel, the women remained. If anything, they had seemingly duplicated further. They claimed different parts of the house, as if they were dividing up conquered territory. These women, living beneath the wooden roof of the country house, spent their days doing farm work and whispering about women's matters.

In summer, the scent of these women became overwhelming. Young Hinata would often seek refuge atop a hayfield hill on the farm, where he could find solitude and the comforting scent of his own skin. He would lie down on the hill, overlooking the entire farm, which, according to the law, would become entirely his once his father's soul was believed to have departed to the underworld in five and a half years.

*I would kick all these monsters out,* Hinata thought, *every last one of them.*

Sometimes, Master Hinata would practice archery in the stinky, muddy yard. He would have pigs running around inside the closed wooden gates and shoot them in the butt. When the pigs — black, white, fat, skinny, old, young — screamed, they emitted sounds with rhythms that originated from their massive guts. Hinata stopped missing his targets after a few winters of boredom/training.

When Hinata turned seven, according to the notebook he maintained, there were, at the time, a total of thirty-two women living in what would soon become his house. To be precise, the number was guesswork. The dungeon was too dark and frightening for young Hinata, preventing him from accurately counting the inhabitants residing there. The Big Mama governed the second floor, while Queen Aiko and her minions occupied the vast living room. The Dark Sisters, with their unwashed hair, pale skin, and yellow teeth, emerged from the dungeon during the night, crawling up the stairs to pilfer food from the kitchen and barn. The Fairy Queens guarded the barn and were tall and strong, resembling tribeswomen of the Japan of old. They would trade supplies with both Big Mama and Queen Aiko in exchange for shampoos and gossip.

All these women regarded Hinata, who occasionally still slept in his cradle on the third floor, as a pet. They often banded together to chase him during the day and night, shouting obscenities at him and then laughing uproariously, as if they had just discovered something new about themselves. Seated in their elegant armchairs with fancy fans, they addressed Hinata by his father's name only. They would then seize him by his long, uncut dark hair and toss young Hinata into the air. Sometimes, Hinata would hit the ceiling, producing a loud and comical sound, before falling back to the ground with a thud. To the women, tossing Hinata around was one of their favorite pastimes.

By the age of eleven, Hinata had grown taller than some of the women in the house. He had become stronger and more resilient, making it harder for Queen Aiko's minions to catch him. He had constructed a small, toilet-sized house separate from the main building using wood he had cut from the forest surrounding the farm. He was now officially living on his own, hunting boars and monkeys in the forest for sustenance and quenching his thirst with water from the stream. He roamed the area with his long, dark hair flowing in the wind.

Soon, Hinata had come to realize that there were no living souls anywhere near the farm. Even if someone were willing to rescue him from his misery, it would take an eternity without proper guidance or maps, as the mountains stacked upon one another, and the trees intertwined their branches to reach ever higher into the sky. No man, with his mortal strength, could penetrate these intricate mazes and hellbound barriers.

The Fairy Queens used to set out for the city to sell rice and purchase supplies on their horses once every few weeks. On one of these occasions, Master Hinata had decided to hide in the rice on the cart to ride along to the city for his escape. It had been a long and bumpy journey. While sticking his nose out for fresh air beneath the rice, Hinata had come close to being spotted several times. Underneath the rice, he had almost run out of breath, feeling as if he were falling into the peaceful, warm embrace of death. But it didn't come for him. It was not his time yet. At night, as the Queens were dozing off on their horses, Hinata leaped off the cart and rolled down a hill.

He had then spent days crawling on all fours, his ankles broken and knees scarred, navigating through streams and mountains shrouded in thick mist. There, the little dirt monkey encountered the first male human he had seen since his father's death in a city he could finally call 'home.'

## 2

In his lifetime, General Hinata had cracked open and investigated the skulls of dozens of men, old or young, rich or poor, handsome or plain. He was often offended by how similar these people's thoughts were despite their visible differences.

In the city, Hinata first tore open the belly of an intern tutor at his school in front of a group of teenagers. The tutor had been attempting to discipline a younger student for his inability to recite a supposedly great poem.

Hinata kneeled before the ripped-open belly of the tutor as he put his head through the opening and started consuming the organs within.

"Just wanted to know what someone like him had inside," explained Hinata.

Then, he had bitten off the ears of two police officers. The police, with the assistance of People's Samurai Uesugi Daichi, had sent this troublesome youngster into the army, where Hinata had learned to wield swords and spears, becoming a respected warrior.

In the wars against neighboring villages, Hinata had carved a mighty path to fame as a well-respected general. He had hunted down a troop of invaders using only his nails and his instinct. By the age of twenty, the young man had earned the revered titles of the Sky General, Hinata the Dog, and the Protector of Men.

Hero Hinata had enjoyed a long life in a massive new castle he had constructed fifteen kilometers west of the city, amid tangled jungles and deadly diseases. Hinata's children had been dispersed throughout the country and kept at a distance from him. All fifty-one of them were deemed illegitimate and had no claim to Hinata's properties. Hinata's slaves had constructed a marble bridge over the swamp. Some claimed that the general had kept pet crocodiles, which were regarded as half-dragons at that time, in the swamp in front of his castle.

At the age of seventy-three, Hinata had understood where the women in his childhood home had come from. He had owned his very own collection of sixty-six women in his castle. The oldest among them was as ancient as a towering pine tree, while the youngest was younger than a full-grown puppy. These women varied in shapes and sizes; there were overweight women, tall women, slender women, large women, and women as petite as squirrels. All of these women, though, had expensive perfumes that masked the raw and unsettling odors of their existence.

One day, the elderly man awoke in a cold sweat, tears staining his enormous bed. His silk bedsheet, imported from China, was drenched; if hung up, it would have dripped like a waterfall. Hinata resolved to leave, to return to his childhood home, to Big Mama, the country house he had fled from a lifetime ago, even though there were no maps, and he couldn't recall the way back. Yet, the old man had made up his mind, and his determination was as unyielding as a rock. He dressed in his childhood kimono that no longer fit. He read one final chapter of his favorite romantic comedy novel in his vast home library. He took one last sip of his signature drink, orange juice. He applied a generous amount of his favorite perfume, then scrubbed it off vigorously. He grabbed a sword and the bow and arrows his father had passed down to him. He grinned sincerely, reminiscing about the way the pigs used to squeal when his arrows struck them. Leaving everything else, including all his treasures, behind, Hinata hit the road, running like an unsteady infant, with his long, white hair billowing in the wind.

On his way out of the castle, General Hinata recalled something. He locked all the doors and gates, telling his sixty-six wives that this was a new game he had devised. Quietly and efficiently, he set the castle ablaze. He watched it burn for hours, smiling, dancing around, and clapping his hands. He heard the women scream and curse from the bridge over the Crocodile River. Then he lit a match and burnt the bridge down too.

Just like that, seventy-three-year-old Hinata got on the journey that would complete his life.

## 3

The mist had been surrounding the plain for as long as the land had emerged out of water. On these hills growing on top of each other, fossils of oceanic creatures were buried under the soil, waiting for the water to come back and wake them from their slumber. There, trees had grown in and out of each other, strangling each other to death, aiming to reach the sky for maximum exposure to sunlight. On such a trail walked the Sky General, the aged adventurer. His body was covered in scars and bites from his enemies and concubines. The diseases were harvesting inside of his decaying body as if they were his pets. Yet his steps were youthful and steady. His long, white hair floated through the air.

The traveler was looking for his father's mansion — his father, who would have been a professional archer, had he not been killed during a duel. There, in the Sky General's memory, lived thirty-two or thirty-three women who had milked and raised him to be the twisted bastard that he was. The biggest of these women were as big as mountains and cities, the evilest of them dressed in blood and bones. They sang and danced with their angelic voices as if there were no one watching, in his father's kingdom, a vast and mysterious land, a land he would like to call 'home.'

For the past ten months, the general had travelled across the most rural areas in the northwest of Japan, hunting prey with his arrows and sleeping lightly throughout the night.

In a deadly hungry and lonely state, he had spotted a dog with just one leg, trailing behind him, waiting for him to fall asleep. It jumped up and down the hills, resembling a strange-looking chicken with its single remaining leg.

As the dog approached the rock on which the general was resting, baring its teeth and attempting to bite his neck, the general kicked it off the ground.

Slowly, as it swore and cursed, the dog landed a few meters away from the general and turned back to its truest form on the moonlit plain. It was, in fact, People's Samurai Uesugi Daichi all along.

Uesugi Daichi stood up tall, as tall as a tree in this forest, full-armored and strong. And he said with his deep and sandy voice: "Hinata, you old bastard, you have sinned, burning sixty-six people alive. The police of the whole state are hunting you down. They want to bring you before the court. Not me. I know well of your kind. I'm here for your head."

General Hinata drew his bow and missed his shot on purpose. Puff! The arrow went straight into the trunk of a tree.

Silently, the general and the giant drew their swords. The giant's sword was made of soil, tears, and ocean.

Something was agreed in such silence.

Without saying one more word, the two fought for two whole hours in their duel. As Daichi the Samurai fought, a sound of flute music, dark and sweet, came out of his gigantic body. It rose in slow ripples, then fell. The duel ended with Hinata sawing off the samurai's head and skinning the rest of the giant's body. The blood and other bodily fluids of the Samurai formed a colorful pond beneath his great, red, skinless body.

Hinata slept for a few hours after the duel. He was woken up by the intense smell of the giant's corpse. Hinata got up. There was not a single new bruise or scar on the old man's body. Even on his kimono, there was not a single cut.

Continuing his journey, the General arrived at a place that could have been what he used to call 'The Moving Forest' when he was a child. This suggested that the country house might be close. He climbed a gigantic breadfruit tree and sat on a branch for hours, waiting for it to move.

And it did. Initially, it walked with casual paces and elegant steps. Then it began to run, dancing powerfully with the other trees under the spell of the fog and moonlight. The fog thickened as the trees danced, rendering every movement unpredictable and perilous for our general, who clung to the branches. At the end of the dance, the general fell from the branch and was trodden upon by another tree. He believed that his arm must have been crushed by the enormous tree that had stepped on it. However, there wasn't a single bruise on that arm, and not even his kimono suffered the tiniest tear.

As the fog was burned away by the rising sun, Master Hinata found himself standing in the middle of a field of flowers. The flowers came in all shapes and forms. There were tie-dye flowers, fat flowers, camouflage flowers, skinny flowers, flowers so tall they could reach the sun, flowers that were discussing Chinese philosophies, flowers that shone with neon light. And there, the general saw his death, his ending, his lover, his friend — a big, red flower, just big enough to eat him up in one bite.

The flower shook slightly in the warm, tender summer wind. Its petals were red, so red that it looked like it was from a painting. The petals embraced the old man, hugging him into its pistils.

As the flower was consuming him, Hinata laughed out loud.

Damn this flower.`,
  },
]

// ─── Server action ────────────────────────────────────────────────────────────

async function runImport(): Promise<{ imported: string[]; skipped: string[]; errors: string[] }> {
  'use server'
  const supabase = await createClient()
  const imported: string[] = []
  const skipped: string[] = []
  const errors: string[] = []

  for (const story of STORIES) {
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('works')
      .select('id')
      .eq('slug', story.slug)
      .single()

    if (existing) {
      skipped.push(story.title)
      continue
    }

    const doc = story.poem ? poemToDoc(story.content) : proseToDoc(story.content)

    const { data: work, error: workErr } = await supabase
      .from('works')
      .insert({
        title: story.title,
        slug: story.slug,
        type: story.type ?? 'story',
        description: story.description,
        status: 'published',
        created_at: story.publishedAt,
        updated_at: story.publishedAt,
      })
      .select('id')
      .single()

    if (workErr || !work) {
      errors.push(`${story.title}: ${workErr?.message ?? 'unknown error'}`)
      continue
    }

    const { error: chapErr } = await supabase.from('chapters').insert({
      work_id: work.id,
      title: story.title,
      slug: `${story.slug}-ch`,
      order_num: 1,
      status: 'published',
      content: doc,
      created_at: story.publishedAt,
      updated_at: story.publishedAt,
    })

    if (chapErr) {
      errors.push(`${story.title} (chapter): ${chapErr.message}`)
    } else {
      imported.push(story.title)
    }
  }

  return { imported, skipped, errors }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ImportPage() {
  return (
    <AdminLayout>
      <div className="max-w-lg">
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
        >
          Import from Medium
        </h1>
        <p
          className="text-sm mb-8"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
        >
          Imports all 7 short stories from @tjho1818 as published works. Already-imported stories
          (matched by slug) are skipped safely.
        </p>

        <div className="mb-8 space-y-2">
          {STORIES.map(s => (
            <div
              key={s.slug}
              className="flex items-center gap-3 text-sm py-2 border-b"
              style={{ borderColor: 'var(--border)', fontFamily: "'Inter', sans-serif" }}
            >
              <span style={{ color: 'var(--text-faint)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.poem ? 'poem' : 'prose'}
              </span>
              <span style={{ color: 'var(--text)' }}>{s.title}</span>
            </div>
          ))}
        </div>

        <ImportButton action={runImport} />
      </div>
    </AdminLayout>
  )
}

// ─── Client button (needs interactivity for result display) ──────────────────

function ImportButton({ action }: { action: () => Promise<{ imported: string[]; skipped: string[]; errors: string[] }> }) {
  // We'll use a plain form — the result redirect happens server-side
  // For richer feedback, we keep it simple: submit → redirect to /admin
  return (
    <form
      action={async () => {
        'use server'
        await runImport()
        redirect('/admin')
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-85"
        style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'var(--text)', color: 'var(--bg)' }}
      >
        Import 8 works →
      </button>
    </form>
  )
}
