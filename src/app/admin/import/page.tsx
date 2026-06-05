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
  publishedAt: string; poem: boolean; content: string
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

  // ── 7. Flower ─────────────────────────────────────────────────────────────────
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
        type: 'story',
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
        Import 7 stories →
      </button>
    </form>
  )
}
