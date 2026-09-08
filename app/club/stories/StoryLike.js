"use client"
import {useEffect,useState} from 'react'
export default function StoryLike({slug}){
 const key=`mrgreys_story_like_${slug}`; const [liked,setLiked]=useState(false); const [busy,setBusy]=useState(false)
 useEffect(()=>{setLiked(localStorage.getItem(key)==='1')},[key])
 async function like(){if(liked||busy)return;setBusy(true);try{const r=await fetch('/api/stories/like',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug})});if(r.ok){localStorage.setItem(key,'1');setLiked(true)}}finally{setBusy(false)}}
 return <div className="storyLike"><p>Páčil sa vám tento príbeh?</p><button onClick={like} disabled={liked||busy}>{liked?'❤️ Páči sa mi':'♡ Páči sa mi tento príbeh'}</button></div>
}
