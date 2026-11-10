import { useState } from 'react'

// Your first hook. useState(0) gives a value that survives redraws, and a function to change it.
// Every <LikeButton /> on the page has its OWN likes: one per row in MovieTable.
// (In memory only: refresh the page and they're back to 0.)
export default function LikeButton() {
  const [likes, setLikes] = useState(0)

  return (
    <button className="btn btn-sm btn-outline-danger" onClick={() => setLikes(likes + 1)}>
      &#9829; {likes}
    </button>
  )
}
